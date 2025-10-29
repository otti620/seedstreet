"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check, MoreVertical, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

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
}

interface ChatConversationScreenProps {
  selectedChat: Chat;
  messages: Message[];
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  userProfileId: string | null; // To determine if message is sent by current user
  userProfileName: string | null; // To attribute sender name
}

const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  selectedChat,
  messages,
  setCurrentScreen,
  setActiveTab,
  userProfileId,
  userProfileName,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (messageInput.trim() && userProfileId && userProfileName) {
      setSending(true);
      const { error } = await supabase.from('messages').insert({
        chat_id: selectedChat.id,
        sender_id: userProfileId,
        sender_name: userProfileName,
        text: messageInput.trim(),
      });

      if (error) {
        toast.error("Failed to send message: " + error.message);
        console.error("Error sending message:", error);
      } else {
        setMessageInput('');
        // Optionally, update the last message in the chat list
        await supabase.from('chats').update({
          last_message_text: messageInput.trim(),
          last_message_timestamp: new Date().toISOString(),
        }).eq('id', selectedChat.id);
      }
      setSending(false);
    } else if (!userProfileId || !userProfileName) {
      toast.error("User information missing. Cannot send message.");
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
                <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender_id === userProfileId && <Check className="w-3 h-3 text-teal-500" />}
              </div>
            </div>
          </div>
        ))} {/* Closing tag for messages.map */}

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
              disabled={sending}
            />
          </div>
          <button onClick={handleSendMessage} disabled={sending || !messageInput.trim()} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationScreen;