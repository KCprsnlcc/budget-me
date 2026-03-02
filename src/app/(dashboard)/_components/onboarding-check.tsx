"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { checkUserDataStatus, type UserDataStatus } from "../_lib/account-service";
import { OnboardingModal } from "./onboarding-modal";
import { Loader2 } from "lucide-react";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [dataStatus, setDataStatus] = useState<UserDataStatus | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check for URL parameter to force onboarding (for testing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forceOnboarding = urlParams.get('force-onboarding');
      if (forceOnboarding === 'true' && user?.id) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  useEffect(() => {
    async function checkUserData() {
      if (!user?.id) {
        setChecking(false);
        return;
      }

      try {
        const status = await checkUserDataStatus(user.id);
        setDataStatus(status);
        
        // Show onboarding if user has no accounts and no transactions
        if (status.isFirstTimeUser) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to check user data status:", error);
      } finally {
        setChecking(false);
      }
    }

    if (!authLoading) {
      checkUserData();
    }
  }, [user, authLoading]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Show loading while checking auth and data status
  if (authLoading || checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything until we have user data
  if (!user) {
    return null;
  }

  return (
    <>
      {children}
      
      {/* Onboarding Modal - shown for first-time users */}
      <OnboardingModal
        open={showOnboarding}
        onClose={handleCloseOnboarding}
        userId={user.id}
        userName={
          user.user_metadata?.full_name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "there"
        }
      />
    </>
  );
}
