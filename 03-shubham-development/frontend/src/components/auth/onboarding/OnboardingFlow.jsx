'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import WelcomeTour from './WelcomeTour';
import ProfileCompletion from './ProfileCompletion';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';

export default function OnboardingFlow({ userEmail, userId }) {
  const router = useRouter();
  const [stage, setStage] = useState('welcome'); // welcome, profile, done

  const handleWelcomeComplete = () => {
    setStage('profile');
  };

  const handleProfileComplete = async (profileData) => {
    try {
      // Save profile to backend
      await axiosInstance.put(ROUTES.API.USERS.PROFILE, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        city: profileData.city,
        preferredEventTypes: profileData.eventTypes,
        hasCompletedOnboarding: true,
      });

      toast.success('Profile saved! Welcome to the app 🎉');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push(ROUTES.SITE.DASHBOARD);
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
