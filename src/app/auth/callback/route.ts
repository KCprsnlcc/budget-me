import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  let next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();

    if (type === "signup") {

      if (token) {
        return NextResponse.redirect(`${origin}/verify?token=${token}&type=${type}`);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user && user.email_confirmed_at) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    if (type === "recovery") {
      if (token) {
        return NextResponse.redirect(`${origin}/reset-password?token_hash=${token}&type=${type}`);
      }
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && next === "/dashboard") {

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role_name")
          .eq("user_id", user.id)
          .eq("role_name", "admin")
          .eq("is_active", true)
          .maybeSingle();
        
        let isAdmin = !!roleData;

        if (!isAdmin) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          
          isAdmin = profileData?.role === "admin";
        }

        if (isAdmin) {
          next = "/admin/dashboard";
        }
      }
      
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

    if (type === "signup" && (error.message?.includes("code challenge") || error.message?.includes("bad_code_verifier"))) {
      if (token) {
        return NextResponse.redirect(`${origin}/verify?token=${token}&type=${type}`);
      }

      return NextResponse.redirect(`${origin}/login?message=email_verified`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
