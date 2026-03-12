import { cache } from "react";
import { createClient } from "./server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
});

export const getUserWithProfile = cache(async () => {
  const supabase = await createClient();

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").maybeSingle(), 
  ]);

  const user = userResult.data?.user ?? null;
  const profile = profileResult.data ?? null;

  return { user, profile };
});

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", userId)
    .maybeSingle(); 
  
  if (error || !data) return null;
  return data;
});
