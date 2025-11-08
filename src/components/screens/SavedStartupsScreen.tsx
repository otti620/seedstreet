"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bookmark, Eye, Rocket, MessageCircle, DollarSign, Edit } from 'lucide-react'; // Added Edit icon
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils'; // Import formatCurrency

// Define TypeScript interfaces for data structures
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
  valuation: number | null; // Added valuation
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
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfileId: string;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
  startups: Startup[]; // Pass all startups to filter from
  userProfileId: string | null; // NEW: Add userProfileId prop
}

const SavedStartupsScreen: React.FC<SavedStartupsScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  handleStartChat,
  fetchStartups,
  handleJoinStartupRoom,
  startups, // Destructure all startups
}) => {
  const [loading, setLoading] = useState(true);
  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);

  useEffect(() => {
    setLoading(true);
    // Filter from the global 'startups' array based on bookmarked and interested IDs
    const filtered = startups.filter(startup =>
      bookmarkedStartups.includes(startup.id) || interestedStartups.includes(startup.id)
    );
    setSavedStartups(filtered);
    setLoading(false);
  }, [startups, bookmarkedStartups, interestedStartups]); // Depend on global startups and user's saved lists

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
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
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
          savedStartups.length > 0 ? (
            savedStartups.map(startup => {
              const isBookmarked = bookmarkedStartups.includes(startup.id);
              const isInterested = interestedStartups.includes(startup.id);
              const isMyStartup = userProfileId === startup.founder_id; // NEW: Check if it's the current user's startup

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
                    {!isMyStartup && ( // Only show bookmark button if not my startup
                      <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isBookmarked ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
                        <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    )}
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
                    {startup.valuation !== null && (
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                          {formatCurrency(startup.valuation, startup.currency, 'N/A')}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">Valuation</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isMyStartup ? (
                      <button
                        onClick={() => setCurrentScreen('manageStartup', { startupId: startup.id })}
                        className="flex-1 h-12 bg-purple-700 text-white rounded-xl font-semibold text-sm hover:bg-purple-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                        aria-label={`Manage ${startup.name}`}
                      >
                        <Edit className="w-4 h-4" />
                        Manage Startup
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setCurrentScreen('startupDetail', { startupId: startup.id })} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`View details for ${startup.name}`}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button onClick={() => {
                          handleJoinStartupRoom(startup);
                        }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`Join room for ${startup.name}`}>
                          <Rocket className="w-4 h-4" />
                          Join room 🚀
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No saved startups yet</h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">Bookmark or signal interest in startups to see them here!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SavedStartupsScreen;