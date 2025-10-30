"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, MoreVertical, Plus, Send, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  isOnline: boolean;
  unread_counts: { [key: string]: number };
  investor_id: string;
  founder_id: string;
  user_ids: string[];
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
  email: string | null;
  last_seen: string | null; // Added for presence
}

interface ChatConversationScreenProps {
  selectedChat: Chat;
  messages: Message[];
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  userProfile: Profile | null;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
}

const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  selectedChat,
  messages,
  setCurrentScreen,
  setActiveTab,
  userProfile,
  logActivity,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null); // State for the other chat participant
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false); // Real-time online status
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Placeholder for typing indicator
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userProfileId = userProfile?.id || null;
  const userProfileName = userProfile?.name || userProfile?.email || null;

  // Determine the ID of the other participant
  const otherParticipantId = selectedChat.user_ids.find(id => id !== userProfileId);

  // Fetch other participant's profile and subscribe to presence
  useEffect(() => {
    if (otherParticipantId) {
      const fetchOtherUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, last_seen')
          .eq('id', otherParticipantId)
          .single();

        if (error) {
          console.error("Error fetching other user profile:", error);
        } else if (data) {
          setOtherUserProfile(data as Profile);
          // Initial check for online status
          const lastSeen = new Date(data.last_seen || 0).getTime();
          setIsOtherUserOnline(Date.now() - lastSeen < 30000); // Online if seen in last 30 seconds
        }
      };
      fetchOtherUserProfile();

      // Subscribe to changes in the other user's profile for presence updates
      const channel = supabase
        .channel(`profile_presence:${otherParticipantId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${otherParticipantId}` }, payload => {
          const updatedProfile = payload.new as Profile;
          setOtherUserProfile(updatedProfile);
          const lastSeen = new Date(updatedProfile.last_seen || 0).getTime();
          setIsOtherUserOnline(Date.now() - lastSeen < 30000); // Update online status
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [otherParticipantId]);

  // Update current user's last_seen timestamp periodically
  useEffect(() => {
    const updateLastSeen = async () => {
      if (userProfileId) {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userProfileId);
      }
    };

    const interval = setInterval(updateLastSeen, 15000); // Update every 15 seconds
    updateLastSeen(); // Initial update

    return () => clearInterval(interval);
  }, [userProfileId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read and update unread count when chat is opened
  useEffect(() => {
    const markChatAsRead = async () => {
      if (userProfileId && selectedChat.id) {
        const currentUnreadCounts = selectedChat.unread_counts || {};
        const newUnreadCounts = {
          ...currentUnreadCounts,
          [userProfileId]: 0,
        };

        const { error: updateChatError } = await supabase
          .from('chats')
          .update({ unread_counts: newUnreadCounts })
          .eq('id', selectedChat.id);

        if (updateChatError) {
          console.error("Error updating chat unread counts:", updateChatError);
        }
      }
    };

    markChatAsRead();
  }, [selectedChat.id, userProfileId, selectedChat.unread_counts]);


  const handleSendMessage = async () => {
    if (messageInput.trim() && userProfileId && userProfileName) {
      setSending(true);

      const otherUserIds = selectedChat.user_ids.filter(id => id !== userProfileId);
      const newUnreadCounts = { ...selectedChat.unread_counts };
      otherUserIds.forEach(id => {
        newUnreadCounts[id] = (newUnreadCounts[id] || 0) + 1;
      });
      newUnreadCounts[userProfileId] = 0;

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
        await supabase.from('chats').update({
          last_message_text: messageInput.trim(),
          last_message_timestamp: new Date().toISOString(),
          unread_counts: newUnreadCounts,
        }).eq('id', selectedChat.id);
        logActivity('message_sent', `Sent a message in chat with ${selectedChat.startup_name}`, selectedChat.id, 'Send');
      }
      setSending(false);
    } else if (!userProfileId || !userProfileName) {
      toast.error("User information missing. Cannot send message.");
    }
  };

  const handleReportMessage = async (message: Message) => {
    if (!userProfileId) {
      toast.error("You must be logged in to report a message.");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this message:");
    if (!reason || reason.trim() === "") {
      toast.info("Message not reported. A reason is required.");
      return;
    }

    setSending(true);
    const { error } = await supabase.from('flagged_messages').insert({
      message_id: message.id,
      chat_id: message.chat_id,
      sender: message.sender_name,
      sender_id: message.sender_id,
      chat_type: 'DM',
      startup_name: selectedChat.startup_name,
      reason: reason.trim(),
      reported_by: userProfileId,
      status: 'Pending',
    });

    if (error) {
      toast.error("Failed to report message: " + error.message);
      console.error("Error reporting message:", error);
    } else {
      toast.success("Message reported successfully. We will review it shortly.");
      logActivity('message_reported', `Reported a message in chat with ${selectedChat.startup_name}`, message.id, 'Flag');
    }
    setSending(false);
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
              {isOtherUserOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{selectedChat.startup_name}</h2>
              <p className={`text-xs ${isOtherUserOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOtherUserOnline ? 'Online' : 'Offline'}
              </p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className={`rounded-2xl p-3 cursor-pointer ${
                    msg.sender_id === userProfileId
                      ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleReportMessage(msg)} className="flex items-center gap-2 text-red-600">
                    <Flag className="w-4 h-4" /> Report Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender_id === userProfileId ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender_id === userProfileId && <Check className="w-3 h-3 text-teal-500" />}
              </div>
            </div>
          </div>
        ))}
        {/* Typing Indicator Placeholder */}
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md p-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm">Typing</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          </div>
        )}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

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