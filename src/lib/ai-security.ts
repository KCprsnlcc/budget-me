/**
 * AI Security Middleware & Utilities
 * Centralized security layer for all AI API routes.
 * 
 * - Session authentication via Supabase
 * - IP + User-based rate limiting (10 req/min)
 * - CSRF origin validation
 * - Suspicious user-agent blocking (e.g., JSHunter Security Analyzer)
 * - Input validation (max prompt length, required fields)
 * - Request metadata logging for anomaly detection
 */

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// Types
// =============================================================================

export interface AISecurityContext {
  userId: string;
  userEmail: string;
  ip: string;
  sessionId: string;
}

export interface AIRequestLog {
  timestamp: string;
  ip: string;
  userId: string;
  sessionId: string;
  userAgent: string;
  origin: string | null;
  route: string;
  promptLength: number;
  status: "allowed" | "blocked";
  blockReason?: string;
}

// =============================================================================
// Constants
// =============================================================================

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;  // max 10 per minute per user/IP
const MAX_PROMPT_LENGTH = 50_000;     // max characters per prompt

// Suspicious user-agent patterns to block
const BLOCKED_USER_AGENTS = [
  "jshunter",
  "security analyzer",
  "vulnerability scanner",
  "nuclei",
  "sqlmap",
  "nikto",
  "dirbuster",
  "gobuster",
  "wfuzz",
  "burpsuite",
  "zap",
  "arachni",
  "nessus",
  "openvas",
  "w3af",
  "skipfish",
  "crawlerbot",
  "scanbot",
];

// =============================================================================
// In-Memory Rate Limiter (per-process; use Redis in production)
// =============================================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60_000);
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetMs: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const resetMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetMs };
  }

  entry.count++;
  const resetMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetMs };
}

// =============================================================================
// Request Logging
// =============================================================================

const requestLogs: AIRequestLog[] = [];
const MAX_LOG_SIZE = 1000;

function logRequest(log: AIRequestLog): void {
  requestLogs.push(log);
  if (requestLogs.length > MAX_LOG_SIZE) {
    requestLogs.splice(0, requestLogs.length - MAX_LOG_SIZE);
  }
  // Also log to server console for monitoring
  const emoji = log.status === "allowed" ? "✅" : "🚫";
  console.log(
    `${emoji} [AI-SEC] ${log.timestamp} | ${log.route} | user=${log.userId} | ip=${log.ip} | prompt=${log.promptLength}ch | ${log.status}${log.blockReason ? ` (${log.blockReason})` : ""}`
  );
}

export function getRequestLogs(): AIRequestLog[] {
  return [...requestLogs];
}

// =============================================================================
// Client IP extraction
// =============================================================================

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// =============================================================================
// Main Security Middleware
// =============================================================================

export async function validateAIRequest(
  request: NextRequest,
  routeName: string
): Promise<{ context: AISecurityContext } | { error: NextResponse }> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // ─── 1. Block suspicious user agents ───────────────────────────────────
  const lowerUA = userAgent.toLowerCase();
  for (const blocked of BLOCKED_USER_AGENTS) {
    if (lowerUA.includes(blocked)) {
      logRequest({
        timestamp: new Date().toISOString(),
        ip,
        userId: "unknown",
        sessionId: "unknown",
        userAgent,
        origin,
        route: routeName,
        promptLength: 0,
        status: "blocked",
        blockReason: `Blocked user-agent: ${blocked}`,
      });
      return {
        error: NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        ),
      };
    }
  }

  // ─── 2. Validate request origin (CSRF protection) ─────────────────────
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = [
    configuredSiteUrl,
    // Also allow the same domain with/without trailing slash and http/https variants
    configuredSiteUrl?.replace(/\/$/, ''), // Remove trailing slash
    configuredSiteUrl?.replace(/^http:/, 'https:'), // HTTPS variant
    configuredSiteUrl?.replace(/^http:/, 'https:').replace(/\/$/, ''), // HTTPS without trailing slash
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  // Check both origin and referer headers
  let requestOrigin: string | null = null;
  try {
    requestOrigin = origin || (referer ? new URL(referer).origin : null);
  } catch (err) {
    // Invalid URL in referer, skip origin validation
    console.warn("[AI-SEC] Invalid referer URL:", referer);
  }
  
  // Only validate origin if we have both a request origin and configured allowed origins
  // Skip validation for same-origin requests (when origin header is missing)
  if (requestOrigin && allowedOrigins.length > 0) {
    const isAllowed = allowedOrigins.some(
      (allowed) => {
        if (!allowed) return false;
        // Exact match or starts with (for subdomains)
        return requestOrigin === allowed || requestOrigin.startsWith(allowed);
      }
    );
    
    if (!isAllowed) {
      // Log but don't block in development (localhost)
      const isDevelopment = requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1");
      
      console.warn("[AI-SEC] Origin validation:", {
        requestOrigin,
        allowedOrigins,
        configuredSiteUrl,
        isDevelopment,
      });
      
      logRequest({
        timestamp: new Date().toISOString(),
        ip,
        userId: "unknown",
        sessionId: "unknown",
        userAgent,
        origin,
        route: routeName,
        promptLength: 0,
        status: isDevelopment ? "allowed" : "blocked",
        blockReason: isDevelopment ? `Dev origin: ${requestOrigin}` : `Invalid origin: ${requestOrigin} (allowed: ${allowedOrigins.join(", ")})`,
      });
      
      // Only block in production
      if (!isDevelopment) {
        return {
          error: NextResponse.json(
            { error: "Invalid request origin" },
            { status: 403 }
          ),
        };
      }
    }
  }

  // ─── 3. Authenticate user via Supabase session ────────────────────────
  let userId = "unknown";
  let userEmail = "unknown";
  let sessionId = "unknown";

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op for API routes — cookies are read-only here
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[AI-SEC] Authentication failed:", {
        error: authError?.message,
        hasUser: !!user,
        route: routeName,
        ip,
        cookies: request.cookies.getAll().map(c => c.name).join(", "),
      });
      
      logRequest({
        timestamp: new Date().toISOString(),
        ip,
        userId: "unauthenticated",
        sessionId: "none",
        userAgent,
        origin,
        route: routeName,
        promptLength: 0,
        status: "blocked",
        blockReason: authError?.message || "No valid session",
      });
      return {
        error: NextResponse.json(
          { error: "Authentication required. Please log in." },
          { status: 401 }
        ),
      };
    }

    userId = user.id;
    userEmail = user.email || "unknown";

    // Get session for session ID tracking
    const { data: { session } } = await supabase.auth.getSession();
    sessionId = session?.access_token?.slice(-12) || "unknown";
  } catch (err) {
    console.error("[AI-SEC] Auth system error:", err);
    logRequest({
      timestamp: new Date().toISOString(),
      ip,
      userId: "error",
      sessionId: "error",
      userAgent,
      origin,
      route: routeName,
      promptLength: 0,
      status: "blocked",
      blockReason: "Auth system error",
    });
    return {
      error: NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 500 }
      ),
    };
  }

  // ─── 4. Rate limiting (both IP-based and user-based) ──────────────────
  const ipLimit = checkRateLimit(`ip:${ip}`);
  const userLimit = checkRateLimit(`user:${userId}`);

  if (!ipLimit.allowed || !userLimit.allowed) {
    const resetMs = Math.max(ipLimit.resetMs, userLimit.resetMs);
    logRequest({
      timestamp: new Date().toISOString(),
      ip,
      userId,
      sessionId,
      userAgent,
      origin,
      route: routeName,
      promptLength: 0,
      status: "blocked",
      blockReason: !ipLimit.allowed ? "IP rate limit exceeded" : "User rate limit exceeded",
    });
    return {
      error: NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil(resetMs / 1000)} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetMs / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
          },
        }
      ),
    };
  }

  return {
    context: {
      userId,
      userEmail,
      ip,
      sessionId,
    },
  };
}

// =============================================================================
// Input validation helpers
// =============================================================================

export function validatePromptLength(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return "Message content is required";
  }
  if (content.length > MAX_PROMPT_LENGTH) {
    return `Message too long (${content.length} chars). Maximum is ${MAX_PROMPT_LENGTH} characters.`;
  }
  return null;
}

// =============================================================================
// OpenRouter API key (server-only)
// =============================================================================

export function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY || "";
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }
  return key;
}

export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
