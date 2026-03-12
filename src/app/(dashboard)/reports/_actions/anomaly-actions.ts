"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function dismissAnomaly(anomalyId: string, userId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("admin_anomalies")
      .delete()
      .eq("id", anomalyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error dismissing anomaly:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    console.error("Error dismissing anomaly:", error);
    return { success: false, error: error.message };
  }
}

export async function resolveAnomaly(anomalyId: string, userId: string, notes?: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_anomalies")
      .update({
        resolution_status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: notes || "Resolved by user",
        updated_at: new Date().toISOString(),
      })
      .eq("id", anomalyId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error resolving anomaly:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/reports");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error resolving anomaly:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchResolvedAnomalies(userId: string, timeframe: string = "month") {
  try {
    const supabase = await createClient();

    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const { data, error } = await supabase
      .from("admin_anomalies")
      .select("*")
      .eq("user_id", userId)
      .eq("resolution_status", "resolved")
      .gte("detected_at", startDate.toISOString())
      .order("resolved_at", { ascending: false });

    if (error) {
      console.error("Error fetching resolved anomalies:", error);
      return { success: false, error: error.message, data: [] };
    }

    const transformedData = data.map((anomaly) => ({
      id: anomaly.id,
      type: anomaly.anomaly_type as any,
      title: anomaly.anomaly_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: anomaly.anomaly_data?.description || "No description available",
      severity: anomaly.severity as "low" | "medium" | "high",
      timestamp: new Date(anomaly.detected_at).toLocaleDateString(),
      amount: anomaly.anomaly_data?.amount,
      category: anomaly.anomaly_data?.category,
      trend: anomaly.anomaly_data?.trend,
      status: anomaly.resolution_status === "resolved" ? "resolved" : "dismissed",
      resolvedAt: anomaly.resolved_at,
      resolutionNotes: anomaly.resolution_notes,
    }));

    return { success: true, data: transformedData };
  } catch (error: any) {
    console.error("Error fetching resolved anomalies:", error);
    return { success: false, error: error.message, data: [] };
  }
}
