"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { checkUserDataStatus, type UserDataStatus } from "../_lib/account-service";
import { OnboardingModal } from "./onboarding-modal";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [dataStatus, setDataStatus] = useState<UserDataStatus | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

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
        
        if (status.isFirstTimeUser) {
          const timer = setTimeout(() => {
            setShowOnboarding(true);
          }, 1000);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
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

  if (!user) {
    return null;
  }

  return (
    <>
      {children}
      
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
