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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import localforage from 'localforage'; // Import localforage

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

// Custom hook for swipe-back gesture
const useSwipeBack = (onSwipeBack: () => void) => {
  const startX = useRef(0);
  const threshold = 80; // Pixels to swipe to trigger back action

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX.current;

    if (deltaX > threshold) {
      onSwipeBack();
    }
  }, [onSwipeBack]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
};


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

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [isSplashFadingOut, setIsSplashFadingOut] = useState(false);

  const setCurrentScreen = useCallback((screen: string, params?: { startupId?: string, startupName?: string, postId?: string }) => {
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
  }, []);

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

  useSwipeBack(goBack); // Integrate swipe-back gesture

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

  useEffect(() => {
    if (currentScreen === 'splash') {
      const fadeOutTimer = setTimeout(() => {
        setIsSplashFadingOut(true);
      }, 2000);

      const transitionTimer = setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 2500);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [currentScreen, setCurrentScreen]);

  useEffect(() => {
    const handleAuthAndProfile = async (session: any | null) => {
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
          setCurrentScreen('roleSelector'); // User logged in but no profile or onboarding incomplete
        } else {
          setUserProfile(profileData as Profile);
          setUserRole(profileData.role);
          if (!profileData.onboarding_complete) {
            setCurrentScreen('roleSelector');
          } else {
            setCurrentScreen('home');
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        // If no session, the app should naturally flow from splash -> onboarding -> auth
        // No need to explicitly set screen to 'auth' here, as onboarding handles it.
        // If currentScreen is already 'auth' (e.g., after logout), keep it.
        if (currentScreen !== 'auth' && currentScreen !== 'onboarding') {
             setCurrentScreen('onboarding'); // Ensure new users see onboarding
        }
      }
      setLoadingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      handleAuthAndProfile(session);
    });

    const getInitialSession = async () => {
      const { data: { session } = { session: null } } = await supabase.auth.getSession();
      console.log("Initial session:", session);
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
      ? currentInterests.filter(id => id !== userProfile.id) // Filter by userProfile.id, not startupId
      : [...currentInterests, userProfile.id]; // Add userProfile.id, not startupId

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

  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  if (loadingSession) {
    return <SplashScreen />;
  }

  // The splash screen handles its own fade-out and transition to 'onboarding'
  // So, if currentScreen is 'splash' and not fading out, render it.
  if (currentScreen === 'splash' && !isSplashFadingOut) {
    return <SplashScreen isFadingOut={isSplashFadingOut} />;
  }

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
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SeedstreetApp;