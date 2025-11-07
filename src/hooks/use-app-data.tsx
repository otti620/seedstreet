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

export const useAppData = (
  isLoggedIn: boolean,
  userId: string | null, // Now receives userId directly
  currentScreen: string, // To decide when to fetch
) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  // Removed messages state, as it will be fetched per chat
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [investorCount, setInvestorCount] = useState(0);
  const [founderCount, setFounderCount] = useState(0);

  // Memoized fetch functions
  // These now depend on userId directly, not userProfile object
  const fetchStartups = useCallback(async () => {
    const { data, error } = await supabase.from('startups').select('*');
    if (error) {
      console.error("Error fetching startups:", error);
    } else {
      setStartups(data || []);
    }
  }, []); // No dependency on userId here, as startups are public

  const fetchChats = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [userId])
      .order('last_message_timestamp', { ascending: false });
    if (error) {
      console.error("Error fetching chats:", error);
    } else {
      setChats(data || []);
    }
  }, [userId]); // Depends on userId

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
  }, []); // No dependency on userId here, as community posts are public

  // Removed fetchMessages function

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data || []);
    }
  }, [userId]); // Depends on userId

  const fetchRecentActivities = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5);
    if (error) {
      console.error("Error fetching recent activities:", error);
    } else {
      setRecentActivities(data || []);
    }
  }, [userId]); // Depends on userId

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

  // Main effect for fetching ALL data when logged in and userId is available
  useEffect(() => {
    // Only fetch data if logged in, userId is available, and not on initial screens
    if (isLoggedIn && userId && !['splash', 'auth', 'roleSelector', 'onboarding'].includes(currentScreen)) {
      const fetchData = async () => {
        setLoadingData(true);
        await Promise.all([
          fetchStartups(),
          fetchChats(),
          fetchCommunityPosts(),
          // Removed fetchMessages() from here
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
      // Removed messages state clear
      setNotifications([]);
      setRecentActivities([]);
      setInvestorCount(0);
      setFounderCount(0);
      setLoadingData(false);
    }
  }, [isLoggedIn, userId, currentScreen, fetchStartups, fetchChats, fetchCommunityPosts, fetchNotifications, fetchRecentActivities, fetchUserCounts]);

  return {
    startups,
    chats,
    communityPosts,
    // Removed messages from return
    notifications,
    recentActivities,
    loadingData,
    investorCount,
    founderCount,
  };
};