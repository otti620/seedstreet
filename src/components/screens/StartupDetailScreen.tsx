"use client";

import React from 'react';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Eye, Check, BrainCircuit } from 'lucide-react'; // Import BrainCircuit
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  amount_sought: number | null; // Added
  currency: string | null; // Added
  funding_stage: string | null; // Added
  ai_risk_score: number | null; // Added for AI analysis
  market_trend_analysis: string | null; // Added for AI analysis
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
}) => {
  const isBookmarked = bookmarkedStartups.includes(selectedStartup.id);
  const isInterested = interestedStartups.includes(selectedStartup.id);

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Startup Details</h2>
          <button onClick={() => toggleBookmark(selectedStartup.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isBookmarked ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
            <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Startup Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-4xl shadow-lg mb-4">
            {selectedStartup.logo}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 dark:text-gray-50">{selectedStartup.name}</h1>
          <p className="text-md text-gray-600 mb-3 dark:text-gray-300">{selectedStartup.tagline}</p>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold dark:bg-purple-900 dark:text-purple-300">
            {selectedStartup.category}
          </Badge>
        </div>

        {/* Funding Details */}
        {(selectedStartup.amount_sought || selectedStartup.funding_stage) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 mb-3 dark:text-gray-50">Funding Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedStartup.amount_sought && (
                <div>
                  <p className="text-gray-500">Amount Sought</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {selectedStartup.currency || '$'}{selectedStartup.amount_sought.toLocaleString()}
                  </p>
                </div>
              )}
              {selectedStartup.funding_stage && (
                <div>
                  <p className="text-gray-500">Funding Stage</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.funding_stage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {(selectedStartup.ai_risk_score !== null || selectedStartup.market_trend_analysis) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 dark:text-gray-50">
              <BrainCircuit className="w-5 h-5 text-purple-700 dark:text-purple-400" /> AI Analysis
            </h3>
            <div className="space-y-3 text-sm">
              {selectedStartup.ai_risk_score !== null && (
                <div>
                  <p className="text-gray-500">AI Risk Score</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {selectedStartup.ai_risk_score} / 100
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedStartup.ai_risk_score < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      selectedStartup.ai_risk_score < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {selectedStartup.ai_risk_score < 30 ? 'Low Risk' :
                       selectedStartup.ai_risk_score < 70 ? 'Moderate Risk' : 'High Risk'}
                    </span>
                  </p>
                </div>
              )}
              {selectedStartup.market_trend_analysis && (
                <div>
                  <p className="text-gray-500">Market Trend Analysis</p>
                  <p className="font-semibold text-gray-900 leading-relaxed dark:text-gray-50">
                    {selectedStartup.market_trend_analysis}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-3 dark:text-gray-50">About {selectedStartup.name}</h3>
          <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-200">{selectedStartup.description}</p>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-3 dark:text-gray-50">Key Metrics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{selectedStartup.room_members}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{selectedStartup.active_chats}</div>
              <div className="text-xs text-gray-500">Active Chats</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{selectedStartup.interests}</div>
              <div className="text-xs text-gray-500">Interested</div>
            </div>
          </div>
        </div>

        {/* Founder Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-3 dark:text-gray-50">Founder</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-50">
              {selectedStartup.founder_name?.[0] || 'F'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.founder_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedStartup.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {userRole === 'investor' && (
        <div className="bg-white border-t border-gray-100 p-4 flex gap-3 dark:bg-gray-900 dark:border-gray-800">
          <Button
            onClick={() => toggleInterest(selectedStartup.id)}
            className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isInterested
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-700 dark:bg-purple-900 dark:text-purple-400 dark:border-purple-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            aria-label={isInterested ? "Remove interest" : "Signal interest"}
          >
            <Eye className="w-4 h-4" fill={isInterested ? 'currentColor' : 'none'} />
            {isInterested ? 'Interest Signaled' : 'Signal Interest'}
          </Button>
          <Button
            onClick={() => handleStartChat(selectedStartup)}
            className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            aria-label={`Start chat with ${selectedStartup.founder_name}`}
          >
            <MessageCircle className="w-4 h-4" />
            Start Chat
          </Button>
        </div>
      )}
    </div>
  );
};

export default StartupDetailScreen;