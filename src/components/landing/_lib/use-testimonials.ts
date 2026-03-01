"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchTestimonials,
  submitTestimonial,
  uploadTestimonialAvatar,
  type TestimonialInput,
} from "./testimonial-service";
import type { Testimonial } from "@/types";

interface UseTestimonialsReturn {
  testimonials: Testimonial[];
  testimonialsRow1: Testimonial[];
  testimonialsRow2: Testimonial[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitReview: (
    input: TestimonialInput,
    avatarFile?: File | null
  ) => Promise<{ error: string | null; success: boolean }>;
}

export function useTestimonials(): UseTestimonialsReturn {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTestimonials();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitReview = useCallback(
    async (
      input: TestimonialInput,
      avatarFile?: File | null
    ): Promise<{ error: string | null; success: boolean }> => {
      try {
        let avatarUrl = input.avatar_url;

        // Upload avatar if provided
        if (avatarFile) {
          const { url, error: uploadError } = await uploadTestimonialAvatar(
            avatarFile,
            user?.id
          );
          if (uploadError) {
            return { error: uploadError, success: false };
          }
          if (url) {
            avatarUrl = url;
          }
        }

        // Submit testimonial
        const { error: submitError } = await submitTestimonial(
          {
            ...input,
            avatar_url: avatarUrl,
          },
          user?.id
        );

        if (submitError) {
          return { error: submitError, success: false };
        }

        // Refetch testimonials to include the new one (if approved immediately)
        await fetchData();

        return { error: null, success: true };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Failed to submit review",
          success: false,
        };
      }
    },
    [user?.id, fetchData]
  );

  // Split testimonials into two rows for marquee effect
  const midPoint = Math.ceil(testimonials.length / 2);
  const testimonialsRow1 = testimonials.slice(0, midPoint);
  const testimonialsRow2 = testimonials.slice(midPoint);

  return {
    testimonials,
    testimonialsRow1,
    testimonialsRow2,
    isLoading,
    error,
    refetch: fetchData,
    submitReview,
  };
}
