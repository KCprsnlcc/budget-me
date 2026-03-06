import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/budgets") ||
    request.nextUrl.pathname.startsWith("/goals") ||
    request.nextUrl.pathname.startsWith("/family") ||
    request.nextUrl.pathname.startsWith("/predictions") ||
    request.nextUrl.pathname.startsWith("/chatbot") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/accounts");

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    
    // Check if user is admin by querying user_roles or profiles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role_name")
      .eq("user_id", user.id)
      .eq("role_name", "admin")
      .eq("is_active", true)
      .maybeSingle();
    
    // Fallback to profiles table if no role found in user_roles
    if (!roleData) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profileData?.role === "admin") {
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
    } else {
      // User has admin role in user_roles table
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    
    // Default redirect to dashboard for regular users
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected pages to login
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect non-admin users away from admin routes to dashboard
  if (user && isAdminRoute) {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role_name")
      .eq("user_id", user.id)
      .eq("role_name", "admin")
      .eq("is_active", true)
      .maybeSingle();
    
    let isAdmin = !!roleData;
    
    // Fallback to profiles table if no role found in user_roles
    if (!isAdmin) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      isAdmin = profileData?.role === "admin";
    }
    
    // Redirect non-admin users to dashboard
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
