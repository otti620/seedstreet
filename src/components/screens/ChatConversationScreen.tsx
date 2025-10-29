"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check, MoreVertical, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

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

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  read: boolean;
  sent?: boolean; // Added for mock messages, will be removed with real data
}

interface ChatConversationScreenProps {
  selectedChat: Chat;
  messages: Message[];
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  userProfileId: string | null; // To determine if message is sent by current user
}

const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  selectedChat,
  messages,
  setCurrentScreen,
  setActiveTab,
  userProfileId,
}) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast.info(`Sending message: "${messageInput}"`);
      // In a real implementation, this would send to Supabase
      setMessageInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            setCurrentScreen('home');
            setActiveTab('chats');
          }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl">
                {selectedChat.startup_logo}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{selectedChat.startup_name}</h2>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userProfileId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${msg.sender_id === userProfileId ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-2xl p-3 ${
                msg.sender_id === userProfileId
                  ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender_id === userProfileId ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-gray-500">{msg.created_at}</span>
                {msg.sender_id === userProfileId && <Check className="w-3 h-3 text-teal-500" />}
              </div>
            </div>
          </div>
        ))}

        {/* Interest Signal Card (always shown for now) */}
        <div className="mx-auto max-w-md">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-float">👀</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">You signaled interest!</h4>
                <p className="text-xs opacity-90">The founder knows you're serious about this</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-end gap-2">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600">
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1 min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl px-4 py-2 flex items-center">
            <input 
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationScreen;