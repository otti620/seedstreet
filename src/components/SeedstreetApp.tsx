"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SplashScreen from './screens/SplashScreen';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAppData } from '@/hooks/use-app-data';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import localforage from 'localforage';

// Dynamically import SeedstreetAppContent with ssr: false
const SeedstreetAppContent = dynamic(() => import('./SeedstreetAppContent'), { ssr: false });

const SeedstreetApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreenState] = useState('splash');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Centralized useAppData call
  const appData = useAppData({
    userId: currentUserId,
    isLoggedIn,
    selectedChatId: null,
  });

  const {
    userProfile,
    setUserProfile,
    startups,
    chats,
    communityPosts,
    messages,
    notifications,
    recentActivities,
    maintenanceMode,
    loadingData,
    fetchAppSettings,
    fetchCommunityPosts,
    fetchNotifications,
    fetchUserProfile,
    investorCount = 0, // Provide default value
    founderCount = 0,  // Provide default value
  } = appData;

  const userRole = userProfile?.role || null;

  // Effect to load onboarding status from localforage
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const seen = await localforage.getItem<boolean>('hasSeenOnboarding');
      setHasSeenOnboarding(!!seen);
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    const handleAuthSession = async (session: Session | null) => {
      setLoadingSession(true);
      if (session) {
        setIsLoggedIn(true);
        setCurrentUserId(session.user.id);
      } else {
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
      setLoadingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      handleAuthSession(session);
    });

    const getInitialSession = async () => {
      const { data: { session } = { session: null } } = await supabase.auth.getSession();
      handleAuthSession(session);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Wait for all initial loading and localforage to be ready
    if (loadingSession || loadingData || hasSeenOnboarding === null) {
      setCurrentScreenState('splash');
      return;
    }

    if (maintenanceMode.enabled && userRole !== 'admin') {
      setCurrentScreenState('maintenance');
      return;
    }

    if (!isLoggedIn) {
      if (!hasSeenOnboarding) {
        setCurrentScreenState('onboarding');
      } else {
        setCurrentScreenState('auth');
      }
    } else if (!userProfile) {
      setCurrentScreenState('roleSelector');
    } else if (!userProfile.onboarding_complete) {
      setCurrentScreenState('roleSelector');
    } else if (userProfile.role === 'admin') {
      setCurrentScreenState('adminDashboard');
    } else {
      setCurrentScreenState('home');
    }
  }, [loadingSession, loadingData, isLoggedIn, userProfile, userRole, maintenanceMode, currentUserId, hasSeenOnboarding]);

  const handleOnboardingComplete = useCallback(async () => {
    await localforage.setItem('hasSeenOnboarding', true);
    setHasSeenOnboarding(true);
  }, []);

  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'maintenance') {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  return (
    <SeedstreetAppContent
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
      loadingSession={loadingSession}
      maintenanceMode={maintenanceMode}
      fetchAppSettings={fetchAppSettings}
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreenState}
      onboardingComplete={handleOnboardingComplete}
      // Pass all appData states and setters as props
      userProfile={userProfile}
      setUserProfile={setUserProfile}
      startups={startups}
      chats={chats}
      communityPosts={communityPosts}
      messages={messages}
      notifications={notifications}
      recentActivities={recentActivities}
      loadingData={loadingData}
      fetchCommunityPosts={fetchCommunityPosts}
      fetchNotifications={fetchNotifications}
      fetchUserProfile={fetchUserProfile}
      investorCount={investorCount}
      founderCount={founderCount}
    />
  );
};

export default SeedstreetApp;