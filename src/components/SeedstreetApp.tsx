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
    userId: supabase.auth.currentUser?.id || null, // Pass current user ID directly
    isLoggedIn,
    selectedChatId: null, // Not relevant for top-level app
  });

  const {
    userProfile,
    setUserProfile,
    maintenanceMode,
    fetchAppSettings,
    loadingData, // Get loadingData from useAppData
  } = appData;

  const userRole = userProfile?.role || null;

  // Auth state change listener for initial session management
  useEffect(() => {
    const handleAuthSession = async (session: any | null) => {
      setLoadingSession(true);
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
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
  }, []); // Dependencies only on initial mount

  // Effect to determine the current screen based on appData states
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
      // If logged in but profile not loaded, it might be a new user or profile fetch failed
      // We can default to role selector or auth if profile is truly missing
      setCurrentScreenState('roleSelector'); // Assume new user needs to select role
    } else if (!userProfile.onboarding_complete) {
      setCurrentScreenState('roleSelector');
    } else if (userProfile.role === 'admin') {
      setCurrentScreenState('adminDashboard');
    } else {
      setCurrentScreenState('home');
    }
  }, [loadingSession, loadingData, isLoggedIn, userProfile, userRole, maintenanceMode]);


  // 1. Always show splash screen while session or app data is loading
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  // 2. If maintenance mode is ON AND user is NOT admin, show maintenance screen
  if (currentScreen === 'maintenance') {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  // 3. Otherwise, render the main application content
  return (
    <SeedstreetAppContent
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
      loadingSession={loadingSession} // This will now be false if we reach here
      maintenanceMode={maintenanceMode}
      fetchAppSettings={fetchAppSettings}
      currentScreen={currentScreen} // Pass the determined currentScreen
    />
  );
};

export default SeedstreetApp;