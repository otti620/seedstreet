"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageCircle, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/default-avatars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; // Import motion for animations

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

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: Chat;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface ChatListScreenProps {
  chats: Chat[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated param type
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: 'investor' | 'founder' | 'admin' | null;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({
  chats,
  setCurrentScreen,
  setActiveTab,
  activeTab,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  const filteredChats = chats.filter(chat =>
    chat.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.last_message_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.founder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.investor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chat: Chat) => {
    setCurrentScreen('chat', { chat: chat }); // Pass the full chat object
  };

  const handleNewChatClick = () => {
    setCurrentScreen('newChat');
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Chats</h2>
          {userRole === 'investor' && (
            <Button variant="ghost" size="icon" onClick={handleNewChatClick} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchTerm ? "No matching chats found." : "You don't have any chats yet."}
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center w-full p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => handleChatClick(chat)}
            >
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={chat.startup_logo || getAvatarUrl(1)} alt={chat.startup_name} />
                <AvatarFallback>{chat.startup_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">{chat.startup_name}</h3>
                <p className="text-sm text-gray-600 truncate dark:text-gray-300">{chat.last_message_text}</p>
              </div>
              <div className="flex flex-col items-end ml-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(chat.last_message_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {chat.unread_counts && chat.unread_counts[supabase.auth.user?.()?.id || ''] > 0 && (
                  <span className="mt-1 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {chat.unread_counts[supabase.auth.user?.()?.id || '']}
                  </span>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatListScreen;