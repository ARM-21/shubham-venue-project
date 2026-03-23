'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';

export default function OnboardingGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in but hasn't completed onboarding, redirect to onboarding
    if (!loading && user?.isVerified && !user?.hasCompletedOnboarding) {
      router.replace(ROUTES.AUTH.ONBOARDING);
    }
  }, [user, loading, router]);

  // If check fails, show loading while redirecting
  if (!loading && user?.isVerified && !user?.hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3a1224]/70 font-display font-bold uppercase tracking-widest text-xs">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Otherwise render the children normally
  return children;
}
