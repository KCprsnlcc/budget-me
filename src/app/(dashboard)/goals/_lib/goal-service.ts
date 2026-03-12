import { createClient } from "@/lib/supabase/client";
import { formatDateForInput, getPhilippinesNow, formatInPhilippines } from "@/lib/timezone";
import type { GoalType, GoalFormState, GoalCategory, GoalContribution } from "../_components/types";

const supabase = createClient();

const CATEGORY_ICONS: Record<string, string> = {
  emergency: "shield-check",
  vacation: "airplane",
  house: "home-2",
  car: "car",
  education: "graduation-cap",
  retirement: "trending-up",
  debt: "arrow-right",
  general: "flag",
};

function normalizeCategory(dbCategory: string | null): GoalCategory {
  if (!dbCategory) return "general";
  const valid: GoalCategory[] = [
    "emergency",
    "vacation",
    "house",
    "car",
    "education",
    "retirement",
    "debt",
    "general",
  ];
  return valid.includes(dbCategory as GoalCategory)
    ? (dbCategory as GoalCategory)
    : "general";
}

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
    is_public: row.is_public ?? false,
    family_id: row.family_id ?? null,
    notes: row.notes ?? null,
    icon: CATEGORY_ICONS[category] ?? "flag",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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

  const { data: familyMember } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  const familyId = familyMember?.family_id;

  let query = supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (familyId) {
    query = query.or(`user_id.eq.${userId},and(is_family_goal.eq.true,family_id.eq.${familyId})`);
  } else {
    query = query.eq("user_id", userId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  let countQuery = supabase
    .from("goals")
    .select("count", { count: "exact", head: true });

  if (familyId) {
    countQuery = countQuery.or(`user_id.eq.${userId},and(is_family_goal.eq.true,family_id.eq.${familyId})`);
  } else {
    countQuery = countQuery.eq("user_id", userId);
  }

  if (filters.status) {
    countQuery = countQuery.eq("status", filters.status);
  }
  if (filters.priority) {
    countQuery = countQuery.eq("priority", filters.priority);
  }
  if (filters.category) {
    countQuery = countQuery.eq("category", filters.category);
  }

  const { count } = await countQuery;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message, count: null };
  return { data: (data ?? []).map(mapRow), error: null, count: count ?? 0 };
}

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
    is_public: form.isPublic ?? false,
    family_id: form.family_id || null,
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
    is_public: form.isPublic ?? false,
    family_id: form.family_id || null,
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

export async function contributeToGoal(
  goalId: string,
  amount: number,
  userId?: string
): Promise<{ data: GoalType | null; error: string | null }> {
  if (amount <= 0) {
    return { data: null, error: "Contribution amount must be greater than zero." };
  }

  const localDate = formatDateForInput(getPhilippinesNow());
  
  const contribution = {
    goal_id: goalId,
    user_id: userId || null,
    amount: amount,
    contribution_date: localDate,
    contribution_type: "manual",
  };

  const { error: contributionError } = await supabase
    .from("goal_contributions")
    .insert(contribution);

  if (contributionError) {
    return { data: null, error: contributionError.message };
  }

  const { data: updatedGoal, error: fetchError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .single();

  if (fetchError) return { data: null, error: fetchError.message };

  return { data: mapRow(updatedGoal), error: null };
}

export async function fetchGoalContributions(
  goalId: string
): Promise<{ data: GoalContribution[]; error: string | null }> {
  const { data, error } = await supabase
    .from("goal_contributions")
    .select(`
      *,
      profiles!goal_contributions_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("goal_id", goalId)
    .order("contribution_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  
  const contributions = (data || []).map(row => ({
    id: row.id,
    goal_id: row.goal_id,
    user_id: row.user_id,
    amount: Number(row.amount),
    contribution_date: row.contribution_date,
    contribution_type: row.contribution_type,
    notes: row.notes,
    created_at: row.created_at,
    user_name: row.profiles?.full_name || "Unknown",
    user_avatar: row.profiles?.avatar_url || null,
  }));

  return { data: contributions, error: null };
}

export interface GoalContributor {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_contributed: number;
}

export async function fetchGoalContributors(
  goalId: string,
  limit: number = 3
): Promise<{ data: GoalContributor[]; error: string | null }> {
  const { data, error } = await supabase
    .from("goal_contributions")
    .select(`
      user_id,
      amount,
      profiles!goal_contributions_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("goal_id", goalId)
    .order("contribution_date", { ascending: false });

  if (error) return { data: [], error: error.message };

  const contributorMap = new Map<string, GoalContributor>();
  
  for (const row of data || []) {
    const userId = row.user_id;
    const existing = contributorMap.get(userId);

    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    
    if (existing) {
      existing.total_contributed += Number(row.amount);
    } else {
      contributorMap.set(userId, {
        user_id: userId,
        full_name: profile?.full_name || "Unknown",
        avatar_url: profile?.avatar_url || null,
        total_contributed: Number(row.amount),
      });
    }
  }

  const contributors = Array.from(contributorMap.values())
    .sort((a, b) => b.total_contributed - a.total_contributed)
    .slice(0, limit);

  return { data: contributors, error: null };
}

export type GoalSummary = {
  activeGoals: number;
  totalSaved: number;
  monthlyContributions: number;
  completedGoals: number;
};

export async function fetchGoalSummary(
  userId: string
): Promise<GoalSummary> {

  const { data: familyMember } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  const familyId = familyMember?.family_id;

  let query = supabase
    .from("goals")
    .select("status, current_amount, auto_contribute_amount");

  if (familyId) {
    query = query.or(`user_id.eq.${userId},and(is_family_goal.eq.true,family_id.eq.${familyId})`);
  } else {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;

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
