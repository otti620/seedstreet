"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Rocket, Users, MessageCircle, User, Search, TrendingUp,
  Heart, Bookmark, Send, ArrowLeft, Plus, Settings,
  LogOut, Bell, Filter, Sparkles, DollarSign, Eye,
  MoreVertical, Check, ChevronRight, X, Menu, Home
} from 'lucide-react';
import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic
import BottomNav from './BottomNav';
import MenuItem from './MenuItem';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from '@/components/screens/AuthScreen';
import RoleSelectorScreen from './screens/RoleSelectorScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import StartupDetailScreen from './screens/StartupDetailScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatConversationScreen from './screens/screens/ChatConversationScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommunityFeedScreen from './screens/CommunityFeedScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ManageStartupScreen from './screens/ManageStartupScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import StartupListingCelebrationScreen from './screens/StartupListingCelebrationScreen';
import CreateCommunityPostScreen from './screens/CreateCommunityPostScreen';
import HelpAndSupportScreen from './screens/HelpAndSupportScreen';
import MerchStoreScreen from './screens/MerchStoreScreen';
import CommunityPostDetailScreen from './screens/CommunityPostDetailScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import SavedStartupsScreen from './screens/SavedStartupsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MaintenanceModeScreen from './screens/MaintenanceModeScreen'; // Import MaintenanceModeScreen
// Removed direct import for FramerMotionWrapper

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import localforage from 'localforage';
import { useAppData } from '@/hooks/use-app-data'; // Import the new hook
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation'; // Import the new mutation hook

// Dynamically import FramerMotionWrapper with ssr: false
const FramerMotionWrapper = dynamic(() => import('./FramerMotionWrapper'), { ssr: false });

// Define TypeScript interfaces for data structures (moved to use-app-data.tsx, but kept here for clarity if needed)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
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
}

interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  pitch: string;
  description: string | null;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
}

interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  isOnline: boolean;
  investor_id: string;
  founder_id: string;
  user_ids: string[];
  unread_counts: { [key: string]: number };
}


const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreenState] = useState('splash');
  const [screenHistory, setScreenHistory] = useState<string[]>(['splash']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true); // True until session and profile are fully loaded
  // Removed isClient state

  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const [selectedStartupId, setSelectedStartupId] = useState<string | undefined>(undefined);
  const [listedStartupName, setListedStartupName] = useState<string | undefined>(undefined);
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState<string | undefined>(undefined);

  // Use the new custom hook for data management
  const appData = useAppData({ // Assign to an intermediate variable
    userId: supabase.auth.currentUser?.id || null, // Pass current user ID from Supabase directly
    isLoggedIn,
    selectedChatId: selectedChat?.id || null,
  });

  const { // Destructure from the intermediate variable
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
  } = appData;

  // Derive userRole from userProfile returned by the hook
  const userRole = userProfile?.role || null;

  const setCurrentScreen = useCallback((screen: string, params?: { startupId?: string, startupName?: string, postId?: string, chatId?: string }) => {
    setCurrentScreenState(screen);
    setScreenHistory(prev => {
      if (prev[prev.length - 1] !== screen) {
        return [...prev, screen];
      }
      return prev;
    });

    if (params?.startupId) {
      setSelectedStartupId(params.startupId);
    } else {
      setSelectedStartupId(undefined);
    }
    if (params?.startupName) {
      setListedStartupName(params.startupName);
    } else {
      setListedStartupName(undefined);
    }
    if (params?.postId) {
      setSelectedCommunityPostId(params.postId);
    } else {
      setSelectedCommunityPostId(undefined);
    }
    if (params?.chatId) {
      const chatToSelect = chats.find(chat => chat.id === params.chatId);
      if (chatToSelect) {
        setSelectedChat(chatToSelect);
      } else {
        console.warn("Chat not found for ID:", params.chatId);
        setSelectedChat(null);
      }
    } else {
      setSelectedChat(null);
    }
  }, [chats]);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        setCurrentScreenState(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      return prev;
    });
  }, []);

  const logActivity = async (type: string, description: string, entity_id: string | null = null, icon: string | null = null) => {
    if (!userProfile?.id) {
      console.warn("Attempted to log activity without a user profile.");
      return;
    }
    const { error } = await supabase.from('activity_log').insert({
      user_id: userProfile.id,
      type,
      description,
      entity_id,
      icon,
    });
    if (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Auth state change listener
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
          setCurrentScreen('roleSelector');
        } else {
          if (profileData.role === 'admin') {
            setCurrentScreen('adminDashboard');
          } else if (!profileData.onboarding_complete) {
            setCurrentScreen('roleSelector');
          } else {
            setCurrentScreen('home');
          }
        }
      } else {
        setIsLoggedIn(false);
        setCurrentScreen('auth'); // Always go to auth screen if logged out
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
  }, [setCurrentScreen, setUserProfile]); // Depend on setUserProfile from useAppData

  const bookmarkedStartups = userProfile?.bookmarked_startups || [];
  const interestedStartups = userProfile?.interested_startups || [];

  // Mutation for toggling bookmark
  const { mutate: toggleBookmarkMutation, loading: bookmarkLoading } = useSupabaseMutation(
    async ({ userId, newBookmarks }: { userId: string; newBookmarks: string[] }) => {
      return supabase
        .from('profiles')
        .update({ bookmarked_startups: newBookmarks })
        .eq('id', userId)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        setUserProfile(prev => prev ? { ...prev, bookmarked_startups: data.bookmarked_startups } : null);
        const isBookmarked = data.bookmarked_startups.includes(selectedStartupId || ''); // Check against current selected startup
        toast.success(isBookmarked ? "Startup bookmarked!" : "Bookmark removed!");
        logActivity(isBookmarked ? 'bookmark_added' : 'bookmark_removed', `${isBookmarked ? 'Added' : 'Removed'} a startup to bookmarks`, selectedStartupId, 'Bookmark');
      },
      onError: (error) => {
        console.error("Error updating bookmarks:", error);
      },
      errorMessage: "Failed to update bookmarks.",
    }
  );

  const toggleBookmark = async (startupId: string) => {
    if (!userProfile) {
      toast.error("Please log in to bookmark startups.");
      return;
    }

    const currentBookmarks = userProfile.bookmarked_startups || [];
    const isBookmarked = currentBookmarks.includes(startupId);
    const newBookmarks = isBookmarked
      ? currentBookmarks.filter(id => id !== startupId)
      : [...currentBookmarks, startupId];

    await toggleBookmarkMutation({ userId: userProfile.id, newBookmarks });
  };

  // Mutation for toggling interest
  const { mutate: toggleInterestMutation, loading: interestLoading } = useSupabaseMutation(
    async ({ userId, newInterests, startupId, newInterestsCount, founderId, startupName, isInterested }: {
      userId: string;
      newInterests: string[];
      startupId: string;
      newInterestsCount: number;
      founderId: string;
      startupName: string;
      isInterested: boolean;
    }) => {
      // Perform profile update
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ interested_startups: newInterests })
        .eq('id', userId);

      if (profileError) {
        throw profileError; // Propagate error to be caught by useSupabaseMutation
      }

      // Perform startup interests count update
      const { error: startupUpdateError } = await supabase
        .from('startups')
        .update({ interests: newInterestsCount })
        .eq('id', startupId);

      if (startupUpdateError) {
        throw startupUpdateError; // Propagate error
      }

      // If interest was added, send notification
      if (!isInterested) {
        await supabase.from('notifications').insert({
          user_id: founderId,
          type: 'new_interest',
          message: `${userProfile?.name || userProfile?.email} is interested in your startup ${startupName}!`,
          link: `/startup/${startupId}`,
          related_entity_id: startupId,
        });
      }

      // Return data that reflects the new state for onSuccess
      return { data: { newInterests, newInterestsCount }, error: null };
    },
    {
      onSuccess: (data, variables) => {
        setUserProfile(prev => prev ? { ...prev, interested_startups: variables.newInterests } : null);
        toast.success(variables.isInterested ? "Interest removed!" : "Interest signaled!");
        logActivity(variables.isInterested ? 'interest_removed' : 'interest_added', `${variables.isInterested ? 'Removed' : 'Signaled'} interest in a startup`, variables.startupId, 'Eye');
      },
      onError: (error) => {
        console.error("Error updating interest:", error);
      },
      errorMessage: "Failed to update interest.",
    }
  );

  const toggleInterest = async (startupId: string) => {
    if (!userProfile) {
      toast.error("Please log in to signal interest.");
      return;
    }

    const currentInterests = userProfile.interested_startups || [];
    const isInterested = currentInterests.includes(startupId);
    const newInterests = isInterested
      ? currentInterests.filter(id => id !== startupId)
      : [...currentInterests, startupId];

    // Fetch startup data to get current interests count and founder_id
    const { data: startupData, error: fetchStartupError } = await supabase
      .from('startups')
      .select('interests, founder_id, name')
      .eq('id', startupId)
      .single();

    if (fetchStartupError || !startupData) {
      toast.error("Failed to fetch startup details for interest update.");
      console.error("Error fetching startup for interest update:", fetchStartupError);
      return;
    }

    const newInterestsCount = isInterested ? startupData.interests - 1 : startupData.interests + 1;

    await toggleInterestMutation({
      userId: userProfile.id,
      newInterests,
      startupId,
      newInterestsCount,
      founderId: startupData.founder_id,
      startupName: startupData.name,
      isInterested,
    });
  };

  const handleStartChat = async (startup: Startup) => {
    if (!userProfile || userProfile.role !== 'investor') {
      toast.error("Only investors can start chats with founders.");
      return;
    }
    if (!userProfile.id || !userProfile.name) {
      toast.error("Your profile information is incomplete. Cannot start chat.");
      return;
    }

    // This is a more complex multi-step operation, so we'll keep the direct Supabase calls for now
    // but we can wrap the entire sequence in a local loading state if needed.
    // For now, the global loading indicator from useAppData will cover the data fetches.

    const { data: existingChats, error: fetchChatError } = await supabase
      .from('chats')
      .select('*')
      .eq('investor_id', userProfile.id)
      .eq('founder_id', startup.founder_id)
      .eq('startup_id', startup.id)
      .single();

    if (fetchChatError && fetchChatError.code !== 'PGRST116') {
      toast.error("Failed to check for existing chat: " + fetchChatError.message);
      console.error("Error checking existing chat:", fetchChatError);
      return;
    }

    let chatToOpen: Chat | null = null;

    if (existingChats) {
      chatToOpen = existingChats as Chat;
      toast.info("Continuing existing chat.");
    } else {
      const { data: founderProfile, error: founderError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', startup.founder_id)
        .single();

      if (founderError || !founderProfile) {
        toast.error("Failed to get founder details. Cannot start chat.");
        console.error("Error fetching founder profile:", founderError);
        return;
      }

      if (founderProfile.role !== 'founder') {
        toast.error(`Cannot start chat: ${founderProfile.name || founderProfile.email?.split('@')[0] || 'This user'} is not registered as a founder.`);
        return;
      }

      const founderName = founderProfile.name || founderProfile.email?.split('@')[0] || 'Founder';

      const initialUnreadCounts = {
        [userProfile.id]: 0,
        [startup.founder_id]: 1,
      };

      const { data: newChat, error: createChatError } = await supabase
        .from('chats')
        .insert({
          user_ids: [userProfile.id, startup.founder_id],
          investor_id: userProfile.id,
          investor_name: userProfile.name,
          founder_id: startup.founder_id,
          founder_name: founderName,
          startup_id: startup.id,
          startup_name: startup.name,
          startup_logo: startup.logo,
          last_message_text: 'Chat initiated!',
          last_message_timestamp: new Date().toISOString(),
          unread_counts: initialUnreadCounts,
        })
        .select()
        .single();

      if (createChatError) {
        toast.error("Failed to start new chat: " + createChatError.message);
        console.error("Error creating new chat:", createChatError);
        return;
      }
      chatToOpen = newChat as Chat;
      toast.success("New chat started!");
      logActivity('chat_started', `Started a chat with ${founderName} about ${startup.name}`, chatToOpen.id, 'MessageCircle');

      await supabase.from('notifications').insert({
        user_id: startup.founder_id,
        type: 'new_chat',
        message: `${userProfile.name || userProfile.email} started a chat with you about ${startup.name}!`,
        link: `/chat/${chatToOpen.id}`,
        related_entity_id: chatToOpen.id,
      });
    }

    if (chatToOpen) {
      setSelectedChat(chatToOpen);
      setCurrentScreen('chat');
      setActiveTab('chats');
    }
  };

  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  // 1. Always show splash screen while session and profile are loading
  if (loadingSession) {
    return <SplashScreen />;
  }

  // 2. Once session and profile are loaded, check maintenance mode
  //    If maintenance is ON AND user is NOT admin, show maintenance screen
  if (maintenanceMode.enabled && userRole !== 'admin') {
    return <MaintenanceModeScreen message={maintenanceMode.message} />;
  }

  // 3. Otherwise, render the main application content based on currentScreen
  return (
    <FramerMotionWrapper currentScreen={currentScreen} screenVariants={screenVariants}>
      {currentScreen === 'onboarding' && <OnboardingScreen setCurrentScreen={setCurrentScreen} />}
      {currentScreen === 'auth' && <AuthScreen setCurrentScreen={setCurrentScreen} setIsLoggedIn={setIsLoggedIn} setUserProfile={setUserProfile} />}
      {currentScreen === 'roleSelector' && <RoleSelectorScreen setCurrentScreen={setCurrentScreen} setUserProfile={setUserProfile} setActiveTab={setActiveTab} logActivity={logActivity} />}
      {currentScreen === 'home' && (activeTab === 'home' || activeTab === 'startups') && (
        <HomeScreen
          userRole={userRole}
          startups={startups}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          setSelectedStartup={setSelectedStartup}
          setSelectedChat={setSelectedChat}
          setCurrentScreen={setCurrentScreen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loading={loadingData || bookmarkLoading || interestLoading} {/* Combine loading states */}
          userProfileId={userProfile?.id || null}
          userProfileName={userProfile?.name || userProfile?.first_name || null}
          userProfileEmail={userProfile?.email || null}
          handleStartChat={handleStartChat}
          recentActivities={recentActivities}
        />
      )}
      {currentScreen === 'home' && activeTab === 'chats' && (
        <ChatListScreen
          chats={chats}
          setCurrentScreen={setCurrentScreen}
          setSelectedChat={setSelectedChat}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
        />
      )}
      {currentScreen === 'home' && activeTab === 'community' && (
        <CommunityFeedScreen
          communityPosts={communityPosts}
          setCurrentScreen={setCurrentScreen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
          userProfileId={userProfile?.id || null}
          fetchCommunityPosts={fetchCommunityPosts}
        />
      )}
      {currentScreen === 'home' && activeTab === 'profile' && (
        <ProfileScreen
          userProfile={userProfile}
          userRole={userRole}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          setCurrentScreen={setCurrentScreen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          setIsLoggedIn={setIsLoggedIn}
          setUserProfile={setUserProfile}
        />
      )}
      {currentScreen === 'startupDetail' && selectedStartup && (
        <StartupDetailScreen
          selectedStartup={selectedStartup}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          setCurrentScreen={setCurrentScreen}
          setSelectedChat={setSelectedChat}
          activeTab={activeTab}
          userRole={userRole}
          setActiveTab={setActiveTab}
          handleStartChat={handleStartChat}
        />
      )}
      {currentScreen === 'chat' && selectedChat && (
        <ChatConversationScreen
          selectedChat={selectedChat}
          messages={messages}
          setCurrentScreen={setCurrentScreen}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          logActivity={logActivity}
        />
      )}
      {currentScreen === 'editProfile' && userProfile && (
        <EditProfileScreen
          userProfile={userProfile}
          setCurrentScreen={setCurrentScreen}
          setUserProfile={setUserProfile}
        />
      )}
      {currentScreen === 'manageStartup' && userProfile?.id && userProfile?.name && userProfile?.email && (
        <ManageStartupScreen
          setCurrentScreen={setCurrentScreen}
          userProfileId={userProfile.id}
          userProfileName={userProfile.name}
          userProfileEmail={userProfile.email}
          startupId={selectedStartupId}
          logActivity={logActivity}
        />
      )}
      {currentScreen === 'createCommunityPost' && userProfile && (
        <CreateCommunityPostScreen
          setCurrentScreen={setCurrentScreen}
          userProfile={userProfile}
          postId={selectedCommunityPostId}
        />
      )}
      {currentScreen === 'notifications' && userProfile && (
        <NotificationsScreen
          notifications={notifications}
          setCurrentScreen={setCurrentScreen}
          fetchNotifications={fetchNotifications}
        />
      )}
      {currentScreen === 'startupListingCelebration' && listedStartupName && (
        <StartupListingCelebrationScreen
          startupName={listedStartupName}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'helpAndSupport' && (
        <HelpAndSupportScreen
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'merchStore' && (
        <MerchStoreScreen
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'communityPostDetail' && selectedCommunityPostId && userProfile && (
        <CommunityPostDetailScreen
          setCurrentScreen={setCurrentScreen}
          selectedCommunityPostId={selectedCommunityPostId}
          userProfile={userProfile}
        />
      )}
      {currentScreen === 'adminDashboard' && userProfile?.role === 'admin' && (
        <AdminDashboardScreen
          setCurrentScreen={setCurrentScreen}
          maintenanceMode={maintenanceMode}
          fetchAppSettings={fetchAppSettings}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      {currentScreen === 'savedStartups' && userProfile && (
        <SavedStartupsScreen
          setCurrentScreen={setCurrentScreen}
          userProfileId={userProfile.id}
          bookmarkedStartups={bookmarkedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          setSelectedStartup={setSelectedStartup}
          handleStartChat={handleStartChat}
          interestedStartups={interestedStartups}
        />
      )}
      {currentScreen === 'settings' && (
        <SettingsScreen
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </FramerMotionWrapper>
  );
};

export default SeedstreetApp;