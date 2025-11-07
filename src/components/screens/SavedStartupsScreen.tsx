"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Bookmark, Eye, MessageCircle, Rocket, Search, Filter, BrainCircuit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Define TypeScript interfaces for data structures
interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
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
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface SavedStartupsScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  userProfileId: string;
  bookmarkedStartupIds: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  // Removed setSelectedStartup prop
  handleStartChat: (startup: Startup) => Promise<void>;
}

const SavedStartupsScreen: React.FC<SavedStartupsScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  bookmarkedStartupIds,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  // Removed setSelectedStartup from destructuring
  handleStartChat,
}) => {
  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'bookmarked' | 'interested'>('bookmarked');

  useEffect(() => {
    const fetchSavedStartups = async () => {
      setLoading(true);
      let startupIdsToFetch: string[] = [];
      if (filter === 'bookmarked') {
        startupIdsToFetch = bookmarkedStartupIds;
      } else if (filter === 'interested') {
        startupIdsToFetch = interestedStartups;
      }

      if (startupIdsToFetch.length === 0) {
        setSavedStartups([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .in('id', startupIdsToFetch);

      if (error) {
        toast.error("Failed to load saved startups: " + error.message);
        console.error("Error fetching saved startups:", error);
        setSavedStartups([]);
      } else if (data) {
        // Sort to maintain order if needed, or just display as fetched
        setSavedStartups(data as Startup[]);
      }
      setLoading(false);
    };

    fetchSavedStartups();
  }, [bookmarkedStartupIds, interestedStartups, filter]);

  const renderStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to profile">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Saved Startups</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex gap-2 dark:bg-gray-900 dark:border-gray-800">
        <button
          onClick={() => setFilter('bookmarked')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filter === 'bookmarked'
              ? 'bg-purple-700 text-white shadow-md dark:bg-purple-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Bookmarks ({bookmarkedStartupIds.length})
        </button>
        <button
          onClick={() => setFilter('interested')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filter === 'interested'
              ? 'bg-teal-600 text-white shadow-md dark:bg-teal-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Interested ({interestedStartups.length})
        </button>
      </div>

      {/* Saved Startups List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : savedStartups.length > 0 ? (
          savedStartups.map(startup => {
            const isBookmarked = bookmarkedStartupIds.includes(startup.id);
            const isInterested = interestedStartups.includes(startup.id);

            return (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden">
                    {startup.logo.startsWith('http') ? (
                      <Image src={startup.logo} alt={`${startup.name} logo`} layout="fill" objectFit="cover" className="rounded-xl" />
                    ) : (
                      startup.logo
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                      {startup.ai_risk_score !== null && (
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            startup.ai_risk_score < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            startup.ai_risk_score < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          <BrainCircuit className="w-3 h-3" />
                          Risk: {startup.ai_risk_score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{startup.tagline}</p>
                  </div>
                  <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isBookmarked ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
                    <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2 dark:text-gray-200">{startup.description}</p>

                <div className="flex gap-4 mb-4 p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl dark:from-gray-700 dark:to-gray-700">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.room_members}</div>
                    <div className="text-xs text-gray-500 uppercase">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.active_chats}</div>
                    <div className="text-xs text-gray-500 uppercase">Active Chats</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.interests}</div>
                    <div className="text-xs text-gray-500 uppercase">Interested</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleStartChat(startup)} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`Start chat with ${startup.founder_name}`}>
                    <MessageCircle className="w-4 h-4" />
                    Slide in 💬
                  </button>
                  <button onClick={() => {
                    setCurrentScreen('startupDetail', { startupId: startup.id }); // Use setCurrentScreen
                  }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`View details for ${startup.name}`}>
                    <Rocket className="w-4 h-4" />
                    Join room 🚀
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
              {filter === 'bookmarked' ? '🔖' : '👀'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No {filter} startups</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              {filter === 'bookmarked'
                ? 'You haven\'t bookmarked any startups yet.'
                : 'You haven\'t signaled interest in any startups yet.'}
            </p>
            <button onClick={() => setCurrentScreen('home')} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all">
              Discover Startups
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedStartupsScreen;