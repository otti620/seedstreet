"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Users, MessageCircle, User, Search, TrendingUp, 
  Heart, Bookmark, Send, ArrowLeft, Plus, Settings, 
  LogOut, Bell, Filter, Sparkles, DollarSign, Eye,
  MoreVertical, Check, ChevronRight, X, Menu, Home
} from 'lucide-react';
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
import AdminDashboardScreen from './screens/AdminDashboardScreen'; // Import AdminDashboardScreen
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define TypeScript interfaces for data structures
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null; // Added 'admin' role
  onboarding_complete: boolean;
  bookmarked_startups: string[]; // Array of startup IDs
  interested_startups: string[]; // Array of startup IDs
  bio: string | null;
  location: string | null;
  phone: string | null;
}

interface Startup {
  id: string; // Changed to string to match UUID
  name: string;
  logo: string; // Assuming logo is a string (e.g., emoji or URL)
  tagline: string;
  pitch: string; // Added as required
  description: string | null; // Made nullable
  category: string;
  room_members: number; // Changed to match schema
  active_chats: number; // Changed to match schema
  interests: number;
  founder_name: string; // Changed to match schema
  location: string; // Assuming location is a string
  founder_id: string; // Added founder_id for chat creation
  amount_sought: number | null; // Added
  currency: string | null; // Added
  funding_stage: string | null; // Added
}

interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  isOnline: boolean; // This might need to be derived or fetched separately
  investor_id: string; // Added for chat creation logic
  founder_id: string; // Added for chat creation logic
  user_ids: string[]; // Added for chat creation logic
  unread_counts: { [key: string]: number }; // Added for read receipts
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
  likes: string[]; // Array of user IDs who liked
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

interface ActivityLog { // New interface for activity log entries
  id: string;
  user_id: string;
  type: string; // e.g., 'startup_listed', 'chat_started', 'profile_updated', 'bookmark_added'
  description: string;
  timestamp: string;
  entity_id: string | null; // ID of the related entity (startup, chat, etc.)
  icon: string | null; // Lucide icon name or emoji
}


const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreenState] = useState('splash');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  const [selectedStartupId, setSelectedStartupId] = useState<string | undefined>(undefined);
  const [listedStartupName, setListedStartupName] = useState<string | undefined>(undefined); // New state for celebration screen
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState<string | undefined>(undefined); // New state for community post detail

  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]); // New state for recent activities

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [isSplashFadingOut, setIsSplashFadingOut] = useState(false); // New state for splash fade-out

  const setCurrentScreen = (screen: string, params?: { startupId?: string, startupName?: string, postId?: string }) => {
    setCurrentScreenState(screen);
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
  };

  // Function to log activity
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
        setIsSplashFadingOut(true); // Start fade-out animation
      }, 2000); // Start fading after 2 seconds

      const transitionTimer = setTimeout(() => {
        setCurrentScreen('onboarding'); // Transition to next screen after fade
      }, 2500); // Total time for splash screen (2s + 0.5s fade)

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [currentScreen]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    });

    const getInitialSession = async () => {
      const { data: { session } = { session: null } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile.");
      setUserProfile(null);
      setUserRole(null);
      setCurrentScreen('roleSelector'); 
    } else if (data) {
      setUserProfile(data as Profile);
      setUserRole(data.role);
      if (!data.onboarding_complete) {
        setCurrentScreen('roleSelector');
      } else {
        setCurrentScreen('home');
      }
    } else {
      setCurrentScreen('roleSelector');
    }
    setLoadingData(false);
  };

  useEffect(() => {
    // Fetch startups if logged in as investor and on 'home' or 'startups' tab
    if (isLoggedIn && userRole === 'investor' && currentScreen === 'home' && (activeTab === 'home' || activeTab === 'startups')) {
      const fetchStartups = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'Approved');

        if (error) {
          console.error("Error fetching startups:", error);
          toast.error("Failed to load startups.");
          setStartups([]);
        } else if (data) {
          setStartups(data as Startup[]);
        }
        setLoadingData(false);
      };
      fetchStartups();
    }
  }, [isLoggedIn, userRole, currentScreen, activeTab]);

  useEffect(() => {
    if (isLoggedIn && userProfile?.id && currentScreen === 'home' && activeTab === 'chats') {
      const fetchChats = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*, unread_counts'); // Select unread_counts
          // .contains('user_ids', [userProfile.id]); // Fetch chats where current user is a participant
          // The RLS policy already handles this, so no need for .contains() here.

        if (error) {
          console.error("Error fetching chats:", error);
          toast.error("Failed to load chats.");
          setChats([]);
        } else if (data) {
          // Calculate unread_count for display based on current user's ID
          const chatsWithUnreadCount = data.map(chat => ({
            ...chat,
            unread_count: chat.unread_counts?.[userProfile.id] || 0,
          }));
          setChats(chatsWithUnreadCount as Chat[]);
        }
        setLoadingData(false);
      };
      fetchChats();

      const channel = supabase
        .channel('public:chats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, payload => {
          fetchChats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, userProfile?.id, currentScreen, activeTab]);

  useEffect(() => {
    if (isLoggedIn && selectedChat?.id && currentScreen === 'chat') {
      const fetchMessages = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', selectedChat.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to load messages.");
          setMessages([]);
        } else if (data) {
          setMessages(data as Message[]);
        }
        setLoadingData(false);
      };
      fetchMessages();

      const channel = supabase
        .channel(`chat:${selectedChat.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, payload => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, selectedChat?.id, currentScreen]);

  const fetchCommunityPosts = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching community posts:", error);
      toast.error("Failed to load community posts.");
      setCommunityPosts([]);
    } else if (data) {
      setCommunityPosts(data as CommunityPost[]);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (isLoggedIn && currentScreen === 'home' && (activeTab === 'community' || currentScreen === 'communityPostDetail')) {
      fetchCommunityPosts();

      const channel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, payload => {
          fetchCommunityPosts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, currentScreen, activeTab]);

  const fetchNotifications = async () => {
    if (!userProfile?.id) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications.");
      setNotifications([]);
    } else if (data) {
      setNotifications(data as Notification[]);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (isLoggedIn && userProfile?.id && currentScreen === 'notifications') {
      fetchNotifications();

      const channel = supabase
        .channel(`user_notifications:${userProfile.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userProfile.id}` }, payload => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, userProfile?.id, currentScreen]);

  // Fetch Recent Activities for the current user
  const fetchRecentActivities = async () => {
    if (!userProfile?.id) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('timestamp', { ascending: false })
      .limit(5); // Fetch a few recent activities

    if (error) {
      console.error("Error fetching recent activities:", error);
      // toast.error("Failed to load recent activities."); // Don't spam user with this error
      setRecentActivities([]);
    } else if (data) {
      setRecentActivities(data as ActivityLog[]);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (isLoggedIn && userProfile?.id && currentScreen === 'home' && userRole === 'founder') {
      fetchRecentActivities();

      // Realtime subscription for activity log
      const channel = supabase
        .channel(`user_activity:${userProfile.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${userProfile.id}` }, payload => {
          fetchRecentActivities();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, userProfile?.id, currentScreen, userRole]);


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

    const { error } = await supabase
      .from('profiles')
      .update({ interested_startups: newInterests })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to update interest: " + error.message);
      console.error("Error updating interest:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, interested_startups: newInterests } : null);
      toast.success(isInterested ? "Interest removed!" : "Interest signaled!");
      logActivity(isInterested ? 'interest_removed' : 'interest_added', `${isInterested ? 'Removed' : 'Signaled'} interest in a startup`, startupId, 'Eye');
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
    
    // Check if a chat already exists between this investor and founder for this startup
    const { data: existingChats, error: fetchChatError } = await supabase
      .from('chats')
      .select('*')
      .eq('investor_id', userProfile.id)
      .eq('founder_id', startup.founder_id)
      .eq('startup_id', startup.id)
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
      // Fetch founder's name and role for the chat
      const { data: founderProfile, error: founderError } = await supabase
        .from('profiles')
        .select('name, email, role') // Select role as well
        .eq('id', startup.founder_id)
        .single();

      if (founderError || !founderProfile) {
        toast.error("Failed to get founder details. Cannot start chat.");
        console.error("Error fetching founder profile:", founderError);
        setLoadingData(false);
        return;
      }

      if (founderProfile.role !== 'founder') { // New check: Ensure target is a founder
        toast.error(`Cannot start chat: ${founderProfile.name || founderProfile.email?.split('@')[0] || 'This user'} is not registered as a founder.`);
        setLoadingData(false);
        return;
      }

      const founderName = founderProfile.name || founderProfile.email?.split('@')[0] || 'Founder';

      // Initialize unread_counts for both users, marking 1 unread for the founder
      const initialUnreadCounts = {
        [userProfile.id]: 0, // Investor starts the chat, so 0 unread for them
        [startup.founder_id]: 1, // 1 unread for the founder
      };

      // Create a new chat
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
          unread_counts: initialUnreadCounts, // Use initialUnreadCounts
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
    }

    if (chatToOpen) {
      setSelectedChat(chatToOpen);
      setCurrentScreen('chat');
      setActiveTab('chats'); // Ensure chats tab is active
    }
    setLoadingData(false);
  };


  if (loadingSession) {
    return <SplashScreen />;
  }

  // Render SplashScreen with fade-out class if it's the current screen
  if (currentScreen === 'splash') {
    return <SplashScreen isFadingOut={isSplashFadingOut} />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === 'auth') {
    return <AuthScreen setCurrentScreen={setCurrentScreen} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
  }

  if (currentScreen === 'roleSelector') {
    return <RoleSelectorScreen setCurrentScreen={setCurrentScreen} setUserRole={setUserRole} setActiveTab={setActiveTab} logActivity={logActivity} />;
  }

  // Handle all 'home' related screens based on activeTab
  if (currentScreen === 'home') {
    if (activeTab === 'home' || activeTab === 'startups') { // Render HomeScreen for both 'home' and 'startups' tabs
      return (
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
          recentActivities={recentActivities} // Pass recent activities
        />
      );
    } else if (activeTab === 'chats') {
      return (
        <ChatListScreen
          chats={chats}
          setCurrentScreen={setCurrentScreen}
          setSelectedChat={setSelectedChat}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
        />
      );
    } else if (activeTab === 'community') {
      return (
        <CommunityFeedScreen
          communityPosts={communityPosts}
          setCurrentScreen={setCurrentScreen}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          userRole={userRole}
          userProfileId={userProfile?.id || null} // Pass userProfileId
          fetchCommunityPosts={fetchCommunityPosts} // Pass fetch function
        />
      );
    } else if (activeTab === 'profile') {
      return (
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
      );
    }
  }

  // Other specific screens outside the main tab navigation
  if (currentScreen === 'startupDetail' && selectedStartup) {
    return (
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
    );
  }

  if (currentScreen === 'chat' && selectedChat) {
    return (
      <ChatConversationScreen
        selectedChat={selectedChat}
        messages={messages}
        setCurrentScreen={setCurrentScreen}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        logActivity={logActivity} // Pass logActivity
      />
    );
  }

  if (currentScreen === 'editProfile' && userProfile) {
    return (
      <EditProfileScreen
        userProfile={userProfile}
        setCurrentScreen={setCurrentScreen}
        setUserProfile={setUserProfile}
      />
    );
  }

  if (currentScreen === 'manageStartup' && userProfile?.id && userProfile?.name && userProfile?.email) {
    return (
      <ManageStartupScreen
        setCurrentScreen={setCurrentScreen}
        userProfileId={userProfile.id}
        userProfileName={userProfile.name}
        userProfileEmail={userProfile.email}
        startupId={selectedStartupId}
        logActivity={logActivity} // Pass logActivity
      />
    );
  }

  if (currentScreen === 'createCommunityPost' && userProfile) {
    return (
      <CreateCommunityPostScreen
        setCurrentScreen={setCurrentScreen}
        userProfile={userProfile}
      />
    );
  }

  if (currentScreen === 'notifications' && userProfile) {
    return (
      <NotificationsScreen
        notifications={notifications}
        setCurrentScreen={setCurrentScreen}
        fetchNotifications={fetchNotifications}
      />
    );
  }

  if (currentScreen === 'startupListingCelebration' && listedStartupName) {
    return (
      <StartupListingCelebrationScreen
        startupName={listedStartupName}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  // New screen for Help & Support
  if (currentScreen === 'helpAndSupport') {
    return (
      <HelpAndSupportScreen
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  // New screen for Merch Store
  if (currentScreen === 'merchStore') {
    return (
      <MerchStoreScreen
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  // New screen for Community Post Detail
  if (currentScreen === 'communityPostDetail' && selectedCommunityPostId && userProfile) {
    return (
      <CommunityPostDetailScreen
        setCurrentScreen={setCurrentScreen}
        selectedCommunityPostId={selectedCommunityPostId}
        userProfile={userProfile}
      />
    );
  }

  // New screen for Admin Dashboard (only accessible to admins)
  if (currentScreen === 'adminDashboard' && userProfile?.role === 'admin') {
    return (
      <AdminDashboardScreen
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  return null;
};

export default SeedstreetApp;