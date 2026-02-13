import { cache } from "react";
import { createClient } from "./server";

/**
 * Per-request deduplicated auth check using React.cache().
 * Multiple calls within the same server request execute only once.
 * (server-cache-react pattern)
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

/**
 * Per-request deduplicated session check.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
});

/**
 * Parallel fetch of user + profile data using Promise.all().
 * (async-parallel pattern — 2x improvement over sequential)
 */
export const getUserWithProfile = cache(async () => {
  const supabase = await createClient();

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").single(),
  ]);

  const user = userResult.data?.user ?? null;
  const profile = profileResult.data ?? null;

  return { user, profile };
});

/**
 * Get user profile with avatar URL
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", userId)
    .single();
  
  if (error || !data) return null;
  return data;
});
