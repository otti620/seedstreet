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
import EditProfileScreen from './screens/EditProfileScreen'; // Import new EditProfileScreen
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
  role: 'investor' | 'founder' | null;
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
  description: string;
  category: string;
  room_members: number; // Changed to match schema
  active_chats: number; // Changed to match schema
  interests: number;
  founder_name: string; // Changed to match schema
  location: string; // Assuming location is a string
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


const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  // Real data states
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // For current chat messages

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Auto-advance from splash
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Supabase Auth Session Management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        // Clear local states related to user data
        // setBookmarkedStartups([]); // These are now derived from userProfile
        // setInterestedStartups([]); // These are now derived from userProfile
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    });

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  // Fetch User Profile
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
      // If profile doesn't exist, might need to redirect to role selection or profile creation
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
      // User exists but no profile data found, direct to role selector
      setCurrentScreen('roleSelector');
    }
    setLoadingData(false);
  };

  // Fetch Startups (for InvestorFeed)
  useEffect(() => {
    if (isLoggedIn && userRole === 'investor' && currentScreen === 'home' && activeTab === 'home') {
      const fetchStartups = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'Approved'); // Only show approved startups

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

  // Fetch Chats
  useEffect(() => {
    if (isLoggedIn && userProfile?.id && currentScreen === 'home' && activeTab === 'chats') {
      const fetchChats = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .contains('user_ids', [userProfile.id]); // Fetch chats where current user is a participant

        if (error) {
          console.error("Error fetching chats:", error);
          toast.error("Failed to load chats.");
          setChats([]);
        } else if (data) {
          setChats(data as Chat[]);
        }
        setLoadingData(false);
      };
      fetchChats();

      // Realtime subscription for chats
      const channel = supabase
        .channel('public:chats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, payload => {
          // Handle new chat, updates, or deletes
          fetchChats(); // Re-fetch all chats for simplicity
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, userProfile?.id, currentScreen, activeTab]);

  // Fetch Messages for selected chat
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

      // Realtime subscription for messages in the current chat
      const channel = supabase
        .channel(`chat:${selectedChat.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, payload => {
          // Handle new messages, updates, or deletes
          fetchMessages(); // Re-fetch messages for simplicity
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, selectedChat?.id, currentScreen]);

  // Fetch Community Posts
  useEffect(() => {
    if (isLoggedIn && currentScreen === 'home' && activeTab === 'community') {
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
      fetchCommunityPosts();

      // Realtime subscription for community posts
      const channel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, payload => {
          fetchCommunityPosts(); // Re-fetch posts for simplicity
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, currentScreen, activeTab]);


  // Update bookmarked/interested startups from profile
  const bookmarkedStartups = userProfile?.bookmarked_startups || [];
  const interestedStartups = userProfile?.interested_startups || [];

  // Toggle bookmark
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
    }
  };

  // Toggle interest
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
    }
  };

  // If session is still loading, show splash screen or a loading indicator
  if (loadingSession) {
    return <SplashScreen />;
  }

  // SCREENS

  // 1. SPLASH SCREEN (only shown initially if not authenticated)
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  // 2. ONBOARDING
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen setCurrentScreen={setCurrentScreen} />;
  }

  // 3. AUTH (SIGN IN / SIGN UP)
  if (currentScreen === 'auth') {
    return <AuthScreen setCurrentScreen={setCurrentScreen} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
  }

  // 4. ROLE SELECTOR
  if (currentScreen === 'roleSelector') {
    return <RoleSelectorScreen setCurrentScreen={setCurrentScreen} setUserRole={setUserRole} setActiveTab={setActiveTab} />;
  }

  // 5. HOME / FEED (Different for Investor vs Founder)
  if (currentScreen === 'home' && activeTab === 'home') {
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
      />
    );
  }

  // 6. STARTUP DETAIL PAGE
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
      />
    );
  }

  // 7. CHATS LIST
  if (currentScreen === 'home' && activeTab === 'chats') {
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
  }

  // 8. CHAT CONVERSATION
  if (currentScreen === 'chat' && selectedChat) {
    return (
      <ChatConversationScreen
        selectedChat={selectedChat}
        messages={messages}
        setCurrentScreen={setCurrentScreen}
        setActiveTab={setActiveTab}
        userProfileId={userProfile?.id || null}
        userProfileName={userProfile?.name || userProfile?.email || null} // Pass user's name or email
      />
    );
  }

  // 9. PROFILE
  if (currentScreen === 'home' && activeTab === 'profile') {
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
        setUserProfile={setUserProfile} // Pass setUserProfile
      />
    );
  }

  // 10. EDIT PROFILE
  if (currentScreen === 'editProfile' && userProfile) {
    return (
      <EditProfileScreen
        userProfile={userProfile}
        setCurrentScreen={setCurrentScreen}
        setUserProfile={setUserProfile}
      />
    );
  }

  // 11. COMMUNITY FEED
  if (currentScreen === 'home' && activeTab === 'community') {
    return (
      <CommunityFeedScreen
        communityPosts={communityPosts}
        setCurrentScreen={setCurrentScreen}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        userRole={userRole}
      />
    );
  }

  return null;
};

export default SeedstreetApp;