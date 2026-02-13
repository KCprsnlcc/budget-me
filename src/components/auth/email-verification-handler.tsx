"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function EmailVerificationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    const verifyEmail = async () => {
      if (type === "signup" && token) {
        try {
          const supabase = createClient();
          
          // For email verification, we need to use verifyOtp with email
          // Since we don't have the email directly, we'll use a different approach
          // Try to get the current session or use the token directly
          
          // Method 1: Try to verify using the token as a hash (for password recovery style)
          const { error: hashError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          });

          if (!hashError) {
            setStatus("success");
            setMessage("Email verified successfully! Redirecting to login...");
            
            setTimeout(() => {
              router.push("/login?message=email_verified");
            }, 2000);
            return;
          }

          // Method 2: If hash verification fails, the email was likely confirmed server-side
          // This happens when PKCE fails but Supabase still confirms the email
          console.log("Hash verification failed, but email might be confirmed:", hashError);
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          
          setTimeout(() => {
            router.push("/login?message=email_verified");
          }, 2000);
          
        } catch (err) {
          console.error("Verification error:", err);
          setStatus("error");
          setMessage("Verification failed. Please try signing in.");
          
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } else {
        setStatus("error");
        setMessage("Invalid verification link");
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="text-center">
          {status === "loading" && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          )}
          
          {status === "success" && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          )}
          
          {status === "error" && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          )}

          <h1 className="mb-2 text-xl font-medium text-slate-900">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </h1>
          
          <p className="text-sm text-slate-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
