"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import SeedstreetAppContent from './SeedstreetAppContent';
import { useAppData } from '@/hooks/use-app-data';
import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';

// Define Profile interface here or import from a shared type file
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[];
  interested_startups: string[];
  bio: string | null;
  location: string | null;
  phone: string | null;
  last_seen: string | null;
  show_welcome_flyer: boolean;
  total_committed: number;
}

const SeedstreetApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' });
  const [splashTimerComplete, setSplashTimerComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null); // Manage userProfile here

  // 1. Splash screen timer: Ensures splash screen shows for a minimum duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTimerComplete(true);
    }, 1500); // Show splash for at least 1.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch app settings (can run independently)
  const fetchAppSettings = useCallback(async () => {
    const { data, error } = await supabase.from('app_settings').select('*').single();
    if (error) {
      console.error("Error fetching app settings:", error);
    } else if (data) {
      setMaintenanceMode({ enabled: data.maintenance_mode_enabled, message: data.maintenance_mode_message || '' });
    }
  }, []);

  useEffect(() => {
    fetchAppSettings();
  }, [fetchAppSettings]);

  // 3. Session check and initial screen determination
  useEffect(() => {
    const checkSessionAndDetermineScreen = async () => {
      // Only proceed if the splash timer is complete and we are still on the splash screen
      // This prevents premature redirection before the splash screen has been shown.
      if (!splashTimerComplete || currentScreen !== 'splash') return;

      setLoadingSession(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setIsLoggedIn(false);
        setCurrentScreen('auth');
        setLoadingSession(false);
        return;
      }

      if (session) {
        setIsLoggedIn(true);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching user profile:", profileError);
          setIsLoggedIn(false);
          setCurrentScreen('auth');
          setLoadingSession(false);
          return;
        }

        if (profile) {
          setUserProfile(profile);
          if (!profile.role) {
            setCurrentScreen('roleSelector');
          } else if (!profile.onboarding_complete) {
            setCurrentScreen('onboarding');
          } else {
            setCurrentScreen('home');
          }
        } else {
          // User logged in but no profile (e.g., new signup via email link)
          setCurrentScreen('roleSelector');
        }
      } else {
        setIsLoggedIn(false);
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    };

    checkSessionAndDetermineScreen();
  }, [splashTimerComplete, currentScreen]); // Dependencies: re-run when splash timer completes or currentScreen changes (if still 'splash')

  // Handle screen changes from child components
  const handleSetCurrentScreen = useCallback((screen: string, params?: any) => {
    setCurrentScreen(screen);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    if (userProfile?.id) {
      supabase.from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', userProfile.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating onboarding status:", error);
            toast.error("Failed to save onboarding status.");
          } else {
            setUserProfile(prev => prev ? { ...prev, onboarding_complete: true } : null);
            setCurrentScreen('home');
            toast.success("Onboarding complete! Welcome to Seedstreet.");
          }
        });
    } else {
      setCurrentScreen('home');
    }
  }, [userProfile, setCurrentScreen]);

  // useAppData hook for fetching *other* data once logged in and initial screen is set
  const {
    startups, chats, communityPosts, messages, notifications, recentActivities,
    loadingData, fetchUserProfile, fetchStartups, fetchChats, fetchCommunityPosts, fetchMessages, fetchNotifications,
    fetchRecentActivities, investorCount, founderCount
  } = useAppData(isLoggedIn, userProfile, setUserProfile, currentScreen);

  if (maintenanceMode.enabled) {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  // If splash timer is not complete, or session is still loading, show splash screen
  // This ensures the splash screen is visible for the minimum duration
  if (!splashTimerComplete || loadingSession) {
    return <SeedstreetAppContent currentScreen="splash" setCurrentScreen={handleSetCurrentScreen} {...{
      isLoggedIn, setIsLoggedIn, loadingSession, maintenanceMode, fetchAppSettings, onboardingComplete: handleOnboardingComplete,
      userProfile, setUserProfile, startups, chats, communityPosts, messages, notifications, recentActivities,
      loadingData, fetchCommunityPosts, fetchNotifications, fetchUserProfile, investorCount, founderCount
    }} />;
  }

  // Once splash is done and initial screen determined, render the actual app content
  return (
    <>
      <SeedstreetAppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        loadingSession={loadingSession}
        maintenanceMode={maintenanceMode}
        fetchAppSettings={fetchAppSettings}
        currentScreen={currentScreen}
        setCurrentScreen={handleSetCurrentScreen}
        onboardingComplete={handleOnboardingComplete}
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
      <Toaster richColors position="top-center" />
    </>
  );
};

export default SeedstreetApp;