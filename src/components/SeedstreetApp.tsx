"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import SeedstreetAppContent from './SeedstreetAppContent';
import { useAppData } from '@/hooks/use-app-data';
import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';
import { ThemeProviderWrapper } from '@/components/ThemeProviderWrapper';

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
  last_seen: string | null; // Assuming this is the field for last activity
  show_welcome_flyer: boolean;
  total_committed: number;
}

// Define a type for screen parameters for better type safety
interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any; // Using 'any' for chat for now, can be refined
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

const SeedstreetApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [currentScreenParams, setCurrentScreenParams] = useState<ScreenParams>({}); // NEW: State for screen parameters
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' });
  const [splashTimerComplete, setSplashTimerComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [showGlobalLoadingIndicator, setShowGlobalLoadingIndicator] = useState(false);

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
      setMaintenanceMode({ enabled: data.setting_value.enabled, message: data.setting_value.message || '' });
    }
  }, []);

  useEffect(() => {
    fetchAppSettings();
  }, [fetchAppSettings]);

  // Callback to fetch/refresh user profile, managed by SeedstreetApp
  const fetchUserProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      return null;
    } else if (data) {
      setUserProfile(data);
      return data as Profile;
    }
    return null;
  }, []);

  // useAppData hook for fetching *other* data
  const {
    startups, chats, communityPosts, notifications, recentActivities,
    loadingData, investorCount, founderCount, fetchCommunityPosts, fetchNotifications
  } = useAppData(isLoggedIn, userProfile?.id || null, currentScreen); // Pass userId directly

  // 3. Initial Session check and FIRST screen determination (after splash)
  useEffect(() => {
    const checkInitialSession = async () => {
      if (!splashTimerComplete) {
        return; // Wait for splash screen to complete
      }

      setLoadingSession(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const onboardingSeenLocally = await localforage.getItem('hasSeenOnboarding');

      if (sessionError || !session) {
        setIsLoggedIn(false);
        if (!onboardingSeenLocally) {
          setCurrentScreen('onboarding');
          setCurrentScreenParams({});
        } else {
          setCurrentScreen('auth');
          setCurrentScreenParams({});
        }
      } else {
        setIsLoggedIn(true);
        const fetchedProfile = await fetchUserProfile(session.user.id);
        if (fetchedProfile) {
          if (!fetchedProfile.role) {
            setCurrentScreen('roleSelector');
            setCurrentScreenParams({});
          } else if (!fetchedProfile.onboarding_complete) {
            setCurrentScreen('onboarding');
            setCurrentScreenParams({});
          } else {
            setCurrentScreen('home');
            setCurrentScreenParams({});
          }
        } else {
          // This case should ideally not happen if handle_new_user works, but fallback
          setCurrentScreen('roleSelector');
          setCurrentScreenParams({});
        }
      }
      setLoadingSession(false);
    };

    // Only run this effect once after splash is complete and if we are still on the splash screen
    // to prevent re-running if user navigates away and comes back.
    if (splashTimerComplete && currentScreen === 'splash') {
      checkInitialSession();
    }
  }, [splashTimerComplete, currentScreen, fetchUserProfile]);

  // 4. Navigation logic for subsequent state changes (after initial screen is set)
  useEffect(() => {
    if (!loadingSession) { // Ensure initial session check is complete
      if (isLoggedIn && userProfile) {
        // User is logged in and profile is loaded, navigate based on profile status
        if (!userProfile.role) {
          if (currentScreen !== 'roleSelector') {
            setCurrentScreen('roleSelector');
            setCurrentScreenParams({});
          }
        } else if (!userProfile.onboarding_complete) {
          if (currentScreen !== 'onboarding') {
            setCurrentScreen('onboarding');
            setCurrentScreenParams({});
          }
        } else {
          if (currentScreen !== 'home') {
            setCurrentScreen('home');
            setCurrentScreenParams({});
          }
        }
      } else if (!isLoggedIn && currentScreen !== 'auth' && currentScreen !== 'onboarding' && currentScreen !== 'splash') {
        // User logged out or session expired, and not on onboarding/splash/auth already
        setCurrentScreen('auth');
        setCurrentScreenParams({});
      }
    }
  }, [isLoggedIn, userProfile, loadingSession, currentScreen, setCurrentScreen]);


  // 5. Effect to periodically update user's last_active timestamp
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoggedIn && userProfile?.id) {
      const updateLastActive = async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ last_active: new Date().toISOString() })
          .eq('id', userProfile.id);
        if (error) {
          console.error("Error updating last_active:", error);
        }
      };

      // Update immediately on login/profile load, then every 30 seconds
      updateLastActive();
      interval = setInterval(updateLastActive, 30 * 1000); // Every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, userProfile?.id]); // Only re-run if login status or user ID changes

  // 6. Effect to control global loading indicator based on useAppData's loadingData
  useEffect(() => {
    if (currentScreen !== 'splash' && !loadingSession) {
      setShowGlobalLoadingIndicator(loadingData);
    } else {
      setShowGlobalLoadingIndicator(false);
    }
  }, [loadingData, currentScreen, loadingSession]);

  // Handle screen changes from child components
  const handleSetCurrentScreen = useCallback((screen: string, params?: ScreenParams) => { // Updated type for params
    setCurrentScreen(screen);
    setCurrentScreenParams(params || {}); // Store the parameters
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await localforage.setItem('hasSeenOnboarding', true); // Mark as seen locally

    if (userProfile?.id) {
      const { error } = await supabase.from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', userProfile.id);

      if (error) {
        console.error("Error updating onboarding status:", error);
        toast.error("Failed to save onboarding status.");
      } else {
        // Update local userProfile state and trigger re-evaluation of navigation
        setUserProfile(prev => prev ? { ...prev, onboarding_complete: true } : null);
        toast.success("Onboarding complete! Welcome to Seedstreet.");
        // The new navigation useEffect will now handle setting currentScreen to 'home'
      }
    } else {
      setCurrentScreen('auth'); // Redirect to auth for unauthenticated users
      setCurrentScreenParams({});
    }
  }, [userProfile, setCurrentScreen, setUserProfile]); // Added setUserProfile to dependencies

  if (maintenanceMode.enabled) {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  if (!splashTimerComplete || loadingSession) {
    return (
      <ThemeProviderWrapper
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        showGlobalLoadingIndicator={false}
      >
        <SeedstreetAppContent currentScreen="splash" setCurrentScreen={handleSetCurrentScreen} currentScreenParams={currentScreenParams} {...{
          isLoggedIn, setIsLoggedIn, loadingSession, maintenanceMode, fetchAppSettings, onboardingComplete: handleOnboardingComplete,
          userProfile, setUserProfile, startups, chats, communityPosts, notifications, recentActivities,
          loadingData, fetchUserProfile: fetchUserProfile, investorCount, founderCount, fetchCommunityPosts, fetchNotifications
        }} />
      </ThemeProviderWrapper>
    );
  }

  return (
    <ThemeProviderWrapper
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      showGlobalLoadingIndicator={showGlobalLoadingIndicator}
    >
      <SeedstreetAppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        loadingSession={loadingSession}
        maintenanceMode={maintenanceMode}
        fetchAppSettings={fetchAppSettings}
        currentScreen={currentScreen}
        setCurrentScreen={handleSetCurrentScreen}
        currentScreenParams={currentScreenParams} // NEW: Pass currentScreenParams
        onboardingComplete={handleOnboardingComplete}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        startups={startups}
        chats={chats}
        communityPosts={communityPosts}
        notifications={notifications}
        recentActivities={recentActivities}
        loadingData={loadingData}
        fetchUserProfile={fetchUserProfile}
        investorCount={investorCount}
        founderCount={founderCount}
        fetchCommunityPosts={fetchCommunityPosts}
        fetchNotifications={fetchNotifications}
      />
      <Toaster richColors position="top-center" />
    </ThemeProviderWrapper>
  );
};

export default SeedstreetApp;