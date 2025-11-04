"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Rocket, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
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

interface SavedStartupsScreenProps {
  setCurrentScreen: (screen: string, params?: { startupId?: string }) => void;
  userProfileId: string;
  bookmarkedStartupIds: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setSelectedStartup: (startup: Startup) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  interestedStartups: string[];
}

const SavedStartupsScreen: React.FC<SavedStartupsScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  bookmarkedStartupIds,
  toggleBookmark,
  toggleInterest,
  setSelectedStartup,
  handleStartChat,
  interestedStartups,
}) => {
  const [bookmarkedStartups, setBookmarkedStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedStartups = async () => {
      setLoading(true);
      if (bookmarkedStartupIds.length === 0) {
        setBookmarkedStartups([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .in('id', bookmarkedStartupIds);

      if (error) {
        toast.error("Failed to load saved startups: " + error.message);
        console.error("Error fetching bookmarked startups:", error);
        setBookmarkedStartups([]);
      } else if (data) {
        setBookmarkedStartups(data as Startup[]);
      }
      setLoading(false);
    };

    fetchBookmarkedStartups();

    // Real-time subscription for startups to keep data fresh
    const channel = supabase
      .channel('public:startups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, payload => {
        // Re-fetch all bookmarked startups if any startup changes
        fetchBookmarkedStartups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookmarkedStartupIds]);

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : (
          bookmarkedStartups.length > 0 ? (
            bookmarkedStartups.map(startup => {
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                      {startup.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{startup.tagline}</p>
                    </div>
                    <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isBookmarked ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
                      <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 dark:text-gray-200">{startup.description}</p>

                  <div className="flex gap-2">
                    <button onClick={() => handleStartChat(startup)} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`Start chat with ${startup.founder_name}`}>
                      <MessageCircle className="w-4 h-4" />
                      Slide in 💬
                    </button>
                    <button onClick={() => {
                      setSelectedStartup(startup);
                      setCurrentScreen('startupDetail');
                    }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`View details for ${startup.name}`}>
                      <Rocket className="w-4 h-4" />
                      View Details 🚀
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No saved startups</h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">Bookmark startups from the feed to see them here!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SavedStartupsScreen;