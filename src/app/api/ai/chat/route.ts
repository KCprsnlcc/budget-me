

import { NextRequest, NextResponse } from "next/server";
import {
  validateAIRequest,
  validatePromptLength,
  getOpenRouterApiKey,
  OPENROUTER_API_URL,
} from "@/lib/ai-security";

export async function POST(request: NextRequest) {

  const result = await validateAIRequest(request, "/api/ai/chat");
  if ("error" in result) return result.error;
  const { context } = result;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, modelId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
  }

  if (!modelId || typeof modelId !== "string") {
    return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
  }

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const validationError = validatePromptLength(msg.content);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }
  }

  try {
    const apiKey = getOpenRouterApiKey();

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "BudgetSense AI",
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[AI-CHAT] OpenRouter error:", response.status, errorData);

      const statusMap: Record<number, string> = {
        401: "AI service configuration error. Contact support.",
        402: "Insufficient AI credits. Please switch to a free model.",
        429: "AI service rate limit exceeded. Please wait a moment.",
      };

      return NextResponse.json(
        {
          error: statusMap[response.status] || errorData.error?.message || `AI service error: ${response.status}`,
        },
        { status: response.status === 401 ? 500 : response.status }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: "No response from AI model. Please try again." },
        { status: 502 }
      );
    }

    console.log(
      `✅ [AI-CHAT] user=${context.userId} model=${modelId} response_length=${aiContent.length}`
    );

    return NextResponse.json({
      content: aiContent.trim(),
      model: modelId,
    });
  } catch (err) {
    console.error("[AI-CHAT] Server error:", err);
    return NextResponse.json(
      { error: "Failed to communicate with AI service" },
      { status: 500 }
    );
  }
}
