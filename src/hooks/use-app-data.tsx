"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import localforage from 'localforage';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  Profile, Startup, Chat, Message, CommunityPost, Notification, ActivityLog, ScreenParams
} from '@/types'; // Import all types from the shared file

export const useAppData = (
  isLoggedIn: boolean,
  userId: string | null, // Now receives userId directly
  currentScreen: string, // To decide when to fetch
) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [investorCount, setInvestorCount] = useState(0);
  const [founderCount, setFounderCount] = useState(0);

  const fetchStartups = useCallback(async () => {
    console.log("useAppData: fetchStartups called.");
    const { data, error } = await supabase.from('startups').select('*');
    if (error) {
      console.error("Error fetching startups:", error);
    } else {
      console.log("useAppData: Startups fetched successfully:", data);
      setStartups(data || []);
    }
  }, []);

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
  }, [userId]);

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
  }, [userId]);

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
  }, [userId]);

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

  useEffect(() => {
    if (isLoggedIn && userId && !['splash', 'auth', 'roleSelector', 'onboarding'].includes(currentScreen)) {
      const fetchData = async () => {
        setLoadingData(true);
        await Promise.all([
          fetchStartups(),
          fetchChats(),
          fetchCommunityPosts(),
          fetchNotifications(),
          fetchRecentActivities(),
          fetchUserCounts(),
        ]);
        setLoadingData(false);
      };
      fetchData();
    } else if (!isLoggedIn) {
      setStartups([]);
      setChats([]);
      setCommunityPosts([]);
      setNotifications([]);
      setRecentActivities([]);
      setInvestorCount(0);
      setFounderCount(0);
      setLoadingData(false);
    }
  }, [isLoggedIn, userId, currentScreen, fetchStartups, fetchChats, fetchCommunityPosts, fetchNotifications, fetchRecentActivities, fetchUserCounts]);

  useEffect(() => {
    const channels: any[] = [];

    const startupChannel = supabase
      .channel('public:startups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, (payload: RealtimePostgresChangesPayload<any>) => {
        console.log('Realtime startup change:', payload);
        fetchStartups();
      })
      .subscribe();
    channels.push(startupChannel);

    if (userId) {
      const notificationChannel = supabase
        .channel(`public:notifications:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Realtime notification change:', payload);
          fetchNotifications();
        })
        .subscribe();
      channels.push(notificationChannel);
    }

    if (userId) {
      const chatChannel = supabase
        .channel(`public:chats:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_ids.cs.{${userId}}` }, (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Realtime chat change:', payload);
          fetchChats();
        })
        .subscribe();
      channels.push(chatChannel);
    }

    const communityPostChannel = supabase
      .channel('public:community_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, (payload: RealtimePostgresChangesPayload<any>) => {
        console.log('Realtime community post change:', payload);
        fetchCommunityPosts();
      })
      .subscribe();
    channels.push(communityPostChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, fetchStartups, fetchNotifications, fetchChats, fetchCommunityPosts]);

  return {
    startups,
    chats,
    communityPosts,
    notifications,
    recentActivities,
    loadingData,
    investorCount,
    founderCount,
    fetchStartups,
    fetchNotifications,
    fetchCommunityPosts,
  };
};