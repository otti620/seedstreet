"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";
import SeedstreetAppContent from './SeedstreetAppContent';
import { useAppData } from '@/hooks/use-app-data';
import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen';
import { Profile, ScreenParams, MaintenanceModeSettings } from '@/types'; // Import types from the shared file

const SeedstreetApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [currentScreenParams, setCurrentScreenParams] = useState<ScreenParams>({});
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceModeSettings>({ enabled: false, message: '' });
  const [splashTimerComplete, setSplashTimerComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [showGlobalLoadingIndicator, setShowGlobalLoadingIndicator] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTimerComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const {
    startups, chats, communityPosts, notifications, recentActivities,
    loadingData, investorCount, founderCount, fetchCommunityPosts, fetchNotifications,
    fetchStartups
  } = useAppData(isLoggedIn, userProfile?.id || null, currentScreen);

  useEffect(() => {
    const checkInitialSession = async () => {
      if (!splashTimerComplete) {
        return;
      }

      setLoadingSession(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const onboardingSeenLocally = await localforage.getItem('hasSeenOnboarding');

      if (sessionError || !session) {
        setIsLoggedIn(false);
        if (!onboardingSeenLocally) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('auth');
        }
      } else {
        setIsLoggedIn(true);
        const fetchedProfile = await fetchUserProfile(session.user.id);
        if (fetchedProfile) {
          if (!fetchedProfile.role) {
            setCurrentScreen('roleSelector');
          } else if (!fetchedProfile.onboarding_complete) {
            setCurrentScreen('onboarding');
          } else {
            setCurrentScreen('home');
          }
        } else {
          setCurrentScreen('roleSelector');
        }
      }
      setLoadingSession(false);
      setCurrentScreenParams({});
    };

    if (splashTimerComplete && currentScreen === 'splash') {
      checkInitialSession();
    }
  }, [splashTimerComplete, currentScreen, fetchUserProfile, setCurrentScreen, setIsLoggedIn, setCurrentScreenParams]);

  useEffect(() => {
    if (isLoggedIn && userProfile && !loadingSession) {
      const requiresNavigation =
        currentScreen === 'auth' ||
        currentScreen === 'onboarding' ||
        currentScreen === 'roleSelector';

      if (requiresNavigation) {
        if (!userProfile.role) {
          setCurrentScreen('roleSelector');
        } else if (!userProfile.onboarding_complete) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('home');
        }
      }
    }
  }, [isLoggedIn, userProfile, loadingSession, currentScreen, setCurrentScreen]);

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

      updateLastActive();
      interval = setInterval(updateLastActive, 30 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, userProfile?.id]);

  useEffect(() => {
    if (currentScreen !== 'splash' && !loadingSession) {
      setShowGlobalLoadingIndicator(loadingData);
    } else {
      setShowGlobalLoadingIndicator(false);
    }
  }, [loadingData, currentScreen, loadingSession]);

  const handleSetCurrentScreen = useCallback((screen: string, params?: ScreenParams) => {
    console.log("SeedstreetAppContent: handleSetCurrentScreen called with screen:", screen, "params:", params);
    setCurrentScreen(screen);
    setCurrentScreenParams(prevParams => {
      const newParams = params || {};
      if (JSON.stringify(prevParams) === JSON.stringify(newParams)) {
        return prevParams;
      }
      return newParams;
    });
  }, [setCurrentScreen, setCurrentScreenParams]);

  const handleOnboardingComplete = useCallback(async () => {
    await localforage.setItem('hasSeenOnboarding', true);

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
      }
    } else {
      setCurrentScreen('auth');
      setCurrentScreenParams({});
    }
  }, [userProfile, setCurrentScreen, setUserProfile, setCurrentScreenParams]);

  if (maintenanceMode.enabled) {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  if (!splashTimerComplete || loadingSession) {
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <GlobalLoadingIndicator loading={false} />
        <SeedstreetAppContent currentScreen="splash" setCurrentScreen={handleSetCurrentScreen} currentScreenParams={currentScreenParams} {...{
          isLoggedIn, setIsLoggedIn, loadingSession, maintenanceMode, fetchAppSettings, onOnboardingComplete: handleOnboardingComplete, // Renamed prop
          userProfile, setUserProfile, startups, chats, communityPosts, notifications, recentActivities,
          loadingData, fetchUserProfile: fetchUserProfile, investorCount, founderCount, fetchCommunityPosts, fetchNotifications,
          fetchStartups
        }} />
        <Toaster richColors position="top-center" />
      </NextThemesProvider>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GlobalLoadingIndicator loading={showGlobalLoadingIndicator} />
      <SeedstreetAppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        loadingSession={loadingSession}
        maintenanceMode={maintenanceMode}
        fetchAppSettings={fetchAppSettings}
        currentScreen={currentScreen}
        setCurrentScreen={handleSetCurrentScreen}
        currentScreenParams={currentScreenParams}
        onOnboardingComplete={handleOnboardingComplete} // Renamed prop
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
        fetchStartups={fetchStartups}
      />
      <Toaster richColors position="top-center" />
    </NextThemesProvider>
  );
};

export default SeedstreetApp;