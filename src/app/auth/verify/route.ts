import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  // Redirect to the verification page with the same parameters
  return NextResponse.redirect(`${origin}/auth/verify?token=${token}&type=${type}`);
}
