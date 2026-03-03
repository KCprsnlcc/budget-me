"use server";

import { createClient } from "@/lib/supabase/server";

export async function syncUserProfile(userId: string) {
  const supabase = await createClient();
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      return { success: true, message: "Profile already exists" };
    }

    // Get user data from auth.users using admin function
    const { data: userData, error: userError } = await supabase.rpc('get_user_metadata', { 
      user_id: userId 
    });

    if (userError) {
      console.error("Error fetching user metadata:", userError);
      // Create basic profile without metadata
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: null,
          email: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        return { error: insertError.message };
      }

      return { success: true, message: "Created basic profile" };
    }

    // Create profile with user metadata
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: userData?.full_name || null,
        email: userData?.email || null,
        avatar_url: userData?.avatar_url || userData?.picture || null,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      return { error: insertError.message };
    }

    return { success: true, message: "Profile synced successfully" };
  } catch (error: any) {
    return { error: error.message };
  }
}
