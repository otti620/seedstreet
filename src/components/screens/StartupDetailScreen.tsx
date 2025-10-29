"use client";

import React from 'react';
import { ArrowLeft, Bookmark, Check, MessageCircle, Rocket, Eye } from 'lucide-react'; // Import Eye icon
import { toast } from 'sonner';
import BottomNav from '../BottomNav';

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
  founder_id: string; // Added founder_id
}

interface StartupDetailScreenProps {
  selectedStartup: Startup;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string) => void;
  setSelectedChat: (chat: any) => void;
  activeTab: string;
  userRole: string | null;
  setActiveTab: (tab: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>; // Add logActivity prop
}

const StartupDetailScreen: React.FC<StartupDetailScreenProps> = ({
  selectedStartup,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  setCurrentScreen,
  setSelectedChat,
  activeTab,
  userRole,
  setActiveTab,
  handleStartChat,
  logActivity, // Destructure logActivity
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{selectedStartup.name}</h1>
          </div>
          <button onClick={() => {
            toggleBookmark(selectedStartup.id);
            logActivity(
              bookmarkedStartups.includes(selectedStartup.id) ? 'bookmark_removed' : 'bookmark_added',
              `${bookmarkedStartups.includes(selectedStartup.id) ? 'Removed' : 'Added'} ${selectedStartup.name} to bookmarks`,
              selectedStartup.id,
              'Bookmark'
            );
          }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${bookmarkedStartups.includes(selectedStartup.id) ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Bookmark className="w-5 h-5" fill={bookmarkedStartups.includes(selectedStartup.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-xl">
              {selectedStartup.logo}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{selectedStartup.name}</h2>
              <p className="text-white/80">{selectedStartup.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">{selectedStartup.category}</span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">📍 {selectedStartup.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{selectedStartup.room_members}</div>
            <div className="text-xs text-gray-500 mt-1">Room Members</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{selectedStartup.active_chats}</div>
            <div className="text-xs text-gray-500 mt-1">Active Chats</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="2xl font-bold text-gray-900">{selectedStartup.interests}</div>
            <div className="text-xs text-gray-500 mt-1">Interested</div>
          </div>
        </div>

        {/* The Story */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">The Story</h3>
          <p className="text-gray-700 leading-relaxed">{selectedStartup.description}</p>
          <p className="text-gray-700 leading-relaxed mt-4">
            We're building a sustainable future by making solar energy accessible to every household in Africa. 
            Our innovative financing model allows families to pay as they use, removing the upfront cost barrier.
          </p>
        </div>

        {/* Founder */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Meet the Founder</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {selectedStartup.founder_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{selectedStartup.founder_name}</h4>
              <p className="text-sm text-gray-500">Founder & CEO</p>
            </div>
          </div>
        </div>

        {/* Why Back Us */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="lg font-bold text-gray-900 mb-4">Why Back Us?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">Proven pilot in 3 states with 500+ homes powered</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">Backed by Green Energy Fund and impact investors</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">60% MoM growth in customer acquisition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-100 p-6 space-y-3">
        <button 
          onClick={() => {
            toggleInterest(selectedStartup.id);
            logActivity(
              interestedStartups.includes(selectedStartup.id) ? 'interest_removed' : 'interest_added',
              `${interestedStartups.includes(selectedStartup.id) ? 'Removed' : 'Signaled'} interest in ${selectedStartup.name}`,
              selectedStartup.id,
              'Eye'
            );
          }}
          className={`w-full h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            interestedStartups.includes(selectedStartup.id)
              ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
              : 'bg-amber-50 text-amber-600 border-2 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className="text-xl">👀</span>
          {interestedStartups.includes(selectedStartup.id) ? "You're interested!" : "I'm interested"}
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => handleStartChat(selectedStartup)}
            className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all"
          >
            Start a Chat 💬
          </button>
          <button className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 active:scale-95 transition-all">
            Join Room 🚀
          </button>
        </div>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default StartupDetailScreen;