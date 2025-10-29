"use client";

import React from 'react';
import { MessageCircle, Rocket } from 'lucide-react';
import BottomNav from '../BottomNav';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  isOnline: boolean;
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
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Chats 💬</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-6">
          <button className="py-3 text-sm font-semibold text-purple-700 border-b-2 border-purple-700">
            DMs
          </button>
          <button className="py-3 text-sm font-semibold text-gray-500">
            Rooms
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          chats.map(chat => (
            <button 
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                setCurrentScreen('chat');
              }}
              className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                  {chat.startup_logo}
                </div>
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.startup_name}</h3>
                  <span className="text-xs text-gray-500">{chat.last_message_timestamp}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                  {chat.last_message_text}
                </p>
              </div>
              {chat.unread_count > 0 && (
                <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{chat.unread_count}</span>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
              😴
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No chats yet</h3>
            <p className="text-gray-600 mb-6">Slide into some founder DMs 🚀</p>
            <button onClick={() => setActiveTab('home')} className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg">
              Browse Startups
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default ChatListScreen;