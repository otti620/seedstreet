"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SplashScreen from './screens/SplashScreen';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAppData } from '@/hooks/use-app-data';
import { AuthChangeEvent, Session } from '@supabase/supabase-js'; // Import AuthChangeEvent and Session

// Dynamically import SeedstreetAppContent with ssr: false
const SeedstreetAppContent = dynamic(() => import('./SeedstreetAppContent'), { ssr: false });

const SeedstreetApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Re-introducing currentUserId state
  const [currentScreen, setCurrentScreenState] = useState('splash');

  // Centralized useAppData call
  const appData = useAppData({
    userId: currentUserId, // Pass currentUserId from state
    isLoggedIn,
    selectedChatId: null, // This will be managed within SeedstreetAppContent
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
  } = appData;

  const userRole = userProfile?.role || null;

  useEffect(() => {
    const handleAuthSession = async (session: Session | null) => { // Type session here
      setLoadingSession(true);
      if (session) {
        setIsLoggedIn(true);
        setCurrentUserId(session.user.id); // Set currentUserId from session
      } else {
        setIsLoggedIn(false);
        setCurrentUserId(null); // Clear userId on logout
      }
      setLoadingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => { // Type event and session here
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
  }, [loadingSession, loadingData, isLoggedIn, userProfile, userRole, maintenanceMode, currentUserId]); // currentUserId is a dependency here

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
    />
  );
};

export default SeedstreetApp;