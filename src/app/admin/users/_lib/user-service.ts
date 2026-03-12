"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { User, UserFormState, UserFilters, UserStats } from "./types";

export async function fetchUsers(
  filters: UserFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{ users: User[]; totalCount: number }> {
  const supabase = await createClient();

  try {
    let query = supabase.from("profiles").select("*", { count: "exact" });

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    if (filters.role && filters.role !== "all") {
      query = query.eq("role", filters.role);
    }

    if (filters.status && filters.status !== "all") {
      const isActive = filters.status === "active";
      query = query.eq("is_active", isActive);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const offset = (page - 1) * pageSize;
    const limit = pageSize === Number.MAX_SAFE_INTEGER ? count || 1000 : pageSize;

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return {
      users: (data as User[]) || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function fetchUserStats(): Promise<UserStats> {
  const supabase = await createClient();

  try {

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const { count: activeUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    const { count: adminCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: growthData } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    const monthCounts = new Map<string, number>();
    growthData?.forEach((user) => {
      const date = new Date(user.created_at);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });

    const userGrowth = Array.from(monthCounts.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    const { data: roleData } = await supabase
      .from("profiles")
      .select("role");

    const roleCounts = new Map<string, number>();
    roleData?.forEach((user) => {
      roleCounts.set(user.role, (roleCounts.get(user.role) || 0) + 1);
    });

    const total = roleData?.length || 1;
    const roleDistribution = Array.from(roleCounts.entries()).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newThisMonth: newThisMonth || 0,
      adminCount: adminCount || 0,
      userGrowth,
      roleDistribution,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw new Error("Failed to fetch user statistics");
  }
}

export async function createUser(data: UserFormState): Promise<User> {
  const supabase = await createAdminClient();

  try {

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        full_name: data.full_name,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
        date_of_birth: data.date_of_birth || null,
        timezone: data.timezone,
        language: data.language,
        currency_preference: data.currency_preference,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return profile as User;
  } catch (error: any) {
    console.error("Detailed error creating user:", error);
    const message = error?.message || error?.error_description || "An unexpected error occurred while creating the user";
    throw new Error(message);
  }
}

export async function updateUser(id: string, data: Partial<UserFormState>): Promise<User> {
  const supabase = await createAdminClient();

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth || null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.currency_preference !== undefined) updateData.currency_preference = data.currency_preference;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return updatedUser as User;
  } catch (error: any) {
    console.error("Detailed error updating user:", error);
    const message = error?.message || error?.error_description || "An unexpected error occurred while updating the user";
    throw new Error(message);
  }
}

export async function deactivateUser(id: string): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw new Error("Failed to deactivate user");
  }
}

export async function activateUser(id: string): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error activating user:", error);
    throw new Error("Failed to activate user");
  }
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
