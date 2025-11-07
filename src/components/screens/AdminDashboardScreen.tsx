"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Flag, MessageCircle, Sparkles, Rocket, Users, LayoutDashboard, Settings, LogOut, Trash2, User as UserIcon } from 'lucide-react'; // Import LogOut, Trash2, UserIcon
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Import Input for maintenance message
import ConfirmationDialog from '../ConfirmationDialog'; // Import ConfirmationDialog
import { getAvatarUrl } from '@/lib/default-avatars'; // Import getAvatarUrl
import Image from 'next/image'; // Import Image from next/image
import { motion, AnimatePresence } from 'framer-motion';

interface FlaggedMessage {
  id: string;
  message_id: string;
  original_message_id: string | null;
  chat_id: string;
  sender: string;
  sender_id: string | null;
  chat_type: 'DM' | 'Community';
  startup_name: string | null;
  reason: string;
  timestamp: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  reported_by: string;
}

interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  category: string;
  founder_name: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date_created: string;
  founder_id: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  email: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  avatar_id: number | null;
  created_at: string;
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
  is_hidden: boolean; // Add is_hidden
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface AdminDashboardScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  maintenanceMode: { enabled: boolean; message: string };
  fetchAppSettings: () => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ setCurrentScreen, maintenanceMode, fetchAppSettings, setIsLoggedIn }) => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedMessage[]>([]);
  const [pendingStartups, setPendingStartups] = useState<Startup[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]); // New state for all users
  const [allStartups, setAllStartups] = useState<Startup[]>([]); // New state for all startups
  const [allCommunityPosts, setAllCommunityPosts] = useState<CommunityPost[]>([]); // New state for all community posts
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStartups: 0,
    approvedStartups: 0,
    totalCommunityPosts: 0,
    totalChats: 0,
    totalFlaggedItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'settings' | 'pendingStartups' | 'flaggedContent' | 'allUsers' | 'allStartups' | 'allCommunityPosts'>('analytics');
  const [maintenanceMessage, setMaintenanceMessage] = useState(maintenanceMode.message); // State for editable message

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'user' | 'startup' | 'post'; id: string; name: string } | null>(null);

  useEffect(() => {
    setMaintenanceMessage(maintenanceMode.message); // Sync local state with prop
  }, [maintenanceMode.message]);

  const fetchAdminData = async () => {
    setLoading(true);

    // Fetch analytics
    const { count: totalUsersCount, error: usersError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalStartupsCount, error: startupsError } = await supabase.from('startups').select('*', { count: 'exact', head: true });
    const { count: approvedStartupsCount, error: approvedStartupsError } = await supabase.from('startups').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
    const { count: totalCommunityPostsCount, error: postsError } = await supabase.from('community_posts').select('*', { count: 'exact', head: true });
    const { count: totalChatsCount, error: chatsError } = await supabase.from('chats').select('*', { count: 'exact', head: true });
    const { count: totalFlaggedItemsCount, error: flaggedCountError } = await supabase.from('flagged_messages').select('*', { count: 'exact', head: true });

    setAnalytics({
      totalUsers: totalUsersCount || 0,
      totalStartups: totalStartupsCount || 0,
      approvedStartups: approvedStartupsCount || 0,
      totalCommunityPosts: totalCommunityPostsCount || 0,
      totalChats: totalChatsCount || 0,
      totalFlaggedItems: totalFlaggedItemsCount || 0,
    });

    if (usersError || startupsError || approvedStartupsError || postsError || chatsError || flaggedCountError) {
      console.error("Error fetching analytics:", usersError || startupsError || approvedStartupsError || postsError || chatsError || flaggedCountError);
      toast.error("Failed to load analytics data.");
    }

    // Fetch flagged items
    const { data: flaggedData, error: flaggedError } = await supabase
      .from('flagged_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (flaggedError) {
      console.error("Error fetching flagged items:", flaggedError);
      setFlaggedItems([]);
    } else if (flaggedData) {
      setFlaggedItems(flaggedData as FlaggedMessage[]);
    }

    // Fetch pending startups
    const { data: pendingStartupData, error: pendingStartupError } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'Pending')
      .order('date_created', { ascending: false });

    if (pendingStartupError) {
      console.error("Error fetching pending startups:", pendingStartupError);
      setPendingStartups([]);
    } else if (pendingStartupData) {
      setPendingStartups(pendingStartupData as Startup[]);
    }

    // Fetch all users
    const { data: allUsersData, error: allUsersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.error("Error fetching all users:", allUsersError);
      setAllUsers([]);
    } else if (allUsersData) {
      setAllUsers(allUsersData as Profile[]);
    }

    // Fetch all startups
    const { data: allStartupsData, error: allStartupsError } = await supabase
      .from('startups')
      .select('*')
      .order('date_created', { ascending: false });

    if (allStartupsError) {
      console.error("Error fetching all startups:", allStartupsError);
      setAllStartups([]);
    } else if (allStartupsData) {
      setAllStartups(allStartupsData as Startup[]);
    }

    // Fetch all community posts (including hidden ones for admin view)
    const { data: allCommunityPostsData, error: allCommunityPostsError } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (allCommunityPostsError) {
      console.error("Error fetching all community posts:", allCommunityPostsError);
      setAllCommunityPosts([]);
    } else if (allCommunityPostsData) {
      setAllCommunityPosts(allCommunityPostsData as CommunityPost[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();

    // Realtime subscriptions for all relevant tables
    const channels: any[] = [];

    const subscribeToTable = (tableName: string, callback: () => void) => {
      const channel = supabase
        .channel(`admin_dashboard_${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
        .subscribe();
      channels.push(channel);
    };

    subscribeToTable('flagged_messages', fetchAdminData);
    subscribeToTable('startups', fetchAdminData);
    subscribeToTable('profiles', fetchAdminData);
    subscribeToTable('chats', fetchAdminData);
    subscribeToTable('community_posts', fetchAdminData);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const handleUpdateFlaggedStatus = async (itemId: string, newStatus: 'Resolved' | 'Dismissed') => {
    const { error } = await supabase
      .from('flagged_messages')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
      console.error("Error updating status:", error);
    } else {
      toast.success(`Item status updated to ${newStatus}!`);
      fetchAdminData();
    }
  };

  const handleUpdateStartupStatus = async (startupId: string, newStatus: 'Approved' | 'Rejected') => {
    const { data: startupToUpdate, error: fetchError } = await supabase
      .from('startups')
      .select('name, founder_id')
      .eq('id', startupId)
      .single();

    if (fetchError || !startupToUpdate) {
      toast.error("Failed to fetch startup details for notification: " + (fetchError?.message || "Unknown error"));
      console.error("Error fetching startup for notification:", fetchError);
      return;
    }

    const { error } = await supabase
      .from('startups')
      .update({ status: newStatus })
      .eq('id', startupId);

    if (error) {
      toast.error(`Failed to update startup status: ${error.message}`);
      console.error("Error updating startup status:", error);
    } else {
      toast.success(`Startup ${newStatus.toLowerCase()}!`);
      fetchAdminData();

      await supabase.from('notifications').insert({
        user_id: startupToUpdate.founder_id,
        type: `startup_${newStatus.toLowerCase()}`,
        message: `Your startup "${startupToUpdate.name}" has been ${newStatus.toLowerCase()}!`,
        link: `/startup/${startupId}`,
        related_entity_id: startupId,
      });
    }
  };

  const handleToggleMaintenanceMode = async (checked: boolean) => {
    setUpdatingMaintenance(true);
    const { error } = await supabase
      .from('app_settings')
      .update({ setting_value: { enabled: checked, message: maintenanceMessage } }) // Use local state for message
      .eq('setting_key', 'maintenance_mode_enabled');

    if (error) {
      toast.error("Failed to update maintenance mode: " + error.message);
      console.error("Error updating maintenance mode:", error);
    } else {
      toast.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}!`);
      fetchAppSettings();
    }
    setUpdatingMaintenance(false);
  };

  const handleUpdateMaintenanceMessage = async () => {
    setUpdatingMaintenance(true);
    const { error } = await supabase
      .from('app_settings')
      .update({ setting_value: { enabled: maintenanceMode.enabled, message: maintenanceMessage } })
      .eq('setting_key', 'maintenance_mode_enabled');

    if (error) {
      toast.error("Failed to update maintenance message: " + error.message);
      console.error("Error updating maintenance message:", error);
    } else {
      toast.success("Maintenance message updated!");
      fetchAppSettings();
    }
    setUpdatingMaintenance(false);
  };

  const handleTogglePostVisibility = async (postId: string, isHidden: boolean) => {
    const { error } = await supabase
      .from('community_posts')
      .update({ is_hidden: isHidden })
      .eq('id', postId);

    if (error) {
      toast.error(`Failed to ${isHidden ? 'hide' : 'unhide'} post: ${error.message}`);
      console.error(`Error toggling post visibility:`, error);
    } else {
      toast.success(`Post ${isHidden ? 'hidden' : 'unhidden'} successfully!`);
      fetchAdminData(); // Re-fetch all data to update lists
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.success("Logged out successfully!");
      setIsLoggedIn(false);
      setCurrentScreen('auth');
    }
  };

  const getItemIcon = (chatType: 'DM' | 'Community') => {
    if (chatType === 'DM') {
      return <MessageCircle className="w-5 h-5 text-blue-600" />;
    } else if (chatType === 'Community') {
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
    return <Flag className="w-5 h-5 text-gray-600" />;
  };

  const confirmDeleteItem = (type: 'user' | 'startup' | 'post', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setShowDeleteConfirm(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setShowDeleteConfirm(false);
    let error = null;

    switch (itemToDelete.type) {
      case 'user':
        // Deleting a user from 'profiles' table. Supabase auth.users will cascade delete.
        const { error: userDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', itemToDelete.id);
        error = userDeleteError;
        break;
      case 'startup':
        const { error: startupDeleteError } = await supabase
          .from('startups')
          .delete()
          .eq('id', itemToDelete.id);
        error = startupDeleteError;
        break;
      case 'post':
        const { error: postDeleteError } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', itemToDelete.id);
        error = postDeleteError;
        break;
      default:
        toast.error("Unknown item type for deletion.");
        return;
    }

    if (error) {
      toast.error(`Failed to delete ${itemToDelete.type}: ${error.message}`);
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    } else {
      toast.success(`${itemToDelete.type} "${itemToDelete.name}" deleted successfully!`);
      fetchAdminData(); // Re-fetch all data to update lists
    }
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50"><Skeleton className="h-6 w-40" /></h3>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`metric-skel-${i}`} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6 dark:text-gray-50"><Skeleton className="h-6 w-40" /></h3>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={`startup-skel-${i}`} className="h-24 w-full rounded-xl" />
          ))}
          <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6 dark:text-gray-50"><Skeleton className="h-6 w-40" /></h3>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`flagged-skel-${i}`} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Admin Dashboard</h2>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 transition-colors" 
            aria-label="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto whitespace-nowrap dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="inline-flex space-x-2">
          <Button variant={activeAdminTab === 'analytics' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('analytics')} className={activeAdminTab === 'analytics' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Analytics</Button>
          <Button variant={activeAdminTab === 'settings' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('settings')} className={activeAdminTab === 'settings' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Settings</Button>
          <Button variant={activeAdminTab === 'pendingStartups' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('pendingStartups')} className={activeAdminTab === 'pendingStartups' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Pending Startups</Button>
          <Button variant={activeAdminTab === 'flaggedContent' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('flaggedContent')} className={activeAdminTab === 'flaggedContent' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Flagged Content</Button>
          <Button variant={activeAdminTab === 'allUsers' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('allUsers')} className={activeAdminTab === 'allUsers' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>All Users</Button>
          <Button variant={activeAdminTab === 'allStartups' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('allStartups')} className={activeAdminTab === 'allStartups' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>All Startups</Button>
          <Button variant={activeAdminTab === 'allCommunityPosts' ? 'default' : 'outline'} onClick={() => setActiveAdminTab('allCommunityPosts')} className={activeAdminTab === 'allCommunityPosts' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>All Posts</Button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeAdminTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
              <LayoutDashboard className="w-5 h-5 text-purple-700 dark:text-purple-400" /> Analytics Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.totalUsers}</div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.totalStartups}</div>
                <div className="text-xs text-gray-500">Total Startups</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.approvedStartups}</div>
                <div className="text-xs text-gray-500">Approved Startups</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.totalCommunityPosts}</div>
                <div className="text-xs text-gray-500">Community Posts</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.totalChats}</div>
                <div className="text-xs text-gray-500">Total Chats</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{analytics.totalFlaggedItems}</div>
                <div className="text-xs text-gray-500">Flagged Items</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeAdminTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
              <Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" /> App Settings
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl dark:bg-gray-700 mb-4">
              <Label htmlFor="maintenance-mode" className="text-gray-900 font-medium dark:text-gray-50">Maintenance Mode</Label>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode.enabled}
                onCheckedChange={handleToggleMaintenanceMode}
                disabled={updatingMaintenance}
                aria-label="Toggle maintenance mode"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
              <Label htmlFor="maintenance-message" className="text-gray-900 font-medium dark:text-gray-50 mb-2 block">Maintenance Message</Label>
              <Input
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-50"
                aria-label="Custom maintenance message"
              />
              <Button
                onClick={handleUpdateMaintenanceMessage}
                disabled={updatingMaintenance || maintenanceMessage === maintenanceMode.message}
                size="sm"
                className="mt-3 bg-purple-700 text-white hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                Save Message
              </Button>
            </div>
            {maintenanceMode.enabled && (
              <p className="text-sm text-amber-600 mt-2 dark:text-amber-400">
                App is currently in maintenance mode. Only admins can access.
              </p>
            )}
          </motion.div>
        )}

        {activeAdminTab === 'pendingStartups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">Pending Startups ({pendingStartups.length})</h3>
            {pendingStartups.length > 0 ? (
              <AnimatePresence>
                {pendingStartups.map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col gap-2 p-4 rounded-xl shadow-sm border bg-white border-gray-100 mb-3 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-900 dark:text-gray-50">{startup.name}</span>
                      </div>
                      <Badge className="bg-amber-500 text-white">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 dark:text-gray-200">{startup.tagline}</p>
                    <p className="text-xs text-gray-500">
                      By {startup.founder_name} from {startup.location} ({startup.category})
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStartupStatus(startup.id, 'Approved')}
                        className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900"
                        aria-label={`Approve startup ${startup.name}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStartupStatus(startup.id, 'Rejected')}
                        className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900"
                        aria-label={`Reject startup ${startup.name}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div
                  ></motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                  🚀
                </div>
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No pending startups</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeAdminTab === 'flaggedContent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">Flagged Content ({flaggedItems.length})</h3>
            {flaggedItems.length > 0 ? (
              <AnimatePresence>
                {flaggedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex flex-col gap-2 p-4 rounded-xl shadow-sm border ${
                      item.status === 'Pending' ? 'bg-red-50 border-red-100 dark:bg-red-950 dark:border-red-900' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                    } mb-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getItemIcon(item.chat_type)}
                        <span className="font-semibold text-gray-900 dark:text-gray-50">
                          {item.chat_type === 'DM' ? 'Message' : 'Post'} from {item.sender}
                        </span>
                      </div>
                      <Badge
                        className={`${
                          item.status === 'Pending' ? 'bg-red-500' :
                          item.status === 'Resolved' ? 'bg-green-500' : 'bg-gray-500'
                        } text-white`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      <span className="font-medium">Reason:</span> {item.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reported by: {item.reported_by} at {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {item.status === 'Pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateFlaggedStatus(item.id, 'Resolved')}
                            className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900"
                            aria-label={`Resolve flagged item from ${item.sender}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateFlaggedStatus(item.id, 'Dismissed')}
                            className="h-8 text-xs text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900"
                            aria-label={`Dismiss flagged item from ${item.sender}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                  ✅
                </div>
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No flagged items</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeAdminTab === 'allUsers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">All Users ({allUsers.length})</h3>
            {allUsers.length > 0 ? (
              <AnimatePresence>
                {allUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 rounded-xl shadow-sm border bg-white border-gray-100 mb-3 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700 relative overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                      {user.avatar_id ? (
                        <Image src={getAvatarUrl(user.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                      ) : (
                        user.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-50">{user.name || user.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                      <Badge variant="secondary" className="mt-1">{user.role || 'N/A'}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteItem('user', user.id, user.name || user.email || 'Unknown User')}
                      className="h-8 text-xs"
                      aria-label={`Delete user ${user.name || user.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No users found</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeAdminTab === 'allStartups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">All Startups ({allStartups.length})</h3>
            {allStartups.length > 0 ? (
              <AnimatePresence>
                {allStartups.map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 rounded-xl shadow-sm border bg-white border-gray-100 mb-3 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                      {startup.logo}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-50">{startup.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{startup.tagline}</p>
                      <Badge variant="secondary" className="mt-1">{startup.status}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteItem('startup', startup.id, startup.name)}
                      className="h-8 text-xs"
                      aria-label={`Delete startup ${startup.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                  <Rocket className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No startups found</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeAdminTab === 'allCommunityPosts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">All Community Posts ({allCommunityPosts.length})</h3>
            {allCommunityPosts.length > 0 ? (
              <AnimatePresence>
                {allCommunityPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 rounded-xl shadow-sm border bg-white border-gray-100 mb-3 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700 relative overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                      {post.author_avatar_id ? (
                        <Image src={getAvatarUrl(post.author_avatar_id)} alt="Author Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                      ) : (
                        post.author_name?.[0] || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-50">{post.author_name}</p>
                      <p className="text-sm text-gray-600 line-clamp-1 dark:text-gray-300">{post.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleString()}</p>
                      <Badge variant="secondary" className={`mt-1 ${post.is_hidden ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                        {post.is_hidden ? 'Hidden' : 'Visible'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePostVisibility(post.id, !post.is_hidden)}
                        className="h-8 text-xs"
                        aria-label={`${post.is_hidden ? 'Unhide' : 'Hide'} post by ${post.author_name}`}
                      >
                        {post.is_hidden ? 'Unhide' : 'Hide'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDeleteItem('post', post.id, `Post by ${post.author_name}`)}
                        className="h-8 text-xs"
                        aria-label={`Delete post by ${post.author_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                  <Sparkles className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No community posts found</h3>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteItem}
        title={`Delete ${itemToDelete?.type === 'user' ? 'User' : itemToDelete?.type === 'startup' ? 'Startup' : 'Post'}`}
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone and will permanently remove all associated data.`}
        confirmText="Delete Permanently"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default AdminDashboardScreen;