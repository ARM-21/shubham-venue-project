'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthProvider';
import OnboardingFlow from 'components/auth/onboarding/OnboardingFlow';
import { ROUTES } from 'config/routes';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users back to login
    if (!loading && !user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }

    // Redirect already onboarded users to home
    if (!loading && user?.hasCompletedOnboarding) {
      router.replace(ROUTES.HOME);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3a1224]/70 font-display font-bold uppercase tracking-widest text-xs">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#fdfaf6] to-[#f5f1ec]">
      <OnboardingFlow userEmail={user?.email} userId={user?._id} />
    </div>
  );
}
