"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null; // Changed from avatar_url
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
  show_welcome_flyer: boolean; // Added for welcome flyer
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
  author_avatar_id: number | null; // Changed from author_avatar_url
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
}

interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar_id: number | null; // Changed from author_avatar_url
  content: string;
  created_at: string;
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

interface UseAppDataProps {
  // userId prop is no longer needed, as it's accessed directly
  isLoggedIn: boolean;
  selectedChatId: string | null;
}

export const useAppData = ({ isLoggedIn, selectedChatId }: UseAppDataProps) => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<AppSettings>({ enabled: false, message: "" });
  const [loadingData, setLoadingData] = useState(true); // Set to true initially

  // Get userId directly from Supabase auth
  const currentUserId = supabase.auth.currentUser?.id || null;

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

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!currentUserId) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    } else if (data) {
      // Ensure name and email are populated, using fallbacks if necessary
      const profileData: Profile = {
        ...data as Profile,
        name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email?.split('@')[0] || 'User Name',
        email: data.email || 'user@email.com',
      };

      // Check if role is set but onboarding_complete is false
      if (profileData.role && !profileData.onboarding_complete) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', currentUserId);
        if (updateError) {
          console.error("Error updating onboarding_complete:", updateError);
        } else {
          profileData.onboarding_complete = true;
        }
      }
      setUserProfile(profileData);
    }
  }, [currentUserId]); // Dependency on currentUserId

  // Fetch startups
  const fetchStartups = useCallback(async () => {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'Approved');

    if (error) {
      console.error("Error fetching startups:", error);
      setStartups([]);
    } else if (data) {
      setStartups(data as Startup[]);
    }
  }, []);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!currentUserId) {
      setChats([]);
      return;
    }
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [currentUserId])
      .order('last_message_timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } else if (data) {
      setChats(data as Chat[]);
    }
  }, [currentUserId]); // Dependency on currentUserId

  // Fetch community posts
  const fetchCommunityPosts = useCallback(async () => {
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
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async () => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', selectedChatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } else if (data) {
      setMessages(data as Message[]);
    }
  }, [selectedChatId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else if (data) {
      setNotifications(data as Notification[]);
    }
  }, [currentUserId]); // Dependency on currentUserId

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    if (!currentUserId) {
      setRecentActivities([]);
      return;
    }
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', currentUserId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    } else if (data) {
      setRecentActivities(data as ActivityLog[]);
    }
  }, [currentUserId]); // Dependency on currentUserId

  // Initial app settings fetch and real-time subscription
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

  // Main data loading and real-time subscriptions for logged-in users
  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      setLoadingData(true); // Start loading when user is logged in and userId is available
      const loadAllData = async () => {
        try {
          await Promise.all([
            fetchUserProfile(),
            fetchStartups(),
            fetchChats(),
            fetchCommunityPosts(),
            fetchNotifications(),
            fetchRecentActivities(),
          ]);
        } catch (error) {
          console.error("Error during Promise.all data loading:", error);
          toast.error("Failed to load some application data.");
        } finally {
          setLoadingData(false); // Always stop loading, even if there's an error
        }
      };
      loadAllData();

      // Real-time subscriptions
      const startupChannel = supabase
        .channel('public:startups')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, () => fetchStartups())
        .subscribe();

      const chatChannel = supabase
        .channel('public:chats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_ids.cs.{${currentUserId}}` }, () => fetchChats())
        .subscribe();

      const communityPostChannel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchCommunityPosts())
        .subscribe();

      const notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` }, () => fetchNotifications())
        .subscribe();

      const activityLogChannel = supabase
        .channel('public:activity_log')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${currentUserId}` }, () => fetchRecentActivities())
        .subscribe();

      const profileChannel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${currentUserId}` }, () => fetchUserProfile())
        .subscribe();

      return () => {
        supabase.removeChannel(startupChannel);
        supabase.removeChannel(chatChannel);
        supabase.removeChannel(communityPostChannel);
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(activityLogChannel);
        supabase.removeChannel(profileChannel);
      };
    } else if (!isLoggedIn) {
      // User is explicitly logged out, clear all user-specific data and stop loading
      setUserProfile(null);
      setStartups([]);
      setChats([]);
      setCommunityPosts([]);
      setNotifications([]);
      setRecentActivities([]);
      setLoadingData(false);
    } else {
      // isLoggedIn is true, but currentUserId is null. This is an intermediate state
      // (e.g., after login, before onAuthStateChange updates currentUserId).
      // Keep loadingData as true to show splash screen until currentUserId is available.
      setLoadingData(true);
    }
  }, [isLoggedIn, currentUserId, fetchUserProfile, fetchStartups, fetchChats, fetchCommunityPosts, fetchNotifications, fetchRecentActivities]);

  // Fetch messages when selectedChatId changes
  useEffect(() => {
    fetchMessages();

    if (selectedChatId) {
      const messageChannel = supabase
        .channel(`public:messages:${selectedChatId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChatId}` }, () => fetchMessages())
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
      };
    }
  }, [selectedChatId, fetchMessages]);

  return {
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
    fetchCommunityPosts, // Expose for specific re-fetches
    fetchNotifications, // Expose for specific re-fetches
    fetchUserProfile, // Expose for specific re-fetches
  };
};