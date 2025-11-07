"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, Send, Paperclip, MoreVertical, Flag, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getAvatarUrl } from '@/lib/default-avatars';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
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

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  read: boolean;
}

interface Profile {
  id: string;
  name: string | null;
  avatar_id: number | null;
  email: string | null;
}

interface ChatConversationScreenProps {
  selectedChat: Chat;
  messages: Message[];
  setCurrentScreen: (screen: string, params?: { startupId?: string, chatId?: string }) => void;
  setActiveTab: (tab: string) => void;
  userProfile: Profile | null;
  logActivity: (type: string, description: string, entity_id: string | null, icon: string | null) => Promise<void>;
}

const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  selectedChat,
  messages,
  setCurrentScreen,
  setActiveTab,
  userProfile,
  logActivity,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>(messages);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null); // State for the other user's profile
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync optimisticMessages with the 'messages' prop when it changes (from real-time updates)
  useEffect(() => {
    setOptimisticMessages(messages);
  }, [messages]);

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      if (!userProfile?.id || !selectedChat) return;

      const otherUserId = selectedChat.user_ids.find(id => id !== userProfile.id);
      if (!otherUserId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_id, email')
        .eq('id', otherUserId)
        .single();

      if (error) {
        console.error("Error fetching other user profile:", error);
        setOtherUserProfile(null);
      } else if (data) {
        setOtherUserProfile(data as Profile);
      }
    };

    fetchOtherUserProfile();
  }, [userProfile?.id, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [optimisticMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userProfile?.id || !userProfile?.name) return;

    setSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    const tempMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      chat_id: selectedChat.id,
      sender_id: userProfile.id,
      sender_name: userProfile.name,
      text: messageText,
      created_at: new Date().toISOString(),
      read: true,
    };
    setOptimisticMessages(prevMessages => [...prevMessages, tempMessage]);
    scrollToBottom();

    const { data: newMessageData, error } = await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      sender_id: userProfile.id,
      sender_name: userProfile.name,
      text: messageText,
    }).select().single();

    if (error) {
      toast.error("Failed to send message: " + error.message);
      console.error("Error sending message:", error);
      // Revert optimistic update on error
      setOptimisticMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    } else if (newMessageData) {
      // Replace the temporary message with the real one from the database
      setOptimisticMessages(prevMessages =>
        prevMessages.map(msg => (msg.id === tempMessage.id ? (newMessageData as Message) : msg))
      );

      // Update chat's last message and unread counts
      const otherUserId = selectedChat.user_ids.find(id => id !== userProfile.id);
      const newUnreadCounts = { ...selectedChat.unread_counts };
      if (otherUserId) {
        newUnreadCounts[otherUserId] = (newUnreadCounts[otherUserId] || 0) + 1;
      }

      await supabase.from('chats').update({
        last_message_text: messageText,
        last_message_timestamp: new Date().toISOString(),
        unread_counts: newUnreadCounts,
      }).eq('id', selectedChat.id);

      // Send notification to the other user
      if (otherUserId && selectedChat.startup_name) {
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          type: 'new_message',
          message: `${userProfile.name || userProfile.email} sent a message in ${selectedChat.startup_name} chat.`,
          link: `/chat/${selectedChat.id}`,
          related_entity_id: selectedChat.id,
        });
      }
      logActivity('message_sent', `Sent a message in chat with ${selectedChat.startup_name}`, selectedChat.id, 'Send');
    }
    setSendingMessage(false);
  };

  const handleReportChat = async () => {
    if (!userProfile?.id || !selectedChat) {
      toast.error("You must be logged in to report a chat.");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this chat:");
    if (!reason || reason.trim() === "") {
      toast.info("Chat not reported. A reason is required.");
      return;
    }

    const { error } = await supabase.from('flagged_messages').insert({
      message_id: selectedChat.id,
      original_message_id: null,
      chat_id: selectedChat.id,
      sender: selectedChat.founder_name,
      sender_id: selectedChat.founder_id,
      chat_type: 'DM',
      startup_name: selectedChat.startup_name,
      reason: reason.trim(),
      reported_by: userProfile.id,
      status: 'Pending',
    });

    if (error) {
      toast.error("Failed to report chat: " + error.message);
      console.error("Error reporting chat:", error);
    } else {
      toast.success("Chat reported successfully. We will review it shortly.");
      logActivity('chat_reported', `Reported chat with ${selectedChat.startup_name}`, selectedChat.id, 'Flag');
    }
  };

  const getSenderAvatar = (senderId: string) => {
    if (senderId === userProfile?.id) {
      return userProfile.avatar_id ? getAvatarUrl(userProfile.avatar_id) : undefined;
    } else if (otherUserProfile?.id === senderId) {
      return otherUserProfile.avatar_id ? getAvatarUrl(otherUserProfile.avatar_id) : undefined;
    }
    // Fallback to startup logo if other user profile not found or for general chat context
    return selectedChat.startup_logo;
  };

  const getSenderInitials = (senderId: string) => {
    if (senderId === userProfile?.id) {
      return userProfile.name?.[0] || userProfile.email?.[0]?.toUpperCase() || 'U';
    } else if (otherUserProfile?.id === senderId) {
      return otherUserProfile.name?.[0] || otherUserProfile.email?.[0]?.toUpperCase() || 'O';
    }
    return selectedChat.startup_name?.[0] || 'S';
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => { setCurrentScreen('home'); setActiveTab('chats'); }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to chats">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 overflow-hidden dark:bg-gray-700 dark:text-gray-50">
              {selectedChat.startup_logo.startsWith('http') ? (
                <Image src={selectedChat.startup_logo} alt={`${selectedChat.startup_name} logo`} layout="fill" objectFit="cover" className="rounded-full" />
              ) : (
                selectedChat.startup_name?.[0] || 'S'
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{selectedChat.startup_name}</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chat options">
                <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCurrentScreen('startupDetail', { startupId: selectedChat.startup_id })} className="flex items-center gap-2">
                <Rocket className="w-4 h-4" /> View Startup Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReportChat} className="flex items-center gap-2 text-red-600">
                <Flag className="w-4 h-4" /> Report Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {optimisticMessages.map((message, index) => {
          const isMyMessage = message.sender_id === userProfile?.id;
          const senderAvatar = getSenderAvatar(message.sender_id);
          const senderInitials = getSenderInitials(message.sender_id);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              {!isMyMessage && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                  {senderAvatar && senderAvatar.startsWith('http') ? (
                    <Image src={senderAvatar} alt="Sender Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                  ) : (
                    senderInitials
                  )}
                </div>
              )}
              <div className={`flex flex-col max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isMyMessage
                      ? 'bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-50'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  {format(new Date(message.created_at), 'p')}
                </span>
              </div>
              {isMyMessage && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                  {senderAvatar && senderAvatar.startsWith('http') ? (
                    <Image src={senderAvatar} alt="Sender Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                  ) : (
                    senderInitials
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-100 p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" aria-label="Attach file">
            <Paperclip className="w-5 h-5" />
          </button>
          <Textarea
            key={selectedChat.id}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-purple-100 border-2 border-transparent focus:border-purple-700 transition-all dark:bg-gray-800 dark:text-gray-50 dark:focus:border-purple-500"
            disabled={sendingMessage}
            aria-label="Message input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            size="icon"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-teal-600 text-white hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {sendingMessage ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationScreen;