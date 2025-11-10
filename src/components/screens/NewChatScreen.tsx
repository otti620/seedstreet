"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, MessageCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/default-avatars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[];
  interested_startups: string[];
  bio: string | null;
  location: string | null;
  phone: string | null;
  last_seen: string | null;
  show_welcome_flyer: boolean;
  total_committed: number;
  pro_account: boolean; // NEW: Add pro_account
}

interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  pitch: string;
  description: string | null;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
  amount_raised: number;
}

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

interface NewChatScreenProps {
  setCurrentScreen: (screen: string, params?: { chat?: Chat }) => void; // Updated param type
  userProfile: Profile;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ setCurrentScreen, userProfile, logActivity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      setLoadingStartups(true);
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .neq('founder_id', userProfile.id); // Exclude own startups
      if (error) {
        console.error("Error fetching startups:", error);
        toast.error("Failed to load startups.");
      } else {
        setStartups(data || []);
      }
      setLoadingStartups(false);
    };

    fetchStartups();
  }, [userProfile.id]);

  const filteredStartups = startups.filter(startup =>
    startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.founder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { mutate: startNewChat, loading: creatingChat } = useSupabaseMutation(
    async (startup: Startup) => {
      if (!userProfile.id || !userProfile.name) {
        throw new Error("Your profile information is incomplete. Cannot start chat.");
      }

      // Check for existing chat
      const { data: existingChats, error: fetchChatError } = await supabase
        .from('chats')
        .select('*')
        .eq('investor_id', userProfile.id)
        .eq('founder_id', startup.founder_id)
        .eq('startup_id', startup.id)
        .single();

      if (fetchChatError && fetchChatError.code !== 'PGRST116') {
        throw fetchChatError;
      }

      if (existingChats) {
        toast.info("Continuing existing chat.");
        return existingChats as Chat;
      }

      // Fetch founder profile to get their name
      const { data: founderProfile, error: founderError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', startup.founder_id)
        .single();

      if (founderError || !founderProfile) {
        throw new Error("Failed to get founder details. Cannot start chat.");
      }

      if (founderProfile.role !== 'founder') {
        throw new Error(`Cannot start chat: ${founderProfile.name || founderProfile.email?.split('@')[0] || 'This user'} is not registered as a founder.`);
      }

      const founderName = founderProfile.name || founderProfile.email?.split('@')[0] || 'Founder';

      const initialUnreadCounts = {
        [userProfile.id]: 0,
        [startup.founder_id]: 1,
      };

      const { data: newChat, error: createChatError } = await supabase
        .from('chats')
        .insert({
          user_ids: [userProfile.id, startup.founder_id],
          investor_id: userProfile.id,
          investor_name: userProfile.name,
          founder_id: startup.founder_id,
          founder_name: founderName,
          startup_id: startup.id,
          startup_name: startup.name,
          startup_logo: startup.logo,
          last_message_text: 'Chat initiated!',
          last_message_timestamp: new Date().toISOString(),
          unread_counts: initialUnreadCounts,
        })
        .select()
        .single();

      if (createChatError) {
        throw createChatError;
      }

      // Increment active_chats and room_members for the startup
      const { data: updatedStartup, error: updateStartupError } = await supabase
        .from('startups')
        .update({
          active_chats: startup.active_chats + 1,
          room_members: startup.room_members + 1,
        })
        .eq('id', startup.id)
        .select('active_chats, room_members')
        .single();

      if (updateStartupError) {
        console.error("Error updating startup chat metrics:", updateStartupError);
        // Don't throw, as chat was already created
      }

      await supabase.from('notifications').insert({
        user_id: startup.founder_id,
        type: 'new_chat',
        message: `${userProfile.name || userProfile.email} started a chat with you about ${startup.name}!`,
        link: `/chat/${newChat.id}`,
        related_entity_id: newChat.id,
      });

      return newChat as Chat;
    },
    {
      onSuccess: (newChat) => {
        toast.success("New chat started!");
        logActivity('chat_started', `Started a chat with ${newChat.founder_name} about ${newChat.startup_name}`, newChat.id, 'MessageCircle');

        setCurrentScreen('chat', { chat: newChat }); // Pass the full chat object
      },
      onError: (error) => {
        toast.error(`Failed to start chat: ${error.message}`);
        console.error("Error starting new chat:", error);
      },
      errorMessage: "Failed to start new chat.",
    }
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">New Chat</h2>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search startups to chat with..."
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

      {/* Startup List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingStartups ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading startups...</div>
        ) : filteredStartups.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchTerm ? "No matching startups found." : "No startups available to chat with."}
          </div>
        ) : (
          filteredStartups.map((startup) => (
            <button
              key={startup.id}
              className="flex items-center w-full p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => startNewChat(startup)}
              disabled={creatingChat}
            >
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={startup.logo || getAvatarUrl(1)} alt={startup.name} />
                <AvatarFallback>{startup.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                <p className="text-sm text-gray-600 truncate dark:text-gray-300">{startup.tagline}</p>
              </div>
              <div className="ml-2">
                <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NewChatScreen;