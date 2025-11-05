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
  const [currentScreen, setCurrentScreenState] = useState('splash'); // Keep a local state for initial screen logic

  // Use the new custom hook for data management
  const appData = useAppData({
    userId: supabase.auth.currentUser?.id || null,
    isLoggedIn,
    selectedChatId: null, // Not relevant for top-level app
  });

  const {
    userProfile,
    setUserProfile, // Pass setUserProfile down
    maintenanceMode,
    fetchAppSettings,
  } = appData;

  const userRole = userProfile?.role || null;

  // Auth state change listener for initial routing
  useEffect(() => {
    const handleAuthAndProfile = async (session: any | null) => {
      setLoadingSession(true);
      if (session) {
        setIsLoggedIn(true);
        const userId = session.user.id;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', userId)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching user profile for initial role check:", profileError);
          toast.error("Failed to load user profile. Please complete onboarding.");
          setCurrentScreenState('roleSelector'); // Set initial screen
        } else {
          if (profileData.role === 'admin') {
            setCurrentScreenState('adminDashboard');
          } else if (!profileData.onboarding_complete) {
            setCurrentScreenState('roleSelector');
          } else {
            setCurrentScreenState('home');
          }
        }
      } else {
        setIsLoggedIn(false);
        setCurrentScreenState('auth'); // Always go to auth screen if logged out
      }
      setLoadingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthAndProfile(session);
    });

    const getInitialSession = async () => {
      const { data: { session } = { session: null } } = await supabase.auth.getSession();
      handleAuthAndProfile(session);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [setUserProfile]); // Depend on setUserProfile from useAppData

  // 1. Always show splash screen while session and profile are loading
  if (loadingSession) {
    return <SplashScreen />;
  }

  // 2. Once session and profile are loaded, check maintenance mode
  //    If maintenance is ON AND user is NOT admin, show maintenance screen
  if (maintenanceMode.enabled && userRole !== 'admin') {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  // 3. Otherwise, render the main application content
  return (
    <SeedstreetAppContent
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
      loadingSession={loadingSession}
      maintenanceMode={maintenanceMode}
      fetchAppSettings={fetchAppSettings}
    />
  );
};

export default SeedstreetApp;