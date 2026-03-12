/**
 * POST /api/ai/insights
 * 
 * Secure backend proxy for AI financial insights (predictions page) → OpenRouter.
 * 
 * Security layers:
 * - Supabase session authentication
 * - IP + User rate limiting (10 req/min)
 * - CSRF origin validation
 * - Suspicious user-agent blocking
 * - Input validation
 * - Request metadata logging
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateAIRequest,
  getOpenRouterApiKey,
  OPENROUTER_API_URL,
} from "@/lib/ai-security";

const AI_MODEL = "openai/gpt-oss-20b";

export async function POST(request: NextRequest) {
  // ─── Security validation ─────────────────────────────────────────
  const result = await validateAIRequest(request, "/api/ai/insights");
  if ("error" in result) return result.error;
  const { context } = result;

  // ─── Parse & validate body ────────────────────────────────────────
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { systemPrompt, userPrompt } = body;

  if (!systemPrompt || typeof systemPrompt !== "string") {
    return NextResponse.json({ error: "System prompt is required" }, { status: 400 });
  }

  if (!userPrompt || typeof userPrompt !== "string") {
    return NextResponse.json({ error: "User prompt is required" }, { status: 400 });
  }

  // Validate prompt lengths
  if (systemPrompt.length > 10_000) {
    return NextResponse.json({ error: "System prompt too long" }, { status: 400 });
  }
  if (userPrompt.length > 50_000) {
    return NextResponse.json({ error: "User prompt too long" }, { status: 400 });
  }

  // ─── Forward to OpenRouter (server-side) ──────────────────────────
  try {
    const apiKey = getOpenRouterApiKey();

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "BudgetSense AI Predictions",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[AI-INSIGHTS] OpenRouter error:", response.status, errorData);
      return NextResponse.json(
        { error: errorData.error?.message || `AI service error: ${response.status}` },
        { status: response.status === 401 ? 500 : response.status }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 502 }
      );
    }

    console.log(
      `✅ [AI-INSIGHTS] user=${context.userId} response_length=${aiContent.length}`
    );

    return NextResponse.json({ content: aiContent });
  } catch (err) {
    console.error("[AI-INSIGHTS] Server error:", err);
    return NextResponse.json(
      { error: "Failed to communicate with AI service" },
      { status: 500 }
    );
  }
}
