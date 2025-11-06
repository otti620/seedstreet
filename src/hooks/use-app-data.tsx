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
  avatar_url: string | null; // Add avatar_url
  total_committed: number; // Add total_committed
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
  amount_raised: number; // Add amount_raised
}

interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  // isOnline: boolean; // Removed as per simplification
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
  is_hidden: boolean; // Add is_hidden
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

interface Commitment { // New interface for commitments
  id: string;
  investor_id: string;
  investor_name: string;
  founder_id: string;
  founder_name: string;
  startup_id: string;
  startup_name: string;
  amount: number;
  status: string;
  created_at: string;
  date_updated: string;
  proof_uploaded: boolean;
  proof_url: string | null;
}

interface AppSettings {
  enabled: boolean;
  message: string;
}

interface UseAppDataProps {
  userId: string | null;
  isLoggedIn: boolean;
  selectedChatId: string | null;
}

export const useAppData = ({ userId, isLoggedIn, selectedChatId }: UseAppDataProps) => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]); // New state for commitments
  const [investorCount, setInvestorCount] = useState(0); // New state for investor count
  const [founderCount, setFounderCount] = useState(0); // New state for founder count
  const [maintenanceMode, setMaintenanceMode] = useState<AppSettings>({ enabled: false, message: "" });
  const [loadingData, setLoadingData] = useState(true); // Set to true initially

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
    if (!userId) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
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
        total_committed: 0, // Initialize total_committed
      };

      // Fetch total committed amount for the investor
      if (profileData.role === 'investor') {
        const { data: commitmentsData, error: commitmentsError } = await supabase
          .from('commitments')
          .select('amount')
          .eq('investor_id', userId)
          .eq('status', 'Approved'); // Only count approved commitments

        if (commitmentsError) {
          console.error("Error fetching investor commitments:", commitmentsError);
        } else if (commitmentsData) {
          profileData.total_committed = commitmentsData.reduce((sum, commitment) => sum + commitment.amount, 0);
        }
      }

      // Check if role is set but onboarding_complete is false
      if (profileData.role && !profileData.onboarding_complete) {
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
      setUserProfile(profileData);
    }
  }, [userId]);

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
    if (!userId) {
      setChats([]);
      return;
    }
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [userId])
      .order('last_message_timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } else if (data) {
      setChats(data as Chat[]);
    }
  }, [userId]);

  // Fetch community posts
  const fetchCommunityPosts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userProfileData = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : null;
    const isAdmin = userProfileData?.data?.role === 'admin';

    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;

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
    if (!userId) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else if (data) {
      setNotifications(data as Notification[]);
    }
  }, [userId]);

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    if (!userId) {
      setRecentActivities([]);
      return;
    }
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    } else if (data) {
      setRecentActivities(data as ActivityLog[]);
    }
  }, [userId]);

  // Fetch commitments (for investor profile)
  const fetchCommitments = useCallback(async () => {
    if (!userId || userProfile?.role !== 'investor') {
      setCommitments([]);
      return;
    }
    const { data, error } = await supabase
      .from('commitments')
      .select('*')
      .eq('investor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching commitments:", error);
      setCommitments([]);
    } else if (data) {
      setCommitments(data as Commitment[]);
    }
  }, [userId, userProfile?.role]);

  // Fetch investor and founder counts
  const fetchRoleCounts = useCallback(async () => {
    const { count: investorCount, error: investorError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'investor');

    const { count: founderCount, error: founderError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'founder');

    if (investorError) {
      console.error("Error fetching investor count:", investorError);
    } else {
      setInvestorCount(investorCount || 0);
    }

    if (founderError) {
      console.error("Error fetching founder count:", founderError);
    } else {
      setFounderCount(founderCount || 0);
    }
  }, []);

  // Initial app settings fetch and real-time subscription
  useEffect(() => {
    fetchAppSettings();
    fetchRoleCounts(); // Fetch role counts initially

    const appSettingsChannel = supabase
      .channel('public:app_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: `setting_key=eq.maintenance_mode_enabled` }, () => fetchAppSettings())
      .subscribe();
    
    const profilesChannelForCounts = supabase // Subscribe to profiles for role count updates
      .channel('public:profiles_role_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchRoleCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(appSettingsChannel);
      supabase.removeChannel(profilesChannelForCounts);
    };
  }, [fetchAppSettings, fetchRoleCounts]);

  // Main data loading and real-time subscriptions for logged-in users
  useEffect(() => {
    if (isLoggedIn && userId) {
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
            fetchCommitments(), // Fetch commitments
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_ids.cs.{${userId}}` }, () => fetchChats())
        .subscribe();

      const communityPostChannel = supabase
        .channel('public:community_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchCommunityPosts())
        .subscribe();

      const notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => fetchNotifications())
        .subscribe();

      const activityLogChannel = supabase
        .channel('public:activity_log')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${userId}` }, () => fetchRecentActivities())
        .subscribe();

      const profileChannel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => fetchUserProfile())
        .subscribe();
      
      const commitmentsChannel = supabase // New subscription for commitments
        .channel('public:commitments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'commitments', filter: `investor_id=eq.${userId}` }, () => fetchCommitments())
        .subscribe();

      return () => {
        supabase.removeChannel(startupChannel);
        supabase.removeChannel(chatChannel);
        supabase.removeChannel(communityPostChannel);
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(activityLogChannel);
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(commitmentsChannel); // Unsubscribe from commitments
      };
    } else if (!isLoggedIn) {
      // User is explicitly logged out, clear all user-specific data and stop loading
      setUserProfile(null);
      setStartups([]);
      setChats([]);
      setCommunityPosts([]);
      setNotifications([]);
      setRecentActivities([]);
      setCommitments([]); // Clear commitments
      setLoadingData(false);
    } else {
      // isLoggedIn is true, but userId is null. This is an intermediate state
      // (e.g., after login, before onAuthStateChange updates currentUserId).
      // Keep loadingData as true to show splash screen until userId is available.
      setLoadingData(true);
    }
  }, [isLoggedIn, userId, fetchUserProfile, fetchStartups, fetchChats, fetchCommunityPosts, fetchNotifications, fetchRecentActivities, fetchCommitments]);

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
    commitments, // Return commitments
    investorCount, // Return investor count
    founderCount, // Return founder count
    maintenanceMode,
    loadingData,
    fetchAppSettings,
    fetchCommunityPosts, // Expose for specific re-fetches
    fetchNotifications, // Expose for specific re-fetches
    fetchUserProfile, // Expose for specific re-fetches
  };
};