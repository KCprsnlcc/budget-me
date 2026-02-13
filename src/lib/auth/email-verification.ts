import { createClient } from "@/lib/supabase/server";

export async function handleEmailVerification(token: string) {
  const supabase = await createClient();
  
  try {
    // Try to verify the OTP directly
    const { error } = await supabase.auth.verifyOtp({
      token,
      type: "signup",
    });
    
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

export async function checkEmailConfirmed(email: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email_confirmed')
      .eq('email', email)
      .single();
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
