"use client";

import React from 'react';
import { Rocket, MessageCircle, Bookmark, Check, Bell, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Startup {
  id: string; // Changed to string to match UUID
  name: string;
  logo: string; // Assuming logo is a string (e.g., emoji or URL)
  tagline: string;
  description: string;
  category: string;
  room_members: number; // Changed to match schema
  active_chats: number; // Changed to match schema
  interests: number;
  founder_name: string; // Changed to match schema
  location: string; // Assuming location is a string
}

interface InvestorFeedProps {
  startups: Startup[];
  bookmarkedStartups: string[]; // Changed to string[]
  toggleBookmark: (startupId: string) => void; // Changed to string
  setSelectedStartup: (startup: Startup) => void;
  setCurrentScreen: (screen: string) => void;
  setSelectedChat: (chat: any) => void; // Still 'any' for now
  loading: boolean; // New prop for loading state
}

const InvestorFeed: React.FC<InvestorFeedProps> = ({
  startups,
  bookmarkedStartups,
  toggleBookmark,
  setSelectedStartup,
  setCurrentScreen,
  setSelectedChat,
  loading, // Destructure loading prop
}) => {
  const renderStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
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
      <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
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
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discover Startups</h1>
            <p className="text-sm text-gray-500">Find your next investment</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-700" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search startups..." className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
          </div>
          <button className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          // Render 3 skeleton cards while loading
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : (
          startups.map(startup => (
            <div key={startup.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                  {startup.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{startup.name}</h3>
                    <Check className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-600">{startup.tagline}</p>
                </div>
                <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${bookmarkedStartups.includes(startup.id) ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Bookmark className="w-5 h-5" fill={bookmarkedStartups.includes(startup.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{startup.description}</p>

              <div className="flex gap-4 mb-4 p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl">
                <div>
                  <div className="text-lg font-bold text-gray-900">{startup.room_members}</div>
                  <div className="text-xs text-gray-500 uppercase">Members</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{startup.active_chats}</div>
                  <div className="text-xs text-gray-500 uppercase">Active Chats</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{startup.interests}</div>
                  <div className="text-xs text-gray-500 uppercase">Interested</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => {
                  setSelectedChat({ startup });
                  setCurrentScreen('chat');
                }} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Slide in 💬
                </button>
                <button onClick={() => {
                  setSelectedStartup(startup);
                  setCurrentScreen('startupDetail');
                }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Join room 🚀
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default InvestorFeed;