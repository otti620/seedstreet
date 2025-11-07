"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
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
  last_seen: string | null;
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

export const useAppData = (
  isLoggedIn: boolean,
  userProfile: Profile | null, // Now passed in from SeedstreetApp
  setUserProfile: (profile: Profile | null) => void, // Now passed in from SeedstreetApp
  currentScreen: string, // To decide when to fetch
) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [investorCount, setInvestorCount] = useState(0);
  const [founderCount, setFounderCount] = useState(0);

  // Memoized fetch functions
  const fetchUserProfile = useCallback(async () => {
    if (!userProfile?.id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userProfile.id)
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
    } else if (data) {
      setUserProfile(data); // This updates the userProfile state in SeedstreetApp
    }
  }, [userProfile?.id, setUserProfile]);

  const fetchStartups = useCallback(async () => {
    const { data, error } = await supabase.from('startups').select('*');
    if (error) {
      console.error("Error fetching startups:", error);
    } else {
      setStartups(data || []);
    }
  }, []);

  const fetchChats = useCallback(async () => {
    if (!userProfile?.id) return;
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [userProfile.id])
      .order('last_message_timestamp', { ascending: false });
    if (error) {
      console.error("Error fetching chats:", error);
    } else {
      setChats(data || []);
    }
  }, [userProfile?.id]);

  const fetchCommunityPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching community posts:", error);
    } else {
      setCommunityPosts(data || []);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    // This should ideally fetch messages for the currently selected chat, not all messages
    // For now, keeping it simple, but will need refinement for performance
    if (chats.length === 0) {
      setMessages([]);
      return;
    }
    const chatIds = chats.map(chat => chat.id);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  }, [chats]);

  const fetchNotifications = useCallback(async () => {
    if (!userProfile?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data || []);
    }
  }, [userProfile?.id]);

  const fetchRecentActivities = useCallback(async () => {
    if (!userProfile?.id) return;
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('timestamp', { ascending: false })
      .limit(5);
    if (error) {
      console.error("Error fetching recent activities:", error);
    } else {
      setRecentActivities(data || []);
    }
  }, [userProfile?.id]);

  const fetchUserCounts = useCallback(async () => {
    const { count: investors, error: investorError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'investor');
    if (!investorError) setInvestorCount(investors || 0);

    const { count: founders, error: founderError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'founder');
    if (!founderError) setFounderCount(founders || 0);
  }, []);

  // Effect for fetching ALL data when logged in and profile is available
  useEffect(() => {
    // Only fetch data if logged in, profile is available, and not on initial screens
    if (isLoggedIn && userProfile?.id && !['splash', 'auth', 'roleSelector', 'onboarding'].includes(currentScreen)) {
      const fetchData = async () => {
        setLoadingData(true);
        await Promise.all([
          fetchUserProfile(), // This will update the userProfile state passed from SeedstreetApp
          fetchStartups(),
          fetchChats(),
          fetchCommunityPosts(),
          fetchMessages(),
          fetchNotifications(),
          fetchRecentActivities(),
          fetchUserCounts(),
        ]);
        setLoadingData(false);
      };
      fetchData();
    } else if (!isLoggedIn) {
      // Clear data if logged out
      setStartups([]);
      setChats([]);
      setCommunityPosts([]);
      setMessages([]);
      setNotifications([]);
      setRecentActivities([]);
      setInvestorCount(0);
      setFounderCount(0);
      setLoadingData(false);
    }
  }, [isLoggedIn, userProfile?.id, currentScreen, fetchUserProfile, fetchStartups, fetchChats, fetchCommunityPosts, fetchMessages, fetchNotifications, fetchRecentActivities, fetchUserCounts]);

  return {
    userProfile, // userProfile is now managed by SeedstreetApp, but returned for consistency
    setUserProfile, // setUserProfile is now managed by SeedstreetApp, but returned for consistency
    startups,
    chats,
    communityPosts,
    messages,
    notifications,
    recentActivities,
    loadingData,
    fetchUserProfile,
    fetchStartups,
    fetchChats,
    fetchCommunityPosts,
    fetchMessages,
    fetchNotifications,
    fetchRecentActivities,
    investorCount,
    founderCount,
  };
};