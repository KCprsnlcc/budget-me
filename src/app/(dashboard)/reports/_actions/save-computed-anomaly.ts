"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnomalyAlert } from "../_components/types";

/**
 * Save a computed anomaly to the database
 * This allows computed anomalies to be tracked and resolved like database anomalies
 */
export async function saveComputedAnomaly(anomaly: AnomalyAlert, userId: string) {
  try {
    const supabase = await createClient();

    // Map UI anomaly type to database anomaly type
    const anomalyTypeMap: Record<string, string> = {
      'unusual-spending': 'spending_spike',
      'duplicate-transaction': 'data_inconsistency',
      'budget-overspend': 'spending_spike',
      'income-anomaly': 'income_drop',
    };

    const dbAnomalyType = anomalyTypeMap[anomaly.type] || 'unusual_pattern';

    // Check if this anomaly already exists (by checking similar anomalies)
    const { data: existing, error: checkError } = await supabase
      .from("admin_anomalies")
      .select("id")
      .eq("user_id", userId)
      .eq("anomaly_type", dbAnomalyType)
      .eq("resolution_status", "open")
      .gte("detected_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(1);

    if (checkError) {
      console.error("Error checking existing anomaly:", checkError);
    }

    // If similar anomaly exists, return its ID
    if (existing && existing.length > 0) {
      return { success: true, id: existing[0].id, isNew: false };
    }

    // Insert new anomaly
    const { data, error } = await supabase
      .from("admin_anomalies")
      .insert({
        user_id: userId,
        anomaly_type: dbAnomalyType,
        severity: anomaly.severity,
        data_source: 'transactions',
        anomaly_data: {
          description: anomaly.description,
          amount: anomaly.amount,
          category: anomaly.category,
          trend: anomaly.trend,
        },
        resolution_status: 'open',
        detection_method: 'automated',
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving computed anomaly:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id, isNew: true };
  } catch (error: any) {
    console.error("Error saving computed anomaly:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch save multiple computed anomalies
 */
export async function saveComputedAnomalies(anomalies: AnomalyAlert[], userId: string) {
  try {
    const results = await Promise.all(
      anomalies.map(anomaly => saveComputedAnomaly(anomaly, userId))
    );

    const savedIds = results
      .filter(r => r.success && r.id)
      .map(r => ({ oldId: '', newId: r.id!, isNew: r.isNew }));

    return { success: true, savedIds };
  } catch (error: any) {
    console.error("Error batch saving computed anomalies:", error);
    return { success: false, error: error.message, savedIds: [] };
  }
}
