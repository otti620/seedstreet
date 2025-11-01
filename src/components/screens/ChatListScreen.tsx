"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Bell, MessageCircle } from 'lucide-react';
import BottomNav from '../BottomNav'; // Corrected path
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  isOnline: boolean; // This might need to be derived or fetched separately
  unread_counts: { [key: string]: number };
  user_ids: string[]; // To determine other participant
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  last_seen: string | null; // Added for presence
}

interface ChatListScreenProps {
  chats: Chat[];
  setCurrentScreen: (screen: string) => void;
  setSelectedChat: (chat: Chat) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: string | null;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({
  chats,
  setCurrentScreen,
  setSelectedChat,
  setActiveTab,
  activeTab,
  userRole,
}) => {
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: Profile }>({}); // Store other user profiles
  const [onlineStatuses, setOnlineStatuses] = useState<{ [key: string]: boolean }>({}); // Store online status

  const currentUserId = supabase.auth.currentUser?.id;

  useEffect(() => {
    const fetchAndSubscribeToProfiles = async () => {
      setLoading(true);
      const profileMap: { [key: string]: Profile } = {};
      const onlineMap: { [key: string]: boolean } = {};
      const userIdsToFetch: string[] = [];

      chats.forEach(chat => {
        const otherUserId = chat.user_ids.find(id => id !== currentUserId);
        if (otherUserId && !userIdsToFetch.includes(otherUserId)) {
          userIdsToFetch.push(otherUserId);
        }
      });

      if (userIdsToFetch.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, last_seen')
          .in('id', userIdsToFetch);

        if (error) {
          console.error("Error fetching chat participant profiles:", error);
        } else if (data) {
          data.forEach(profile => {
            profileMap[profile.id] = profile as Profile;
            const lastSeen = new Date(profile.last_seen || 0).getTime();
            onlineMap[profile.id] = Date.now() - lastSeen < 30000; // Online if seen in last 30 seconds
          });
        }
      }
      setUserProfiles(profileMap);
      setOnlineStatuses(onlineMap);
      setLoading(false);

      // Subscribe to presence updates for all relevant profiles
      const channels: any[] = [];
      userIdsToFetch.forEach(id => {
        const channel = supabase
          .channel(`profile_presence_list:${id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${id}` }, payload => {
            const updatedProfile = payload.new as Profile;
            setUserProfiles(prev => ({ ...prev, [updatedProfile.id]: updatedProfile }));
            const lastSeen = new Date(updatedProfile.last_seen || 0).getTime();
            setOnlineStatuses(prev => ({ ...prev, [updatedProfile.id]: Date.now() - lastSeen < 30000 }));
          })
          .subscribe();
        channels.push(channel);
      });

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
      };
    };

    if (chats.length > 0 && currentUserId) {
      fetchAndSubscribeToProfiles();
    } else {
      setLoading(false);
    }
  }, [chats, currentUserId]);

  const renderChatCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Chats</h1>
            <p className="text-sm text-gray-500">Your conversations</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="View notifications">
            <Bell className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
            aria-label="Search chats"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <React.Fragment key={i}>{renderChatCardSkeleton()}</React.Fragment>)
        ) : (
          chats.length > 0 ? (
            chats.map((chat) => {
              const otherUserId = chat.user_ids.find(id => id !== currentUserId);
              const isOnline = otherUserId ? onlineStatuses[otherUserId] : false;

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:shadow-md hover:-translate-y-1 transition-all dark:bg-gray-800 dark:border-gray-700"
                  aria-label={`Open chat with ${chat.startup_name}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl shadow-lg">
                      {chat.startup_logo}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate dark:text-gray-50">{chat.startup_name}</h3>
                    <p className="text-sm text-gray-600 truncate dark:text-gray-400">{chat.last_message_text}</p>
                  </div>
                  {chat.unread_counts?.[currentUserId || ''] > 0 && (
                    <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {chat.unread_counts?.[currentUserId || '']}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No active chats</h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">Start a conversation with a founder or investor!</p>
            </div>
          )
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default ChatListScreen;