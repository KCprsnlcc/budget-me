"use client";

import { createClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/types";

export interface TestimonialInput {
  name: string;
  handle: string;
  text: string;
  avatar_url?: string;
  ring_color?: string;
}

const supabase = createClient();

/**
 * Fetch all approved testimonials
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch testimonials:", error);
    throw new Error(error.message);
  }

  return (data || []).map((t) => ({
    name: t.name,
    handle: t.handle,
    avatar: t.avatar_url || "/profiles/default.webp",
    text: t.text,
    ringColor: t.ring_color || "ring-emerald-50",
  }));
}

/**
 * Submit a new testimonial via API route (allows unauthenticated users)
 */
export async function submitTestimonial(
  input: TestimonialInput,
  userId?: string
): Promise<{ error: string | null }> {
  try {
    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        handle: input.handle,
        text: input.text,
        avatar_url: input.avatar_url,
        ring_color: input.ring_color || "ring-emerald-50",
        user_id: userId || null,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error("Failed to submit testimonial:", result.error);
      return { error: result.error || "Failed to submit testimonial" };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error submitting testimonial:", err);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadTestimonialAvatar(
  file: File,
  userId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "webp";
    const fileName = `testimonial-${userId || "anon"}-${Date.now()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload avatar:", uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error("Unexpected error uploading avatar:", err);
    return { url: null, error: "Failed to upload avatar" };
  }
}
