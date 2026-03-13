import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function checkAdminRole(userId: string): Promise<{ isAdmin: boolean; error: string | null }> {
  try {

    const { data, error } = await supabase
      .from("user_roles")
      .select("role_name, is_active")
      .eq("user_id", userId)
      .eq("role_name", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Admin role check error:", error);
      return { isAdmin: false, error: error.message };
    }

    if (!data) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        return { isAdmin: false, error: null };
      }

      return { isAdmin: profileData?.role === "admin", error: null };
    }

    return { isAdmin: !!data, error: null };
  } catch (err) {
    console.error("Admin role check exception:", err);
    return { isAdmin: false, error: "Failed to verify admin role" };
  }
}

export async function getUserRole(userId: string): Promise<{ role: string | null; error: string | null }> {
  try {

    const { data, error } = await supabase
      .from("user_roles")
      .select("role_name, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("User role fetch error:", error);
    }

    if (data) {
      return { role: data.role_name, error: null };
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      return { role: "user", error: null }; 
    }

    return { role: profileData.role || "user", error: null };
  } catch (err) {
    console.error("User role fetch exception:", err);
    return { role: null, error: "Failed to fetch user role" };
  }
}
