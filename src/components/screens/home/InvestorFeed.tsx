"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, MessageCircle, Bookmark, Check, Bell, Search, Filter, BrainCircuit, Eye, DollarSign } from 'lucide-react'; // Import Eye and DollarSign icons
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import MarketCapDisplay from '@/components/MarketCapDisplay'; // Import the new MarketCapDisplay component

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
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

interface InvestorFeedProps {
  startups: Startup[];
  bookmarkedStartups: string[];
  interestedStartups: string[]; // NEW: Add interestedStartups prop
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void; // NEW: Add toggleInterest prop
  // Removed setSelectedStartup and setSelectedChat props
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  loading: boolean;
  handleStartChat: (startup: Startup) => Promise<void>;
  fetchStartups: () => Promise<void>; // NEW: Add fetchStartups prop
  handleJoinStartupRoom: (startup: Startup) => Promise<void>; // NEW: Add handleJoinStartupRoom prop
}

const startupCategories = [
  "AgriTech", "AI/ML", "CleanTech", "EdTech", "FinTech", "Food & Beverage",
  "HealthTech", "Logistics", "Media & Entertainment", "PropTech", "SaaS",
  "Social Impact", "E-commerce", "Other"
];

const InvestorFeed: React.FC<InvestorFeedProps> = ({
  startups,
  bookmarkedStartups,
  interestedStartups, // NEW: Destructure interestedStartups
  toggleBookmark,
  toggleInterest, // NEW: Destructure toggleInterest
  // Removed setSelectedStartup and setSelectedChat from destructuring
  setCurrentScreen,
  loading,
  handleStartChat,
  fetchStartups, // NEW: Destructure fetchStartups
  handleJoinStartupRoom, // NEW: Destructure handleJoinStartupRoom
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const filteredStartups = startups.filter(startup => {
    const matchesSearch =
      startup.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.tagline.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? startup.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

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
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Discover Startups</h1>
            <p className="text-sm text-gray-500">Find your next investment</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="View notifications">
            <Bell className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search startups..."
              className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search startups"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selectedCategory ? 'bg-purple-700 text-white dark:bg-purple-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label="Filter by category">
                <Filter className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)} className={!selectedCategory ? 'font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-50' : 'dark:text-gray-50'}>
                All Categories
              </DropdownMenuItem>
              {startupCategories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-50' : 'dark:text-gray-50'}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Market Cap Display */}
        <MarketCapDisplay />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : (
          filteredStartups.length > 0 ? (
            filteredStartups.map(startup => {
              const isBookmarked = bookmarkedStartups.includes(startup.id);
              const isInterested = interestedStartups.includes(startup.id); // NEW: Check if interested

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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                        <Check className="w-4 h-4 text-teal-600" />
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
                    {startup.valuation !== null && (
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.currency}{startup.valuation?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase">Valuation</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setCurrentScreen('startupDetail', { startupId: startup.id })} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`View details for ${startup.name}`}>
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button onClick={() => {
                      handleJoinStartupRoom(startup); // Updated to use handleJoinStartupRoom
                    }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`Join room for ${startup.name}`}>
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
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No startups found</h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default InvestorFeed;