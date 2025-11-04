"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Rocket, Users, MessageCircle, User, Search, TrendingUp,
  Heart, Bookmark, Send, ArrowLeft, Plus, Settings,
  LogOut, Bell, Filter, Sparkles, DollarSign, Eye,
  MoreVertical, Check, ChevronRight, X, Menu, Home
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';
import MenuItem from './MenuItem';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from '@/components/screens/AuthScreen';
import RoleSelectorScreen from './screens/RoleSelectorScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import StartupDetailScreen from './screens/StartupDetailScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatConversationScreen from './screens/ChatConversationScreen';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import localforage from 'localforage';

// Define TypeScript interfaces for data structures
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
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
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

interface AppSettings {
  enabled: boolean;
  message: string;
}

const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreenState] = useState('splash');
  const [screenHistory, setScreenHistory] = useState<string[]>(['splash']); // To manage navigation history
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const [selectedStartupId, setSelectedStartupId] = useState<string | undefined>(undefined);
  const [listedStartupName, setListedStartupName] = useState<string | undefined>(undefined);
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState<string | undefined>(undefined);

  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<AppSettings>({ enabled: false, message: "" }); // New state for maintenance mode

  const [loadingSession, setLoadingSession] = useState(true); // True until session and profile are fully loaded
  const [loadingData, setLoadingData] = useState(false);
  // Removed isSplashFadingOut state and its related useEffect

  const setCurrentScreen = useCallback((screen: string, params?: { startupId?: string, startupName?: string, postId?: string, chatId?: string }) => {
    setCurrentScreenState(screen);
    setScreenHistory(prev => {
      // Only add to history if it's a new screen or not the immediate previous screen
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
      // Find and set the selected chat if chatId is provided
      const chatToSelect = chats.find(chat => chat.id === params.chatId);
      if (chatToSelect) {
        setSelectedChat(chatToSelect);
      } else {
        console.warn("Chat not found for ID:", params.chatId);
        setSelectedChat(null);
      }
    } else {
      setSelectedChat(null); // Clear selected chat if not navigating to a specific chat
    }
  }, [chats]);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        setCurrentScreenState(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      return prev; // Cannot go back further
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

  // Removed the useEffect that handled splash screen fade-out and transition to onboarding
  // The SplashScreen will now be controlled purely by `loadingSession`

  // Fetch app settings (including maintenance mode)
  const fetchAppSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'maintenance_mode_enabled')
      .single();

    if (error) {
      console.error("Error fetching app settings:", error);
      setMaintenanceMode({ enabled: false, message: "Failed to load app settings." });
    } else if (data?.setting_value) {
      setMaintenanceMode(data.setting_value as AppSettings);
    }
  }, []);

  useEffect(() => {
    fetchAppSettings();

    const appSettingsChannel = supabase
      .channel('public:app_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: `setting_key=eq.maintenance_mode_enabled` }, () => fetchAppSettings())
      .subscribe();

    return () => {
      supabase.removeChannel(appSettingsChannel);
    };
  }, [fetchAppSettings]);


  useEffect(() => {
    const handleAuthAndProfile = async (session: any | null) => {
      setLoadingSession(true); // Ensure loading state is true at the start of auth check
      if (session) {
        setIsLoggedIn(true);
        const userId = session.user.id;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching user profile:", profileError);
          toast.error("Failed to load user profile. Please complete onboarding.");
          setUserProfile(null);
          setUserRole(null);
          setCurrentScreen('roleSelector'); // If profile missing, go to role selector
        } else {
          // Check if role is set but onboarding_complete is false
          if (profileData.role && !profileData.onboarding_complete) {
            // Update onboarding_complete to true in the database
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ onboarding_complete: true })
              .eq('id', userId);

            if (updateError) {
              console.error("Error updating onboarding_complete:", updateError);
            } else {
              profileData.onboarding_complete = true;
            }
          }

          setUserProfile(profileData as Profile);
          setUserRole(profileData.role);
          
          // After loading session and profile, decide where to go.
          // If already on splash/onboarding/auth/roleSelector, navigate to appropriate screen.
          // Otherwise, stay on current screen (e.g., if user was on profile screen and refreshed).
          if (profileData.role === 'admin') {
            if (currentScreen === 'splash' || currentScreen === 'onboarding' || currentScreen === 'auth' || currentScreen === 'roleSelector') {
              setCurrentScreen('adminDashboard');
            }
          } else if (!profileData.onboarding_complete) {
            if (currentScreen === 'splash' || currentScreen === 'onboarding' || currentScreen === 'auth') {
              setCurrentScreen('roleSelector');
            }
          } else {
            if (currentScreen === 'splash' || currentScreen === 'onboarding' || currentScreen === 'auth' || currentScreen === 'roleSelector') {
              setCurrentScreen('home');
            }
          }
        }
      } else {
        // User is logged out
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        // Always go to auth screen if logged out, regardless of currentScreen state
        setCurrentScreen('auth');
      }
      setLoadingSession(false); // Set loading to false only after all checks are done
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
  }, [setCurrentScreen, currentScreen]);


  const bookmarkedStartups = userProfile?.bookmarked_startups || [];
  const interestedStartups = userProfile?.interested_startups || [];

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

    const { error } = await supabase
      .from('profiles')
      .update({ bookmarked_startups: newBookmarks })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to update bookmarks: " + error.message);
      console.error("Error updating bookmarks:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, bookmarked_startups: newBookmarks } : null);
      toast.success(isBookmarked ? "Bookmark removed!" : "Startup bookmarked!");
      logActivity(isBookmarked ? 'bookmark_removed' : 'bookmark_added', `${isBookmarked ? 'Removed' : 'Added'} a startup to bookmarks`, startupId, 'Bookmark');
    }
  };

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

    // Optimistic UI update for interested startups in user profile
    setUserProfile(prev => prev ? { ...prev, interested_startups: newInterests } : null);

    // Update user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ interested_startups: newInterests })
      .eq('id', userProfile.id);

    if (profileError) {
      toast.error("Failed to update interest in profile: " + profileError.message);
      console.error("Error updating interest in profile:", profileError);
      // Revert optimistic update on error
      setUserProfile(prev => prev ? { ...prev, interested_startups: currentInterests } : null);
      return;
    }

    // Now, update the 'interests' count in the 'startups' table
    const { data: startupData, error: fetchStartupError } = await supabase
      .from('startups')
      .select('interests, founder_id, name')
      .eq('id', startupId)
      .single();

    if (fetchStartupError || !startupData) {
      console.error("Error fetching startup for interest update:", fetchStartupError);
      toast.error("Failed to fetch startup details for interest update.");
      // Revert profile update if startup update fails
      setUserProfile(prev => prev ? { ...prev, interested_startups: currentInterests } : null);
      return;
    }

    const newInterestsCount = isInterested ? startupData.interests - 1 : startupData.interests + 1;

    const { error: startupUpdateError } = await supabase
      .from('startups')
      .update({ interests: newInterestsCount })
      .eq('id', startupId);

    if (startupUpdateError) {
      toast.error("Failed to update startup interest count: " + startupUpdateError.message);
      console.error("Error updating startup interest count:", startupUpdateError);
      // Revert profile update if startup update fails
      setUserProfile(prev => prev ? { ...prev, interested_startups: currentInterests } : null);
    } else {
      toast.success(isInterested ? "Interest removed!" : "Interest signaled!");
      logActivity(isInterested ? 'interest_removed' : 'interest_added', `${isInterested ? 'Removed' : 'Signaled'} interest in a startup`, startupId, 'Eye');

      if (!isInterested) { // Only send notification if interest was newly signaled
        await supabase.from('notifications').insert({
          user_id: startupData.founder_id,
          type: 'new_interest',
          message: `${userProfile.name || userProfile.email} is interested in your startup ${startupData.name}!`,
          link: `/startup/${startupId}`,
          related_entity_id: startupId,
        });
      }
    }
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

    setLoadingData(true);

    // Refined check for existing chat: investor_id, founder_id, AND startup_id
    const { data: existingChats, error: fetchChatError } = await supabase
      .from('chats')
      .select('*')
      .eq('investor_id', userProfile.id)
      .eq('founder_id', startup.founder_id)
      .eq('startup_id', startup.id) // Crucial for unique chat per startup
      .single();

    if (fetchChatError && fetchChatError.code !== 'PGRST116') { // PGRST116 means no rows found
      toast.error("Failed to check for existing chat: " + fetchChatError.message);
      console.error("Error checking existing chat:", fetchChatError);
      setLoadingData(false);
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
        setLoadingData(false);
        return;
      }

      if (founderProfile.role !== 'founder') {
        toast.error(`Cannot start chat: ${founderProfile.name || founderProfile.email?.split('@')[0] || 'This user'} is not registered as a founder.`);
        setLoadingData(false);
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
        setLoadingData(false);
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
    setLoadingData(false);
  };

  // --- Data Fetching Functions ---
  const fetchStartups = useCallback(async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'Approved'); // Only show approved startups to investors

    if (error) {
      console.error("Error fetching startups:", error);
      setStartups([]);
    } else if (data) {
      setStartups(data as Startup[]);
    }
    setLoadingData(false);
  }, []);

  const fetchChats = useCallback(async () => {
    if (!userProfile?.id) {
      setChats([]);
      return;
    }
    setLoadingData(true);
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [userProfile.id])
      .order('last_message_timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } else if (data) {
      setChats(data as Chat[]);
    }
    setLoadingData(false);
  }, [userProfile?.id]);

  const fetchCommunityPosts = useCallback(async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching community posts:", error);
      setCommunityPosts([]);
    } else if (data) {
      setCommunityPosts(data as CommunityPost[]);
    }
    setLoadingData(false);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }
    setLoadingData(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', selectedChat.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } else if (data) {
      setMessages(data as Message[]);
    }
    setLoadingData(false);
  }, [selectedChat?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!userProfile?.id) {
      setNotifications([]);
      return;
    }
    setLoadingData(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else if (data) {
      setNotifications(data as Notification[]);
    }
    setLoadingData(false);
  }, [userProfile?.id]);

  const fetchRecentActivities = useCallback(async () => {
    if (!userProfile?.id) {
      setRecentActivities([]);
      return;
    }
    setLoadingData(true);
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('timestamp', { ascending: false })
      .limit(5); // Fetch last 5 activities

    if (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    } else if (data) {
      setRecentActivities(data as ActivityLog[]);
    }
    setLoadingData(false);
  }, [userProfile?.id]);

  // --- Main Data Loading Effect ---
  useEffect(() => {
    if (isLoggedIn && userProfile?.id) {
      fetchStartups();
      fetchChats();
      fetchCommunityPosts();
      fetchNotifications();
      fetchRecentActivities();

      // Real-time subscriptions
      const startupChannel = supabase
        .channel('public:startups')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, () => fetchStartups())
        .subscribe();

      const chatChannel = supabase
        .channel('public:chats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_ids.cs.{${userProfile.id}}` }, () => fetchChats())
        .subscribe();

      const communityPostChannel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchCommunityPosts())
        .subscribe();

      const notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userProfile.id}` }, () => fetchNotifications())
        .subscribe();

      const activityLogChannel = supabase
        .channel('public:activity_log')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${userProfile.id}` }, () => fetchRecentActivities())
        .subscribe();

      return () => {
        supabase.removeChannel(startupChannel);
        supabase.removeChannel(chatChannel);
        supabase.removeChannel(communityPostChannel);
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(activityLogChannel);
      };
    }
  }, [isLoggedIn, userProfile?.id, fetchStartups, fetchChats, fetchCommunityPosts, fetchNotifications, fetchRecentActivities]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    fetchMessages();

    if (selectedChat?.id) {
      const messageChannel = supabase
        .channel(`public:messages:${selectedChat.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, () => fetchMessages())
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
      };
    }
  }, [selectedChat?.id, fetchMessages]);


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
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        variants={screenVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ type: "tween", duration: 0.2 }}
        className="fixed inset-0" // Ensure the motion.div covers the full screen
      >
        {currentScreen === 'onboarding' && <OnboardingScreen setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'auth' && <AuthScreen setCurrentScreen={setCurrentScreen} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />}
        {currentScreen === 'roleSelector' && <RoleSelectorScreen setCurrentScreen={setCurrentScreen} setUserRole={setUserRole} setActiveTab={setActiveTab} logActivity={logActivity} />}
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
            loading={loadingData}
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
            setUserRole={setUserRole}
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
            maintenanceMode={maintenanceMode} // Pass maintenance mode state
            fetchAppSettings={fetchAppSettings} // Pass function to update settings
            setIsLoggedIn={setIsLoggedIn} // Pass for logout
            setUserRole={setUserRole} // Pass for logout
          />
        )}
        {currentScreen === 'savedStartups' && userProfile && (
          <SavedStartupsScreen
            setCurrentScreen={setCurrentScreen}
            userProfileId={userProfile.id}
            bookmarkedStartupIds={bookmarkedStartups}
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
      </motion.div>
    </AnimatePresence>
  );
};

export default SeedstreetApp;