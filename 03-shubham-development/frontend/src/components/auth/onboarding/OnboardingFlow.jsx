'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { useAuth } from 'contexts/AuthProvider';
import WelcomeTour from './WelcomeTour';
import ProfileCompletion from './ProfileCompletion';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';

export default function OnboardingFlow({ userEmail, userId }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [stage, setStage] = useState('welcome'); // welcome, profile
  const [error, setError] = useState(null);

  const handleWelcomeComplete = () => {
    setStage('profile');
  };

  const handleProfileComplete = async (profileData) => {
    try {
      setError(null);
      // Save profile to backend
      const response = await axiosInstance.put(ROUTES.API.PROFILE.UPDATE, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        city: profileData.city,
        preferredEventTypes: profileData.eventTypes,
        hasCompletedOnboarding: true,
      });

      // Update auth context with new user data
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      }

      toast.success('Profile saved! Welcome to the app ');
      
      // Redirect to home page after slight delay
      setTimeout(() => {
        router.push(ROUTES.HOME);
      }, 800);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Failed to save profile';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(error);
    }
  };

  return (
    <>
      {stage === 'welcome' && (
        <WelcomeTour onComplete={handleWelcomeComplete} />
      )}
      
      {stage === 'profile' && (
        <ProfileCompletion 
          userEmail={userEmail}
          onComplete={handleProfileComplete}
        />
      )}

      {/* Fallback - Loading state for unexpected conditions */}
      {!['welcome', 'profile'].includes(stage) && (
        <div className="h-full w-full bg-gradient-to-br from-[#fdfaf6] to-[#f5f1ec] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#3a1224]/70 font-display font-bold uppercase tracking-widest text-xs">
              Setting up...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-display font-bold text-[#3a1224] mb-2">Error</h3>
            <p className="text-[#3a1224]/70 text-sm mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="w-full h-10 bg-[#3a1224] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#3a1224]/90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
