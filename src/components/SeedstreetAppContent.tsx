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
import SplashScreen from './screens/SplashScreen';
import ScreenTransitionWrapper from './ScreenTransitionWrapper';
import { useNetworkStatus } from '@/hooks/use-network-status';

import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation';

import {
  Profile, Startup, Chat, Message, CommunityPost, Notification, ActivityLog, ScreenParams, MaintenanceModeSettings, MaintenanceModeScreenProps
} from '@/types'; // Import all types from the shared file, including MaintenanceModeScreenProps


// Prop interfaces for screens (defined here for dynamic imports)
interface OnboardingScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  onOnboardingComplete?: () => void; // Renamed to match usage
}

interface AuthScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
}

interface RoleSelectorScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
  investorCount: number;
  founderCount: number;
}

interface HomeScreenProps {
  userRole: string | null;
  startups: Startup[];
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean;
  userProfileId: string | null;
  userProfileName: string | null;
  userProfileEmail: string | null;
  handleStartChat: (startup: Startup) => Promise<void>;
  recentActivities: ActivityLog[];
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
  userProfile: Profile | null; // Added userProfile to HomeScreenProps
}

interface ChatListScreenProps {
  chats: Chat[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: 'investor' | 'founder' | 'admin' | null;
}

interface ChatConversationScreenProps {
  selectedChat: Chat | null;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  userProfile: Profile | null;
  logActivity: (type: string, description: string, entity_id: string | null, icon: string | null) => Promise<void>;
  fetchMessagesForChat: (chatId: string) => Promise<Message[] | null>;
}

interface ProfileScreenProps {
  userProfile: Profile | null;
  userRole: string | null;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserProfile: (profile: Profile | null) => void;
}

interface CommunityFeedScreenProps {
  communityPosts: CommunityPost[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: string | null;
  userProfileId: string | null;
  fetchCommunityPosts: () => Promise<void>;
}

interface EditProfileScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfile: Profile;
  setUserProfile: (profile: Profile | null) => void;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
}

interface ManageStartupScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfileId: string;
  userProfileName: string;
  userProfileEmail: string;
  startupId?: string;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  userProfileProAccount: boolean;
}

interface NotificationsScreenProps {
  notifications: Notification[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  fetchNotifications: () => void;
}

interface StartupListingCelebrationScreenProps {
  startupName: string;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

interface CreateCommunityPostScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfile: Profile;
  postId?: string;
}

interface HelpAndSupportScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

interface MerchStoreScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

interface CommunityPostDetailScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  selectedCommunityPostId: string;
  userProfile: Profile | null;
}

interface AdminDashboardScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  maintenanceMode: MaintenanceModeSettings;
  fetchAppSettings: () => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

interface SavedStartupsScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfileId: string | null; // Changed to string | null
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
  startups: Startup[];
}

interface SettingsScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

interface TermsAndPrivacyScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

interface StartupRoomScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  selectedStartup: Startup;
}

interface AuthActionScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  authActionType: 'forgotPassword' | 'changePassword';
}

interface NewChatScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfile: Profile;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
}

interface StartupDetailScreenProps {
  selectedStartup: Startup;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  activeTab: string;
  userRole: string | null;
  setActiveTab: (tab: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
  userProfile: Profile | null;
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
  userProfileId: string | null;
}

interface WelcomeFlyerProps {
  userName: string;
  onDismiss: () => void;
}

interface UpgradeToProScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}


// Dynamic imports for screens
const DynamicOnboardingScreen = dynamic<OnboardingScreenProps>(() => import('./screens/OnboardingScreen'), { ssr: false });
const DynamicAuthScreen = dynamic<AuthScreenProps>(() => import('@/components/screens/AuthScreen'), { ssr: false });
const DynamicRoleSelectorScreen = dynamic<RoleSelectorScreenProps>(() => import('./screens/RoleSelectorScreen'), { ssr: false });
const DynamicHomeScreen = dynamic<HomeScreenProps>(() => import('./screens/HomeScreen'), { ssr: false });
const DynamicChatListScreen = dynamic<ChatListScreenProps>(() => import('./screens/ChatListScreen'), { ssr: false });
const DynamicChatConversationScreen = dynamic<ChatConversationScreenProps>(() => import('./screens/ChatConversationScreen'), { ssr: false });
const DynamicProfileScreen = dynamic<ProfileScreenProps>(() => import('./screens/ProfileScreen'), { ssr: false });
const DynamicCommunityFeedScreen = dynamic<CommunityFeedScreenProps>(() => import('./screens/CommunityFeedScreen'), { ssr: false });
const DynamicEditProfileScreen = dynamic<EditProfileScreenProps>(() => import('./screens/EditProfileScreen'), { ssr: false });
const DynamicManageStartupScreen = dynamic<ManageStartupScreenProps>(() => import('./screens/ManageStartupScreen'), { ssr: false });
const DynamicNotificationsScreen = dynamic<NotificationsScreenProps>(() => import('./screens/NotificationsScreen'), { ssr: false });
const DynamicStartupListingCelebrationScreen = dynamic<StartupListingCelebrationScreenProps>(() => import('./screens/StartupListingCelebrationScreen'), { ssr: false });
const DynamicCreateCommunityPostScreen = dynamic<CreateCommunityPostScreenProps>(() => import('./screens/CreateCommunityPostScreen'), { ssr: false });
const DynamicHelpAndSupportScreen = dynamic<HelpAndSupportScreenProps>(() => import('./screens/HelpAndSupportScreen'), { ssr: false });
const DynamicMerchStoreScreen = dynamic<MerchStoreScreenProps>(() => import('./screens/MerchStoreScreen'), { ssr: false });
const DynamicCommunityPostDetailScreen = dynamic<CommunityPostDetailScreenProps>(() => import('./screens/CommunityPostDetailScreen'), { ssr: false });
const DynamicAdminDashboardScreen = dynamic<AdminDashboardScreenProps>(() => import('./screens/AdminDashboardScreen'), { ssr: false });
const DynamicSavedStartupsScreen = dynamic<SavedStartupsScreenProps>(() => import('./screens/SavedStartupsScreen'), { ssr: false });
const DynamicSettingsScreen = dynamic<SettingsScreenProps>(() => import('./screens/SettingsScreen'), { ssr: false });
const DynamicMaintenanceModeScreen = dynamic<MaintenanceModeScreenProps>(() => import('./screens/MaintenanceModeScreen'), { ssr: false });
const DynamicTermsAndPrivacyScreen = dynamic<TermsAndPrivacyScreenProps>(() => import('./screens/TermsAndPrivacyScreen'), { ssr: false });
const DynamicStartupRoomScreen = dynamic<StartupRoomScreenProps>(() => import('./screens/StartupRoomScreen'), { ssr: false });
const DynamicAuthActionScreen = dynamic<AuthActionScreenProps>(() => import('./screens/AuthActionScreen'), { ssr: false });
const DynamicNewChatScreen = dynamic<NewChatScreenProps>(() => import('./screens/NewChatScreen'), { ssr: false });
const DynamicStartupDetailScreen = dynamic<StartupDetailScreenProps>(() => import('./screens/StartupDetailScreen'), { ssr: false });
const DynamicWelcomeFlyer = dynamic<WelcomeFlyerProps>(() => import('./WelcomeFlyer'), { ssr: false });
const DynamicUpgradeToProScreen = dynamic<UpgradeToProScreenProps>(() => import('./screens/UpgradeToProScreen'), { ssr: false });


interface SeedstreetAppContentProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  loadingSession: boolean;
  maintenanceMode: MaintenanceModeSettings;
  fetchAppSettings: () => void;
  currentScreen: string;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  currentScreenParams: ScreenParams;
  onOnboardingComplete: () => void; // Renamed prop
  userProfile: Profile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<Profile | null>>; // Explicitly type setUserProfile
  startups: Startup[];
  chats: Chat[];
  communityPosts: CommunityPost[];
  notifications: Notification[];
  recentActivities: ActivityLog[];
  loadingData: boolean;
  fetchUserProfile: (userId: string) => Promise<Profile | null>; // Corrected return type
  investorCount: number;
  founderCount: number;
  fetchCommunityPosts: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStartups: () => Promise<void>;
}

const SeedstreetAppContent: React.FC<SeedstreetAppContentProps> = ({
  isLoggedIn,
  setIsLoggedIn,
  loadingSession,
  maintenanceMode,
  fetchAppSettings,
  currentScreen,
  setCurrentScreen,
  currentScreenParams,
  onOnboardingComplete, // Renamed prop
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
  fetchStartups,
}) => {
  const [screenHistory, setScreenHistory] = useState<string[]>([currentScreen]);
  const [activeTab, setActiveTab] = useState('home');

  const userRole = userProfile?.role || null;
  const userProfileId = userProfile?.id || null;
  const userProfileProAccount = userProfile?.pro_account || false;

  useNetworkStatus();

  const selectedStartupId = currentScreenParams.startupId;
  const listedStartupName = currentScreenParams.startupName;
  const selectedCommunityPostId = currentScreenParams.postId;
  const selectedChat = currentScreenParams.chat;
  const authActionType = currentScreenParams.authActionType;
  const selectedStartupRoomId = currentScreenParams.startupRoomId;

  const selectedStartup = useMemo(() => {
    if (selectedStartupId && startups.length > 0) {
      return startups.find(s => s.id === selectedStartupId) || null;
    }
    return null;
  }, [selectedStartupId, startups]);

  useEffect(() => {
    console.log("SeedstreetAppContent: currentScreen changed to:", currentScreen);
    setScreenHistory(prev => {
      if (prev[prev.length - 1] !== currentScreen) {
        return [...prev, currentScreen];
      }
      return prev;
    });
  }, [currentScreen]);

  const handleSetCurrentScreen = useCallback((screen: string, params?: ScreenParams) => {
    console.log("SeedstreetAppContent: handleSetCurrentScreen called with screen:", screen, "params:", params);
    setCurrentScreen(screen, params);
  }, [setCurrentScreen]);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
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
  const interestedStartups = userProfile?.interested_startups || [];

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
        setUserProfile((prev: Profile | null) => prev ? { ...prev, bookmarked_startups: variables.newBookmarks } : null);
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

    if (userProfile.id === startups.find(s => s.id === startupId)?.founder_id) {
      toast.info("You cannot bookmark your own startup.");
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
    async ({ userId, newInterests, startupId, newInterestsCount, founderId, startupName, isInterested, investorName, investorEmail }: {
      userId: string;
      newInterests: string[];
      startupId: string;
      newInterestsCount: number;
      founderId: string;
      startupName: string;
      isInterested: boolean;
      investorName: string | null;
      investorEmail: string | null;
    }) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ interested_startups: newInterests })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('update-startup-interest', {
        body: {
          startupId,
          newInterestsCount,
          founderId,
          startupName,
          isInterested,
          investorName,
          investorEmail,
        },
      });

      if (edgeFunctionError) {
        throw edgeFunctionError;
      }

      return { data: { newInterests, newInterestsCount }, error: null };
    },
    {
      onSuccess: (data, variables) => {
        setUserProfile((prev: Profile | null) => prev ? { ...prev, interested_startups: variables.newInterests } : null);
        toast.success(variables.isInterested ? "Interest removed!" : "Interest signaled!");
        logActivity(variables.isInterested ? 'interest_removed' : 'interest_added', `${variables.isInterested ? 'Removed' : 'Signaled'} interest in a startup`, variables.startupId, 'Eye');
        fetchStartups();
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

    if (userProfile.id === startups.find(s => s.id === startupId)?.founder_id) {
      toast.info("You cannot signal interest in your own startup.");
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
      investorName: userProfile.name,
      investorEmail: userProfile.email,
    });
  };

  const handleStartChat = async (startup: Startup) => {
    console.log("handleStartChat called for startup:", startup);
    if (!userProfile || userProfile.role !== 'investor') {
      toast.error("Only investors can start chats with founders.");
      return;
    }
    if (!userProfile.id || !userProfile.name) {
      toast.error("Your profile information is incomplete. Cannot start chat.");
      return;
    }

    if (userProfile.id === startup.founder_id) {
      toast.info("You cannot start a chat with your own startup. Use the 'Manage Startup' option.");
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

      try {
        const { data: updatedStartupMetrics, error: updateMetricsError } = await supabase.functions.invoke('update-startup-chat-metrics', {
          body: {
            startupId: startup.id,
            activeChats: startup.active_chats + 1,
            roomMembers: startup.room_members + 1,
          },
        });

        if (updateMetricsError) {
          console.error("Error invoking update-startup-chat-metrics function:", updateMetricsError);
          toast.error("Failed to update startup chat metrics.");
        } else {
          console.log("Startup chat metrics updated via Edge Function:", updatedStartupMetrics);
          fetchStartups();
        }
      } catch (invokeError: any) {
        console.error("Unexpected error during update-startup-chat-metrics invocation:", invokeError);
        toast.error("An unexpected error occurred while updating startup chat metrics.");
      }
    }

    if (chatToOpen) {
      handleSetCurrentScreen('chat', { chat: chatToOpen });
      setActiveTab('chats');
    }
  };

  const handleJoinStartupRoom = async (startup: Startup) => {
    if (!userProfile) {
      toast.error("Please log in to join a startup room.");
      return;
    }

    if (userProfile.id === startup.founder_id) {
      toast.info("You are the founder of this startup. You can manage it from your dashboard.");
      handleSetCurrentScreen('manageStartup', { startupId: startup.id });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('join-startup-room', {
        body: {
          startupId: startup.id,
          userId: userProfile.id,
        },
      });

      if (error) {
        toast.error("Failed to join room: " + error.message);
        console.error("Error invoking join-startup-room function:", error);
        return;
      }

      toast.success(`You've joined the ${startup.name} room!`);
      logActivity('joined_room', `Joined startup room: ${startup.name}`, startup.id, 'Users');
      fetchStartups();
      handleSetCurrentScreen('startupRoom', { startupRoomId: startup.id, startupId: startup.id });

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

  useEffect(() => {
    console.log("SeedstreetAppContent: Checking protected screen. isLoggedIn:", isLoggedIn, "currentScreen:", currentScreen, "loadingSession:", loadingSession);
    const isProtectedScreen = !['splash', 'onboarding', 'auth', 'roleSelector'].includes(currentScreen);
    if (!isLoggedIn && isProtectedScreen && !loadingSession) {
      console.log("SeedstreetAppContent: Redirecting to auth due to protected screen access.");
      setCurrentScreen('auth', {});
    }
  }, [isLoggedIn, currentScreen, loadingSession, setCurrentScreen]);

  if (maintenanceMode.enabled) {
    return (
      <DynamicMaintenanceModeScreen
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
        <DynamicOnboardingScreen setCurrentScreen={handleSetCurrentScreen} onOnboardingComplete={onOnboardingComplete} />
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
            setCurrentScreen={handleSetCurrentScreen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loadingData || bookmarkLoading || interestLoading}
            userProfileId={userProfileId}
            userProfileName={userProfile?.name || userProfile?.first_name || null}
            userProfileEmail={userProfile?.email || null}
            handleStartChat={handleStartChat}
            recentActivities={recentActivities}
            fetchStartups={fetchStartups}
            handleJoinStartupRoom={handleJoinStartupRoom}
            userProfile={userProfile} // Pass userProfile here
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
          userProfileId={userProfileId}
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
          activeTab={activeTab}
          userRole={userRole}
          setActiveTab={setActiveTab}
          handleStartChat={handleStartChat}
          logActivity={logActivity}
          fetchUserProfile={fetchUserProfile}
          userProfile={userProfile}
          fetchStartups={fetchStartups}
          handleJoinStartupRoom={handleJoinStartupRoom}
          userProfileId={userProfileId}
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
          userProfileProAccount={userProfileProAccount}
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
          userProfileId={userProfileId}
          bookmarkedStartups={bookmarkedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          handleStartChat={handleStartChat}
          interestedStartups={interestedStartups}
          fetchStartups={fetchStartups}
          handleJoinStartupRoom={handleJoinStartupRoom}
          startups={startups}
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
      {currentScreen === 'upgradeToPro' && (
        <DynamicUpgradeToProScreen
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}
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
        upgradeToPro: currentScreen === 'upgradeToPro',
      }).some(Boolean) && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-100 text-red-800 text-lg font-bold p-4 z-50">
          Error: Unknown Screen "{currentScreen}"
        </div>
      )}
    </ScreenTransitionWrapper>
  );
};

export default SeedstreetAppContent;