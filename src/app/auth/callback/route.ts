import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // signup, recovery, magiclink, etc.

  if (code) {
    const supabase = await createClient();
    
    // Handle email verification differently - redirect to verification page
    if (type === "signup") {
      // For email verification, redirect to our dedicated verification page
      if (token) {
        return NextResponse.redirect(`${origin}/auth/verify?token=${token}&type=${type}`);
      }
      
      // If no token, try standard flow
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // If we can get the user, they're already logged in, redirect to dashboard
      if (!userError && user && user.email_confirmed_at) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Handle password recovery - redirect to reset password page
    if (type === "recovery") {
      if (token) {
        return NextResponse.redirect(`${origin}/reset-password?token_hash=${token}&type=${type}`);
      }
    }

    // Try standard code exchange for OAuth and other flows
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // If PKCE failed but it's email verification, redirect to verification page
    if (type === "signup" && (error.message?.includes("code challenge") || error.message?.includes("bad_code_verifier"))) {
      if (token) {
        return NextResponse.redirect(`${origin}/auth/verify?token=${token}&type=${type}`);
      }
      
      // Even if no token, the email was likely confirmed server-side
      return NextResponse.redirect(`${origin}/login?message=email_verified`);
    }
  }

  // OAuth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
