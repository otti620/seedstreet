"use client";

import React from 'react';
import { Rocket, MessageCircle, Bookmark, Check, Bell, Search, Filter } from 'lucide-react';

interface Startup {
  id: number;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  category: string;
  roomMembers: number;
  activeChats: number;
  interests: number;
  founder: string;
  location: string;
}

interface InvestorFeedProps {
  startups: Startup[];
  bookmarkedStartups: number[];
  toggleBookmark: (startupId: number) => void;
  setSelectedStartup: (startup: Startup) => void;
  setCurrentScreen: (screen: string) => void;
  setSelectedChat: (chat: any) => void;
}

const InvestorFeed: React.FC<InvestorFeedProps> = ({
  startups,
  bookmarkedStartups,
  toggleBookmark,
  setSelectedStartup,
  setCurrentScreen,
  setSelectedChat,
}) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discover Startups</h1>
            <p className="text-sm text-gray-500">Find your next investment</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
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
        {startups.map(startup => (
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
                <div className="text-lg font-bold text-gray-900">{startup.roomMembers}</div>
                <div className="text-xs text-gray-500 uppercase">Members</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{startup.activeChats}</div>
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
        ))}
      </div>
    </>
  );
};

export default InvestorFeed;