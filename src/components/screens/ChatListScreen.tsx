"use client";

import React from 'react';
import Image from 'next/image'; // Import Image from next/image
import { ArrowLeft, MessageCircle, Search, Plus } from 'lucide-react';
import BottomNav from '../BottomNav';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
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

interface ChatListScreenProps {
  chats: Chat[];
  setCurrentScreen: (screen: string, params?: { chatId?: string }) => void;
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
  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    setCurrentScreen('chat');
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Chats</h1>
            <p className="text-sm text-gray-500">Your conversations</p>
          </div>
          <button onClick={() => setCurrentScreen('newChat')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="Start new chat">
            <Plus className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Search (Optional, could add later) */}
      {/* <div className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
          />
        </div>
      </div> */}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {chats.length > 0 ? (
          chats.map(chat => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleChatClick(chat)}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="relative w-14 h-14 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 relative overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                  {chat.startup_logo.startsWith('http') ? (
                    <Image src={chat.startup_logo} alt={`${chat.startup_name} logo`} layout="fill" objectFit="cover" className="rounded-full" />
                  ) : (
                    chat.startup_name?.[0] || 'S'
                  )}
                </div>
                {/* isOnline removed */}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 truncate dark:text-gray-50">{chat.startup_name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(chat.last_message_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-600 truncate dark:text-gray-300">{chat.last_message_text}</p>
              </div>
              {chat.unread_counts && chat.unread_counts[userRole === 'investor' ? chat.investor_id : chat.founder_id] > 0 && (
                <Badge className="bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs font-bold flex-shrink-0">
                  {chat.unread_counts[userRole === 'investor' ? chat.investor_id : chat.founder_id]}
                </Badge>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
              💬
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No chats yet</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-400">Start a conversation with a startup or founder.</p>
            <button onClick={() => setActiveTab('home')} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all">
              Discover Startups
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default ChatListScreen;