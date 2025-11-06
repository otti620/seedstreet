"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Search, MessageCircle, User, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl } from '@/lib/default-avatars';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  avatar_id: number | null;
}

interface Startup {
  id: string;
  name: string;
  logo: string;
  founder_id: string;
  founder_name: string;
}

interface NewChatScreenProps {
  setCurrentScreen: (screen: string, params?: { chatId?: string }) => void;
  userProfile: Profile | null;
  logActivity: (type: string, description: string, entity_id: string | null, icon: string | null) => Promise<void>;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ setCurrentScreen, userProfile, logActivity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Profile | Startup)[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const lowerCaseTerm = term.toLowerCase();

    // Search for profiles (founders/investors)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, role, avatar_id')
      .or(`name.ilike.%${lowerCaseTerm}%,email.ilike.%${lowerCaseTerm}%`)
      .neq('id', userProfile?.id); // Exclude current user

    // Search for startups
    const { data: startupsData, error: startupsError } = await supabase
      .from('startups')
      .select('id, name, logo, founder_id, founder_name')
      .ilike('name', `%${lowerCaseTerm}%`)
      .eq('status', 'Approved'); // Only show approved startups

    if (profilesError) console.error("Error searching profiles:", profilesError);
    if (startupsError) console.error("Error searching startups:", startupsError);

    const combinedResults: (Profile | Startup)[] = [];

    if (profilesData) {
      profilesData.forEach(profile => {
        // Only add if they are a founder or investor, and not the current user
        if ((profile.role === 'founder' || profile.role === 'investor') && profile.id !== userProfile?.id) {
          combinedResults.push(profile as Profile);
        }
      });
    }

    if (startupsData) {
      startupsData.forEach(startup => {
        // Only add if the current user is not the founder of this startup
        if (startup.founder_id !== userProfile?.id) {
          combinedResults.push(startup as Startup);
        }
      });
    }

    setSearchResults(combinedResults);
    setLoading(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleStartChat = async (target: Profile | Startup) => {
    if (!userProfile?.id || !userProfile?.name) {
      toast.error("Your profile information is incomplete. Cannot start chat.");
      return;
    }

    let targetUserId: string;
    let targetUserName: string;
    let targetUserRole: string | null = null;
    let startupId: string | null = null;
    let startupName: string | null = null;
    let startupLogo: string | null = null;
    let founderId: string | null = null;
    let investorId: string | null = null;

    if ('role' in target) { // It's a Profile
      targetUserId = target.id;
      targetUserName = target.name || target.email?.split('@')[0] || 'User';
      targetUserRole = target.role;

      if (userProfile.role === 'investor' && targetUserRole === 'founder') {
        investorId = userProfile.id;
        founderId = targetUserId;
      } else if (userProfile.role === 'founder' && targetUserRole === 'investor') {
        investorId = targetUserId;
        founderId = userProfile.id;
      } else {
        toast.error("You can only start a chat with an investor if you are a founder, or with a founder if you are an investor.");
        return;
      }
    } else { // It's a Startup
      startupId = target.id;
      startupName = target.name;
      startupLogo = target.logo;
      founderId = target.founder_id;
      targetUserId = target.founder_id; // Chat with the founder of the startup
      targetUserName = target.founder_name;

      if (userProfile.role === 'investor') {
        investorId = userProfile.id;
      } else {
        toast.error("Only investors can initiate chats with startups.");
        return;
      }
    }

    // Check for existing chat
    const { data: existingChats, error: fetchChatError } = await supabase
      .from('chats')
      .select('*')
      .contains('user_ids', [userProfile.id, targetUserId])
      .eq('startup_id', startupId) // Important for distinguishing chats about different startups
      .single();

    if (fetchChatError && fetchChatError.code !== 'PGRST116') {
      toast.error("Failed to check for existing chat: " + fetchChatError.message);
      console.error("Error checking existing chat:", fetchChatError);
      return;
    }

    let chatToOpenId: string;

    if (existingChats) {
      chatToOpenId = existingChats.id;
      toast.info("Continuing existing chat.");
    } else {
      const initialUnreadCounts = {
        [userProfile.id]: 0,
        [targetUserId]: 1, // Mark as unread for the recipient
      };

      const { data: newChat, error: createChatError } = await supabase
        .from('chats')
        .insert({
          user_ids: [userProfile.id, targetUserId],
          investor_id: investorId,
          investor_name: investorId === userProfile.id ? userProfile.name : targetUserName,
          founder_id: founderId,
          founder_name: founderId === userProfile.id ? userProfile.name : targetUserName,
          startup_id: startupId,
          startup_name: startupName,
          startup_logo: startupLogo,
          last_message_text: 'Chat initiated!',
          last_message_timestamp: new Date().toISOString(),
          unread_counts: initialUnreadCounts,
        })
        .select('id')
        .single();

      if (createChatError) {
        toast.error("Failed to start new chat: " + createChatError.message);
        console.error("Error creating new chat:", createChatError);
        return;
      }
      chatToOpenId = newChat.id;
      toast.success("New chat started!");
      logActivity('chat_started', `Started a chat with ${targetUserName} about ${startupName || 'general'}`, chatToOpenId, 'MessageCircle');

      // Send notification to the other user
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'new_chat',
        message: `${userProfile.name || userProfile.email} started a chat with you about ${startupName || 'general'}!`,
        link: `/chat/${chatToOpenId}`,
        related_entity_id: chatToOpenId,
      });
    }

    setCurrentScreen('chat', { chatId: chatToOpenId });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home', { chatId: undefined })} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to chats">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">New Chat</h2>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users or startups..."
            className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for users or startups to chat with"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-16 h-8 rounded-lg" />
            </div>
          ))
        ) : searchResults.length > 0 ? (
          searchResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700 relative overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                {'logo' in result && result.logo ? (
                  result.logo.startsWith('http') ? (
                    <Image src={result.logo} alt={`${result.name} logo`} layout="fill" objectFit="cover" className="rounded-full" />
                  ) : (
                    result.logo
                  )
                ) : 'avatar_id' in result && result.avatar_id ? (
                  <Image src={getAvatarUrl(result.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                ) : (
                  ('name' in result ? result.name?.[0] : result.email?.[0]?.toUpperCase()) || '?'
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-50">
                  {'name' in result ? result.name : result.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {'role' in result ? result.role : 'Startup'}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleStartChat(result)}
                className="bg-gradient-to-r from-purple-700 to-teal-600 text-white"
                aria-label={`Start chat with ${'name' in result ? result.name : result.email || result.id}`}
              >
                <MessageCircle className="w-4 h-4 mr-1" /> Chat
              </Button>
            </div>
          ))
        ) : searchTerm.trim() ? (
          <div className="text-center text-gray-500 py-4 dark:text-gray-400">No results found for "{searchTerm}".</div>
        ) : (
          <div className="text-center text-gray-500 py-4 dark:text-gray-400">Start typing to find users or startups.</div>
        )}
      </div>
    </div>
  );
};

export default NewChatScreen;