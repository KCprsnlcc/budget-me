

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

const RATE_LIMIT_WINDOW_MS = 60_000; 
const RATE_LIMIT_MAX_REQUESTS = 10;  
const MAX_PROMPT_LENGTH = 50_000;     

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

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

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

const requestLogs: AIRequestLog[] = [];
const MAX_LOG_SIZE = 1000;

function logRequest(log: AIRequestLog): void {
  requestLogs.push(log);
  if (requestLogs.length > MAX_LOG_SIZE) {
    requestLogs.splice(0, requestLogs.length - MAX_LOG_SIZE);
  }
  
  const emoji = log.status === "allowed" ? "✅" : "🚫";
  console.log(
    `${emoji} [AI-SEC] ${log.timestamp} | ${log.route} | user=${log.userId} | ip=${log.ip} | prompt=${log.promptLength}ch | ${log.status}${log.blockReason ? ` (${log.blockReason})` : ""}`
  );
}

export function getRequestLogs(): AIRequestLog[] {
  return [...requestLogs];
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function validateAIRequest(
  request: NextRequest,
  routeName: string
): Promise<{ context: AISecurityContext } | { error: NextResponse }> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

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

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = [
    configuredSiteUrl,
    
    configuredSiteUrl?.replace(/\/$/, ''), 
    configuredSiteUrl?.replace(/^http:/, 'https:'), 
    configuredSiteUrl?.replace(/^http:/, 'https:').replace(/\/$/, ''), 
    "http://localhost:3000",
     "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://192.168.1.1:3000",
  ].filter(Boolean);

  let requestOrigin: string | null = null;
  try {
    requestOrigin = origin || (referer ? new URL(referer).origin : null);
  } catch (err) {
    
    console.warn("[AI-SEC] Invalid referer URL:", referer);
  }

  if (requestOrigin && allowedOrigins.length > 0) {
    const isAllowed = allowedOrigins.some(
      (allowed) => {
        if (!allowed) return false;
        
        return requestOrigin === allowed || requestOrigin.startsWith(allowed);
      }
    );
    
    if (!isAllowed) {
      
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

export function validatePromptLength(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return "Message content is required";
  }
  if (content.length > MAX_PROMPT_LENGTH) {
    return `Message too long (${content.length} chars). Maximum is ${MAX_PROMPT_LENGTH} characters.`;
  }
  return null;
}

export function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY || "";
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }
  return key;
}

export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
