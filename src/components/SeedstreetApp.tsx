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

const SeedstreetApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' });
  const [splashTimerComplete, setSplashTimerComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null); // SeedstreetApp owns userProfile state
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
      setMaintenanceMode({ enabled: data.maintenance_mode_enabled, message: data.maintenance_mode_message || '' });
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
    startups, chats, communityPosts, messages, notifications, recentActivities,
    loadingData, investorCount, founderCount
  } = useAppData(isLoggedIn, userProfile?.id || null, currentScreen); // Pass userId directly

  // 3. Session check and initial screen determination
  useEffect(() => {
    const checkSessionAndDetermineScreen = async () => {
      if (!splashTimerComplete || currentScreen !== 'splash') {
        console.log("DEBUG: Skipping initial screen determination (splash not complete or not on splash screen).", { splashTimerComplete, currentScreen });
        return;
      }

      setLoadingSession(true);
      console.log("DEBUG: Starting session check...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const onboardingSeenLocally = await localforage.getItem('hasSeenOnboarding');

      if (sessionError) {
        console.error("DEBUG: Error getting session:", sessionError);
        setIsLoggedIn(false);
        if (!onboardingSeenLocally) {
          setCurrentScreen('onboarding');
          console.log("DEBUG: No session, onboarding not seen locally -> 'onboarding'");
        } else {
          setCurrentScreen('auth');
          console.log("DEBUG: No session, onboarding seen locally -> 'auth'");
        }
        setLoadingSession(false);
        return;
      }

      if (session) {
        console.log("DEBUG: Session found for user:", session.user.id);
        setIsLoggedIn(true);
        
        // Fetch user profile and use the returned value immediately
        const fetchedProfile = await fetchUserProfile(session.user.id); 

        if (fetchedProfile) {
          console.log("DEBUG: User profile found:", fetchedProfile);
          if (!fetchedProfile.role) {
            setCurrentScreen('roleSelector');
            console.log("DEBUG: Profile has no role -> 'roleSelector'");
          } else if (!fetchedProfile.onboarding_complete) {
            setCurrentScreen('onboarding');
            console.log("DEBUG: Profile has role but onboarding not complete -> 'onboarding'");
          } else {
            setCurrentScreen('home');
            console.log("DEBUG: Profile has role and onboarding complete -> 'home'");
          }
        } else {
          // This case should ideally not happen if fetchUserProfile sets userProfile correctly
          // but it handles scenarios where profile might not be found despite a session
          setCurrentScreen('roleSelector');
          console.log("DEBUG: Session found, but no profile in DB after fetchUserProfile -> 'roleSelector'");
        }
      } else { // No session (not logged in)
        console.log("DEBUG: No active session found.");
        setIsLoggedIn(false);
        if (!onboardingSeenLocally) {
          setCurrentScreen('onboarding');
          console.log("DEBUG: No session, onboarding not seen locally -> 'onboarding'");
        } else {
          setCurrentScreen('auth');
          console.log("DEBUG: No session, onboarding seen locally -> 'auth'");
        }
      }
      setLoadingSession(false);
    };

    checkSessionAndDetermineScreen();
  }, [splashTimerComplete, currentScreen, fetchUserProfile]); // fetchUserProfile is a dependency

  // Effect to periodically update user's last_active timestamp
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

  // Effect to control global loading indicator based on useAppData's loadingData
  useEffect(() => {
    if (currentScreen !== 'splash' && !loadingSession) {
      setShowGlobalLoadingIndicator(loadingData);
    } else {
      setShowGlobalLoadingIndicator(false);
    }
  }, [loadingData, currentScreen, loadingSession]);

  // Handle screen changes from child components
  const handleSetCurrentScreen = useCallback((screen: string, params?: any) => {
    setCurrentScreen(screen);
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
        setUserProfile(prev => prev ? { ...prev, onboarding_complete: true } : null);
        toast.success("Onboarding complete! Welcome to Seedstreet.");
        setCurrentScreen('home'); // Redirect to home for logged-in users
      }
    } else {
      setCurrentScreen('auth'); // Redirect to auth for unauthenticated users
    }
  }, [userProfile, setCurrentScreen]);

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
        <SeedstreetAppContent currentScreen="splash" setCurrentScreen={handleSetCurrentScreen} {...{
          isLoggedIn, setIsLoggedIn, loadingSession, maintenanceMode, fetchAppSettings, onboardingComplete: handleOnboardingComplete,
          userProfile, setUserProfile, startups, chats, communityPosts, messages, notifications, recentActivities,
          loadingData, fetchUserProfile: fetchUserProfile, investorCount, founderCount // Pass fetchUserProfile
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
        fetchUserProfile={fetchUserProfile} // Pass fetchUserProfile
        investorCount={investorCount}
        founderCount={founderCount}
      />
      <Toaster richColors position="top-center" />
    </ThemeProviderWrapper>
  );
};

export default SeedstreetApp;