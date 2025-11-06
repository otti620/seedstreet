"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SplashScreen from './screens/SplashScreen';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAppData } from '@/hooks/use-app-data';

// Dynamically import SeedstreetAppContent with ssr: false
const SeedstreetAppContent = dynamic(() => import('./SeedstreetAppContent'), { ssr: false });

const SeedstreetApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreenState] = useState('splash');

  const appData = useAppData({
    userId: currentUserId,
    isLoggedIn,
    selectedChatId: null,
  });

  const {
    userProfile,
    maintenanceMode,
    fetchAppSettings,
    loadingData,
  } = appData;

  const userRole = userProfile?.role || null;

  useEffect(() => {
    const handleAuthSession = async (session: any | null) => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    if (loadingSession || loadingData) {
      setCurrentScreenState('splash');
      return;
    }

    if (maintenanceMode.enabled && userRole !== 'admin') {
      setCurrentScreenState('maintenance');
      return;
    }

    if (!isLoggedIn) {
      setCurrentScreenState('auth');
    } else if (!userProfile) {
      setCurrentScreenState('roleSelector');
    } else if (!userProfile.onboarding_complete) {
      setCurrentScreenState('roleSelector');
    } else if (userProfile.role === 'admin') {
      setCurrentScreenState('adminDashboard');
    } else {
      setCurrentScreenState('home');
    }
  }, [loadingSession, loadingData, isLoggedIn, userProfile, userRole, maintenanceMode, currentUserId]);

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
      setCurrentScreen={setCurrentScreenState} // Pass the setter function
      setUserProfile={appData.setUserProfile} // Pass setUserProfile from useAppData
      fetchCommunityPosts={appData.fetchCommunityPosts} // Pass fetchCommunityPosts
      fetchNotifications={appData.fetchNotifications} // Pass fetchNotifications
    />
  );
};

export default SeedstreetApp;