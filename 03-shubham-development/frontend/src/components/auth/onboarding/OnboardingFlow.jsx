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
  const [stage, setStage] = useState('welcome'); // welcome, profile, done

  const handleWelcomeComplete = () => {
    setStage('profile');
  };

  const handleProfileComplete = async (profileData) => {
    try {
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

      toast.success('Profile saved! Welcome to the app 🎉');
      
      // Redirect to home page after slight delay
      setTimeout(() => {
        router.push(ROUTES.HOME);
      }, 1000);
    } catch (error) {
      toast.error('Failed to save profile');
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
    </>
  );
}
