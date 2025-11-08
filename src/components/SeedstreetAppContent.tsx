"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Rocket, Users, MessageCircle, User, Search, TrendingUp,
  Heart, Bookmark, Send, ArrowLeft, Plus, Settings,
  LogOut, Bell, Filter, Sparkles, DollarSign, Eye,
  MoreVertical, Check, ChevronRight, X, Menu, Home
} from 'lucide-react';
import dynamic from 'next/dynamic';
import BottomNav from './BottomNav';
import MenuItem from './MenuItem';
import SplashScreen from './screens/SplashScreen'; // SplashScreen is directly imported as it's the initial fallback
import ScreenTransitionWrapper from './ScreenTransitionWrapper'; // Updated to default import
import { useNetworkStatus } from '@/hooks/use-network-status';

import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation';

// Define TypeScript interfaces for data structures (copied from use-app-data.tsx for consistency)
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
  amount_raised: number;
}

interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  investor_id: string;
  founder_id: string;
  user_ids: string[];
  unread_counts: { [key: string]: number };
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  read: boolean;
}

interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_id: number | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
  is_hidden: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  related_entity_id: string | null;
}

interface ActivityLog {
  id: string;
  user_id: string;
  type: string;
  description: string;
  timestamp: string;
  entity_id: string | null;
  icon: string | null;
}

// Define a type for screen parameters for better type safety
interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: Chat;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface SeedstreetAppContentProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  loadingSession: boolean;
  maintenanceMode: { enabled: boolean; message: string };
  fetchAppSettings: () => void;
  currentScreen: string;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated type for params
  currentScreenParams: ScreenParams; // NEW: Prop for current screen parameters
  onboardingComplete: () => void;
  userProfile: Profile | null;
  setUserProfile: (profile: Profile | null) => void;
  startups: Startup[];
  chats: Chat[];
  communityPosts: CommunityPost[];
  notifications: Notification[];
  recentActivities: ActivityLog[];
  loadingData: boolean;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
  investorCount: number;
  founderCount: number;
  fetchCommunityPosts: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStartups: () => Promise<void>; // NEW: Add fetchStartups prop
}

// Dynamic imports for screens
const DynamicOnboardingScreen = dynamic(() => import('./screens/OnboardingScreen'), { ssr: false });
const DynamicAuthScreen = dynamic(() => import('@/components/screens/AuthScreen'), { ssr: false });
const DynamicRoleSelectorScreen = dynamic(() => import('./screens/RoleSelectorScreen'), { ssr: false });
const DynamicHomeScreen = dynamic(() => import('./screens/HomeScreen'), { ssr: false });
const DynamicChatListScreen = dynamic(() => import('./screens/ChatListScreen'), { ssr: false });
const DynamicChatConversationScreen = dynamic(() => import('./screens/ChatConversationScreen'), { ssr: false });
const DynamicProfileScreen = dynamic(() => import('./screens/ProfileScreen'), { ssr: false });
const DynamicCommunityFeedScreen = dynamic(() => import('./screens/CommunityFeedScreen'), { ssr: false });
const DynamicEditProfileScreen = dynamic(() => import('./screens/EditProfileScreen'), { ssr: false });
const DynamicManageStartupScreen = dynamic(() => import('./screens/ManageStartupScreen'), { ssr: false });
const DynamicNotificationsScreen = dynamic(() => import('./screens/NotificationsScreen'), { ssr: false });
const DynamicStartupListingCelebrationScreen = dynamic(() => import('./screens/StartupListingCelebrationScreen'), { ssr: false });
const DynamicCreateCommunityPostScreen = dynamic(() => import('./screens/CreateCommunityPostScreen'), { ssr: false });
const DynamicHelpAndSupportScreen = dynamic(() => import('./screens/HelpAndSupportScreen'), { ssr: false });
const DynamicMerchStoreScreen = dynamic(() => import('./screens/MerchStoreScreen'), { ssr: false });
const DynamicCommunityPostDetailScreen = dynamic(() => import('./screens/CommunityPostDetailScreen'), { ssr: false });
const DynamicAdminDashboardScreen = dynamic(() => import('./screens/AdminDashboardScreen'), { ssr: false });
const DynamicSavedStartupsScreen = dynamic(() => import('./screens/SavedStartupsScreen'), { ssr: false });
const DynamicSettingsScreen = dynamic(() => import('./screens/SettingsScreen'), { ssr: false });
const DynamicMaintenanceModeScreen = dynamic(() => import('./screens/MaintenanceModeScreen'), { ssr: false });
const DynamicTermsAndPrivacyScreen = dynamic(() => import('./screens/TermsAndPrivacyScreen'), { ssr: false });
const DynamicStartupRoomScreen = dynamic(() => import('./screens/StartupRoomScreen'), { ssr: false });
const DynamicAuthActionScreen = dynamic(() => import('./screens/AuthActionScreen'), { ssr: false });
const DynamicNewChatScreen = dynamic(() => import('./screens/NewChatScreen'), { ssr: false });
const DynamicStartupDetailScreen = dynamic(() => import('./screens/StartupDetailScreen'), { ssr: false });
const DynamicWelcomeFlyer = dynamic(() => import('./WelcomeFlyer'), { ssr: false });


const SeedstreetAppContent: React.FC<SeedstreetAppContentProps> = ({
  isLoggedIn,
  setIsLoggedIn,
  loadingSession,
  maintenanceMode,
  fetchAppSettings,
  currentScreen,
  setCurrentScreen,
  currentScreenParams, // NEW: Destructure currentScreenParams
  onboardingComplete,
  userProfile,
  setUserProfile,
  startups,
  chats,
  communityPosts,
  notifications,
  recentActivities,
  loadingData,
  fetchUserProfile,
  investorCount,
  founderCount,
  fetchCommunityPosts,
  fetchNotifications,
  fetchStartups, // Destructure fetchStartups prop
}) => {
  const [screenHistory, setScreenHistory] = useState<string[]>([currentScreen]);
  const [activeTab, setActiveTab] = useState('home');

  const userRole = userProfile?.role || null;

  // Integrate network status hook
  useNetworkStatus();

  // NEW: Derive values directly from currentScreenParams
  const selectedStartupId = currentScreenParams.startupId;
  const listedStartupName = currentScreenParams.startupName;
  const selectedCommunityPostId = currentScreenParams.postId;
  const selectedChat = currentScreenParams.chat; // Directly use the chat object
  const authActionType = currentScreenParams.authActionType;
  const selectedStartupRoomId = currentScreenParams.startupRoomId;

  // NEW: Derive selectedStartup from startups array and selectedStartupId using useMemo
  const selectedStartup = useMemo(() => {
    if (selectedStartupId && startups.length > 0) {
      return startups.find(s => s.id === selectedStartupId) || null;
    }
    return null;
  }, [selectedStartupId, startups]);

  // Update screen history when currentScreen prop changes
  useEffect(() => {
    setScreenHistory(prev => {
      if (prev[prev.length - 1] !== currentScreen) {
        return [...prev, currentScreen];
      }
      return prev;
    });
  }, [currentScreen]);

  // Modified handleSetCurrentScreen to simply call the parent's setCurrentScreen
  const handleSetCurrentScreen = useCallback((screen: string, params?: ScreenParams) => { // Updated type for params
    setCurrentScreen(screen, params); // Pass both screen and params to the parent handler
  }, [setCurrentScreen]); // Dependency on parent's setCurrentScreen

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        // When going back, we don't have specific params, so pass an empty object
        handleSetCurrentScreen(newHistory[newHistory.length - 1], {});
        return newHistory;
      }
      return prev;
    });
  }, [handleSetCurrentScreen]);

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

  const bookmarkedStartups = userProfile?.bookmarked_startups || [];
  const interestedStartups = userProfile?.interested_startups || []; // Correctly derive here

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
      onSuccess: (data, variables) => {
        setUserProfile(prev => prev ? { ...prev, bookmarked_startups: variables.newBookmarks } : null);
        const isBookmarked = variables.newBookmarks.includes(selectedStartupId || '');
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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ interested_startups: newInterests })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      const { error: startupUpdateError } = await supabase
        .from('startups')
        .update({ interests: newInterestsCount })
        .eq('id', startupId);

      if (startupUpdateError) {
        throw startupUpdateError;
      }

      if (!isInterested) {
        await supabase.from('notifications').insert({
          user_id: founderId,
          type: 'new_interest',
          message: `${userProfile?.name || userProfile?.email} is interested in your startup ${startupName}!`,
          link: `/startup/${startupId}`,
          related_entity_id: startupId,
        });
      }

      return { data: { newInterests, newInterestsCount }, error: null };
    },
    {
      onSuccess: (data, variables) => {
        setUserProfile(prev => prev ? { ...prev, interested_startups: variables.newInterests } : null);
        toast.success(variables.isInterested ? "Interest removed!" : "Interest signaled!");
        logActivity(variables.isInterested ? 'interest_removed' : 'interest_added', `${variables.isInterested ? 'Removed' : 'Signaled'} interest in a startup`, variables.startupId, 'Eye');
        fetchStartups(); // NEW: Re-fetch startups to update counts
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

      // Increment active_chats and room_members for the startup
      // This still has the RLS issue, but will be addressed if it causes an error.
      const { data: updatedStartup, error: updateStartupError } = await supabase
        .from('startups')
        .update({
          active_chats: startup.active_chats + 1,
          room_members: startup.room_members + 1, // Assuming starting a chat also means joining the room
        })
        .eq('id', startup.id)
        .select('active_chats, room_members')
        .single();

      if (updateStartupError) {
        console.error("Error updating startup chat metrics:", updateStartupError);
        toast.error("Failed to update startup chat metrics.");
      } else {
        console.log("Startup chat metrics updated:", updatedStartup);
        fetchStartups(); // Re-fetch startups to update counts
      }

      await supabase.from('notifications').insert({
        user_id: startup.founder_id,
        type: 'new_chat',
        message: `${userProfile.name || userProfile.email} started a chat with you about ${startup.name}!`,
        link: `/chat/${chatToOpen.id}`,
        related_entity_id: chatToOpen.id,
      });
    }

    if (chatToOpen) {
      handleSetCurrentScreen('chat', { chat: chatToOpen }); // Pass the full chat object
      setActiveTab('chats');
    }
  };

  const handleJoinStartupRoom = async (startup: Startup) => {
    if (!userProfile) {
      toast.error("Please log in to join a startup room.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('join-startup-room', {
        body: {
          startupId: startup.id,
          userId: userProfile.id, // Pass user ID to the edge function
        },
      });

      if (error) {
        toast.error("Failed to join room: " + error.message);
        console.error("Error invoking join-startup-room function:", error);
        return;
      }

      // Assuming the edge function returns a success message and updated startup data
      toast.success(`You've joined the ${startup.name} room!`);
      logActivity('joined_room', `Joined startup room: ${startup.name}`, startup.id, 'Users');
      fetchStartups(); // Re-fetch startups to update counts in the UI
      handleSetCurrentScreen('startupRoom', { startupRoomId: startup.id });

    } catch (invokeError: any) {
      toast.error("An unexpected error occurred while joining the room.");
      console.error("Unexpected error during join-startup-room invocation:", invokeError);
    }
  };

  const handleDismissWelcomeFlyer = async () => {
    if (!userProfile?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ show_welcome_flyer: false })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to dismiss welcome message.");
      console.error("Error dismissing welcome flyer:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, show_welcome_flyer: false } : null);
    }
  };

  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const showWelcomeFlyer = userProfile?.show_welcome_flyer && currentScreen === 'home';

  const fetchMessagesForChat = useCallback(async (chatId: string): Promise<Message[] | null> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error("Error fetching messages for chat:", error);
      toast.error("Failed to load messages for this chat.");
      return null;
    }
    return data as Message[];
  }, []);

  // If not logged in and on a protected screen, redirect to auth
  useEffect(() => {
    const isProtectedScreen = !['splash', 'onboarding', 'auth', 'roleSelector'].includes(currentScreen);
    if (!isLoggedIn && isProtectedScreen && !loadingSession) {
      setCurrentScreen('auth', {}); // Corrected: Use setCurrentScreen with empty params
    }
  }, [isLoggedIn, currentScreen, loadingSession, setCurrentScreen]);


  if (maintenanceMode.enabled) {
    return (
      <DynamicMaintenanceModeScreen
        setCurrentScreen={handleSetCurrentScreen}
        message={maintenanceMode.message}
      />
    );
  }

  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  return (
    <ScreenTransitionWrapper currentScreen={currentScreen} screenVariants={screenVariants}>
      {currentScreen === 'onboarding' && (
        <DynamicOnboardingScreen setCurrentScreen={handleSetCurrentScreen} onboardingComplete={onboardingComplete} />
      )}
      {currentScreen === 'auth' && <DynamicAuthScreen setCurrentScreen={handleSetCurrentScreen} setIsLoggedIn={setIsLoggedIn} fetchUserProfile={fetchUserProfile} />}
      {currentScreen === 'roleSelector' && <DynamicRoleSelectorScreen setCurrentScreen={handleSetCurrentScreen} setActiveTab={setActiveTab} logActivity={logActivity} fetchUserProfile={fetchUserProfile} investorCount={investorCount} founderCount={founderCount} />}
      {currentScreen === 'home' && (activeTab === 'home' || activeTab === 'startups') && (
        <>
          <DynamicHomeScreen
            userRole={userRole}
            startups={startups}
            bookmarkedStartups={bookmarkedStartups}
            interestedStartups={interestedStartups}
            toggleBookmark={toggleBookmark}
            toggleInterest={toggleInterest}
            // Removed setSelectedStartup and setSelectedChat props
            setCurrentScreen={handleSetCurrentScreen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loadingData || bookmarkLoading || interestLoading}
            userProfileId={userProfile?.id || null}
            userProfileName={userProfile?.name || userProfile?.first_name || null}
            userProfileEmail={userProfile?.email || null}
            handleStartChat={handleStartChat}
            recentActivities={recentActivities}
            fetchStartups={fetchStartups}
            handleJoinStartupRoom={handleJoinStartupRoom}
          />
          {showWelcomeFlyer && (
            <DynamicWelcomeFlyer
              userName={userProfile?.name || userProfile?.first_name || 'User'}
              onDismiss={handleDismissWelcomeFlyer}
            />
          )}
        </>
      )}
      {currentScreen === 'home' && activeTab === 'chats' && (
        <DynamicChatListScreen
          chats={chats}
          setCurrentScreen={handleSetCurrentScreen}
          // Removed setSelectedChat prop
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
        />
      )}
      {currentScreen === 'home' && activeTab === 'community' && (
        <DynamicCommunityFeedScreen
          communityPosts={communityPosts}
          setCurrentScreen={handleSetCurrentScreen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
          userProfileId={userProfile?.id || null}
          fetchCommunityPosts={fetchCommunityPosts}
        />
      )}
      {currentScreen === 'home' && activeTab === 'profile' && (
        <DynamicProfileScreen
          userProfile={userProfile}
          userRole={userRole}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          setCurrentScreen={handleSetCurrentScreen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          setIsLoggedIn={setIsLoggedIn}
          setUserProfile={setUserProfile}
        />
      )}
      {currentScreen === 'startupDetail' && selectedStartup && (
        <DynamicStartupDetailScreen
          selectedStartup={selectedStartup}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          setCurrentScreen={handleSetCurrentScreen}
          // Removed setSelectedChat prop
          activeTab={activeTab}
          userRole={userRole}
          setActiveTab={setActiveTab}
          handleStartChat={handleStartChat}
          logActivity={logActivity}
          fetchUserProfile={fetchUserProfile}
          userProfile={userProfile}
          fetchStartups={fetchStartups}
          handleJoinStartupRoom={handleJoinStartupRoom}
        />
      )}
      {currentScreen === 'chat' && selectedChat && (
        <DynamicChatConversationScreen
          selectedChat={selectedChat}
          setCurrentScreen={handleSetCurrentScreen}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          logActivity={logActivity}
          fetchMessagesForChat={fetchMessagesForChat}
        />
      )}
      {currentScreen === 'editProfile' && userProfile && (
        <DynamicEditProfileScreen
          userProfile={userProfile}
          setCurrentScreen={handleSetCurrentScreen}
          setUserProfile={setUserProfile}
          logActivity={logActivity}
          fetchUserProfile={fetchUserProfile}
        />
      )}
      {currentScreen === 'manageStartup' && userProfile?.id && userProfile?.name && userProfile?.email && (
        <DynamicManageStartupScreen
          setCurrentScreen={handleSetCurrentScreen}
          userProfileId={userProfile.id}
          userProfileName={userProfile.name}
          userProfileEmail={userProfile.email}
          startupId={selectedStartupId}
          logActivity={logActivity}
        />
      )}
      {currentScreen === 'createCommunityPost' && userProfile && (
        <DynamicCreateCommunityPostScreen
          setCurrentScreen={handleSetCurrentScreen}
          userProfile={userProfile}
          postId={selectedCommunityPostId}
        />
      )}
      {currentScreen === 'notifications' && userProfile && (
        <DynamicNotificationsScreen
          notifications={notifications}
          setCurrentScreen={handleSetCurrentScreen}
          fetchNotifications={fetchNotifications}
        />
      )}
      {currentScreen === 'startupListingCelebration' && listedStartupName && (
        <DynamicStartupListingCelebrationScreen
          startupName={listedStartupName}
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
      {currentScreen === 'helpAndSupport' && (
        <DynamicHelpAndSupportScreen
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
      {currentScreen === 'merchStore' && (
        <DynamicMerchStoreScreen
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
      {currentScreen === 'communityPostDetail' && selectedCommunityPostId && userProfile && (
        <DynamicCommunityPostDetailScreen
          setCurrentScreen={handleSetCurrentScreen}
          selectedCommunityPostId={selectedCommunityPostId}
          userProfile={userProfile}
        />
      )}
      {currentScreen === 'adminDashboard' && userProfile?.role === 'admin' && (
        <DynamicAdminDashboardScreen
          setCurrentScreen={handleSetCurrentScreen}
          maintenanceMode={maintenanceMode}
          fetchAppSettings={fetchAppSettings}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
      {currentScreen === 'savedStartups' && userProfile && (
        <DynamicSavedStartupsScreen
          setCurrentScreen={handleSetCurrentScreen}
          userProfileId={userProfile.id}
          bookmarkedStartups={bookmarkedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          // Removed setSelectedStartup prop
          handleStartChat={handleStartChat}
          interestedStartups={interestedStartups}
          fetchStartups={fetchStartups}
          handleJoinStartupRoom={handleJoinStartupRoom}
        />
      )}
      {currentScreen === 'settings' && (
        <DynamicSettingsScreen
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
      {currentScreen === 'termsAndPrivacy' && (
        <DynamicTermsAndPrivacyScreen
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
      {currentScreen === 'startupRoom' && selectedStartupRoomId && selectedStartup && (
        <DynamicStartupRoomScreen
          setCurrentScreen={handleSetCurrentScreen}
          selectedStartup={selectedStartup}
        />
      )}
      {currentScreen === 'authAction' && authActionType && (
        <DynamicAuthActionScreen
          setCurrentScreen={handleSetCurrentScreen}
          authActionType={authActionType}
        />
      )}
      {currentScreen === 'newChat' && userProfile && (
        <DynamicNewChatScreen
          setCurrentScreen={handleSetCurrentScreen}
          userProfile={userProfile}
          logActivity={logActivity}
        />
      )}
      {/* Fallback for unhandled screens */}
      {!Object.values({
        onboarding: currentScreen === 'onboarding',
        auth: currentScreen === 'auth',
        roleSelector: currentScreen === 'roleSelector',
        home: currentScreen === 'home',
        startupDetail: currentScreen === 'startupDetail' && selectedStartup,
        chat: currentScreen === 'chat' && selectedChat,
        editProfile: currentScreen === 'editProfile' && userProfile,
        manageStartup: currentScreen === 'manageStartup' && userProfile?.id && userProfile?.name && userProfile?.email,
        createCommunityPost: currentScreen === 'createCommunityPost' && userProfile,
        notifications: currentScreen === 'notifications' && userProfile,
        startupListingCelebration: currentScreen === 'startupListingCelebration' && listedStartupName,
        helpAndSupport: currentScreen === 'helpAndSupport',
        merchStore: currentScreen === 'merchStore',
        communityPostDetail: currentScreen === 'communityPostDetail' && selectedCommunityPostId && userProfile,
        adminDashboard: currentScreen === 'adminDashboard' && userProfile?.role === 'admin',
        savedStartups: currentScreen === 'savedStartups' && userProfile,
        settings: currentScreen === 'settings',
        termsAndPrivacy: currentScreen === 'termsAndPrivacy',
        startupRoom: currentScreen === 'startupRoom' && selectedStartupRoomId && selectedStartup,
        authAction: currentScreen === 'authAction' && authActionType,
        newChat: currentScreen === 'newChat' && userProfile,
      }).some(Boolean) && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-100 text-red-800 text-lg font-bold p-4 z-50">
          Error: Unknown Screen "{currentScreen}"
        </div>
      )}
    </ScreenTransitionWrapper>
  );
};

export default SeedstreetAppContent;