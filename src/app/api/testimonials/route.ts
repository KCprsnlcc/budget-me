import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, handle, text, avatar_url, ring_color, user_id } = body;

    // Validate required fields
    if (!name || !handle || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert testimonial using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .insert({
        name: name.trim(),
        handle: handle.trim(),
        text: text.trim(),
        avatar_url: avatar_url || null,
        ring_color: ring_color || "ring-emerald-50",
        status: "approved",
        user_id: user_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert testimonial:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
