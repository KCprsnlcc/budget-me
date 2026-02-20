import { createClient } from "@/lib/supabase/client";
import type { GoalType, GoalFormState, GoalCategory } from "../_components/types";

const supabase = createClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICON_MAP: Record<string, string> = {
  emergency: "shield-check",
  housing: "home-2",
  education: "graduation-cap",
  travel: "airplane",
  transport: "car",
  electronics: "laptop",
  other: "target",
};

function normalizeCategory(dbCategory: string | null): GoalCategory {
  if (!dbCategory || dbCategory === "general") return "other";
  const valid: GoalCategory[] = [
    "emergency",
    "housing",
    "education",
    "travel",
    "transport",
    "electronics",
    "other",
  ];
  return valid.includes(dbCategory as GoalCategory)
    ? (dbCategory as GoalCategory)
    : "other";
}

/** Map a raw DB row to the UI GoalType. */
function mapRow(row: Record<string, any>): GoalType {
  const category = normalizeCategory(row.category);
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.goal_name,
    description: row.description ?? null,
    target: Number(row.target_amount),
    current: Number(row.current_amount),
    priority: row.priority ?? "medium",
    status: row.status ?? "in_progress",
    category,
    deadline: row.target_date ?? "",
    monthlyContribution: Number(row.auto_contribute_amount ?? 0),
    isFamily: row.is_family_goal ?? false,
    family_id: row.family_id ?? null,
    notes: row.notes ?? null,
    icon: CATEGORY_ICON_MAP[category] ?? "target",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// READ — Goals list
// ---------------------------------------------------------------------------

export type GoalFilters = {
  status?: string;
  priority?: string;
  category?: string;
  month?: number | "all";
  year?: number | "all";
};

export async function fetchGoalsForPage(
  userId: string,
  filters: GoalFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: GoalType[]; error: string | null; count: number | null }> {
  let query = supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.month && filters.month !== "all") {
    query = query.eq("extract(month from created_at)", filters.month);
  }
  if (filters.year && filters.year !== "all") {
    query = query.eq("extract(year from created_at)", filters.year);
  }

  // Get total count for pagination (apply same filters as main query)
  let countQuery = supabase
    .from("goals")
    .select("count", { count: "exact", head: true })
    .eq("user_id", userId);

  // Apply the same filters to count query
  if (filters.status) {
    countQuery = countQuery.eq("status", filters.status);
  }
  if (filters.priority) {
    countQuery = countQuery.eq("priority", filters.priority);
  }
  if (filters.category) {
    countQuery = countQuery.eq("category", filters.category);
  }
  if (filters.month && filters.month !== "all") {
    countQuery = countQuery.eq("extract(month from created_at)", filters.month);
  }
  if (filters.year && filters.year !== "all") {
    countQuery = countQuery.eq("extract(year from created_at)", filters.year);
  }

  const { count } = await countQuery;

  // Add pagination to main query
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message, count: null };
  return { data: (data ?? []).map(mapRow), error: null, count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createGoal(
  userId: string,
  form: GoalFormState
): Promise<{ data: GoalType | null; error: string | null }> {
  const target = parseFloat(form.target);
  if (isNaN(target) || target <= 0) {
    return { data: null, error: "Target amount must be greater than zero." };
  }

  const monthlyContribution = parseFloat(form.monthlyContribution) || 0;

  const insert: Record<string, any> = {
    user_id: userId,
    goal_name: form.name,
    target_amount: target,
    current_amount: 0,
    priority: form.priority,
    category: form.category,
    target_date: form.deadline || null,
    is_family_goal: form.isFamily,
    auto_contribute_amount: monthlyContribution,
    status: "in_progress",
  };

  const { data, error } = await supabase
    .from("goals")
    .insert(insert)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateGoal(
  goalId: string,
  form: GoalFormState
): Promise<{ data: GoalType | null; error: string | null }> {
  const target = parseFloat(form.target);
  if (isNaN(target) || target <= 0) {
    return { data: null, error: "Target amount must be greater than zero." };
  }

  const monthlyContribution = parseFloat(form.monthlyContribution) || 0;

  const update: Record<string, any> = {
    goal_name: form.name,
    target_amount: target,
    priority: form.priority,
    category: form.category,
    target_date: form.deadline || null,
    is_family_goal: form.isFamily,
    auto_contribute_amount: monthlyContribution,
  };

  const { data, error } = await supabase
    .from("goals")
    .update(update)
    .eq("id", goalId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteGoal(
  goalId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);
  if (error) return { error: error.message };
  return { error: null };
}

// ---------------------------------------------------------------------------
// CONTRIBUTE
// ---------------------------------------------------------------------------

export async function contributeToGoal(
  goalId: string,
  amount: number
): Promise<{ data: GoalType | null; error: string | null }> {
  if (amount <= 0) {
    return { data: null, error: "Contribution amount must be greater than zero." };
  }

  // Fetch current state
  const { data: current, error: fetchError } = await supabase
    .from("goals")
    .select("current_amount, target_amount, status")
    .eq("id", goalId)
    .single();

  if (fetchError) return { data: null, error: fetchError.message };

  const newAmount = Number(current.current_amount) + amount;
  const isCompleted = newAmount >= Number(current.target_amount);

  const update: Record<string, any> = {
    current_amount: newAmount,
  };

  if (isCompleted && current.status !== "completed") {
    update.status = "completed";
    update.completed_date = new Date().toISOString().split("T")[0];
  }

  const { data, error } = await supabase
    .from("goals")
    .update(update)
    .eq("id", goalId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------

export type GoalSummary = {
  activeGoals: number;
  totalSaved: number;
  monthlyContributions: number;
  completedGoals: number;
};

export async function fetchGoalSummary(
  userId: string
): Promise<GoalSummary> {
  const { data } = await supabase
    .from("goals")
    .select("status, current_amount, auto_contribute_amount")
    .eq("user_id", userId);

  let activeGoals = 0;
  let totalSaved = 0;
  let monthlyContributions = 0;
  let completedGoals = 0;

  for (const row of data ?? []) {
    totalSaved += Number(row.current_amount);
    if (row.status === "completed") {
      completedGoals++;
    } else {
      activeGoals++;
      monthlyContributions += Number(row.auto_contribute_amount ?? 0);
    }
  }

  return { activeGoals, totalSaved, monthlyContributions, completedGoals };
}
