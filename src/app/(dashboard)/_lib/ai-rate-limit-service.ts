"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type AIUsageType = "predictions" | "insights" | "chatbot";

export interface AIUsageStatus {
  totalUsed: number;
  totalLimit: number;
  remaining: number;
  canUseAI: boolean;
  nextResetAt: Date;
  // Breakdown by feature for display purposes
  predictionsUsed: number;
  insightsUsed: number;
  chatbotUsed: number;
}

const DAILY_LIMIT = 25;

/**
 * Check if user can use AI features (shared limit across all AI features)
 */
export async function checkAIUsage(
  userId: string,
  usageType: AIUsageType
): Promise<{ allowed: boolean; status: AIUsageStatus; error?: string }> {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get or create today's usage record
    let { data: usage, error } = await supabase
      .from("ai_usage_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // If no record exists, create one
    if (!usage) {
      const { data: newUsage, error: insertError } = await supabase
        .from("ai_usage_rate_limits")
        .insert({
          user_id: userId,
          usage_date: today,
          predictions_used: 0,
          insights_used: 0,
          chatbot_used: 0,
          total_used: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      usage = newUsage;
    }

    // Calculate next reset time (midnight tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const status: AIUsageStatus = {
      totalUsed: usage.total_used,
      totalLimit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - usage.total_used),
      canUseAI: usage.total_used < DAILY_LIMIT,
      nextResetAt: tomorrow,
      predictionsUsed: usage.predictions_used,
      insightsUsed: usage.insights_used,
      chatbotUsed: usage.chatbot_used,
    };

    return {
      allowed: status.canUseAI,
      status,
      error: status.canUseAI
        ? undefined
        : `Daily AI limit reached (25/${DAILY_LIMIT}). Resets at midnight.`,
    };
  } catch (error) {
    console.error("Error checking AI usage:", error);
    return {
      allowed: false,
      status: getDefaultStatus(),
      error: "Failed to check usage limits",
    };
  }
}

/**
 * Increment usage for a specific AI feature (counts toward shared limit)
 */
export async function incrementAIUsage(
  userId: string,
  usageType: AIUsageType
): Promise<{ success: boolean; status?: AIUsageStatus; error?: string }> {
  try {
    const today = new Date().toISOString().split("T")[0];

    // First check if allowed
    const { allowed, status: currentStatus } = await checkAIUsage(
      userId,
      usageType
    );
    if (!allowed) {
      return {
        success: false,
        error: `Daily AI limit reached (25/${DAILY_LIMIT})`,
      };
    }

    // Determine which column to increment
    let updateData: Record<string, number> = {
      total_used: currentStatus.totalUsed + 1,
    };
    
    switch (usageType) {
      case "predictions":
        updateData.predictions_used = currentStatus.predictionsUsed + 1;
        break;
      case "insights":
        updateData.insights_used = currentStatus.insightsUsed + 1;
        break;
      case "chatbot":
        updateData.chatbot_used = currentStatus.chatbotUsed + 1;
        break;
    }

    // Update usage
    const { data: updatedUsage, error } = await supabase
      .from("ai_usage_rate_limits")
      .update(updateData)
      .eq("user_id", userId)
      .eq("usage_date", today)
      .select()
      .single();

    if (error) throw error;

    // Get updated status
    const { status: newStatus } = await checkAIUsage(userId, usageType);

    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Error incrementing AI usage:", error);
    return {
      success: false,
      error: "Failed to increment usage",
    };
  }
}

/**
 * Get current usage status
 */
export async function getAIUsageStatus(
  userId: string
): Promise<AIUsageStatus> {
  const { status } = await checkAIUsage(userId, "predictions");
  return status;
}

/**
 * Format time remaining until next reset
 */
export function formatTimeRemaining(nextResetAt: Date): string {
  const now = new Date();
  const diff = nextResetAt.getTime() - now.getTime();

  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getDefaultStatus(): AIUsageStatus {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    totalUsed: 0,
    totalLimit: DAILY_LIMIT,
    remaining: DAILY_LIMIT,
    canUseAI: true,
    nextResetAt: tomorrow,
    predictionsUsed: 0,
    insightsUsed: 0,
    chatbotUsed: 0,
  };
}
