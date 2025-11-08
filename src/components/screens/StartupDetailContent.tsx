"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Heart, Bookmark, MessageCircle, DollarSign, Eye, MapPin, Users, TrendingUp, BrainCircuit, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CommitmentDialog from '../CommitmentDialog';
import { Progress } from '@/components/ui/progress';

// Define TypeScript interfaces for data structures
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

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface StartupDetailContentProps {
  selectedStartup: Startup;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  // Removed setSelectedChat prop
  activeTab: string;
  userRole: string | null;
  setActiveTab: (tab: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  userProfile: Profile | null;
  fetchStartups: () => Promise<void>; // NEW: Add fetchStartups prop
}

const StartupDetailContent = ({ // Removed React.FC<StartupDetailContentProps>
  selectedStartup,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  setCurrentScreen,
  // Removed setSelectedChat from destructuring
  activeTab,
  userRole,
  setActiveTab,
  handleStartChat,
  logActivity,
  fetchUserProfile,
  userProfile,
  fetchStartups, // NEW: Destructure fetchStartups
}: StartupDetailContentProps) => { // Added type annotation here instead
  const isBookmarked = bookmarkedStartups.includes(selectedStartup.id);
  const isInterested = interestedStartups.includes(selectedStartup.id);
  const [isCommitmentDialogOpen, setIsCommitmentDialogOpen] = useState(false);

  React.useEffect(() => {
    logActivity('startup_viewed', `Viewed startup: ${selectedStartup.name}`, selectedStartup.id, 'Eye');
  }, [selectedStartup.id, selectedStartup.name, logActivity]);

  const fundingProgress = selectedStartup.amount_sought && selectedStartup.amount_raised
    ? Math.min(100, (selectedStartup.amount_raised / selectedStartup.amount_sought) * 100)
    : 0;

  return (
    <> {/* Added explicit React.Fragment */}
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Startup Details</h2>
            <button onClick={() => toggleBookmark(selectedStartup.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isBookmarked ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Startup Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg flex-shrink-0 relative overflow-hidden">
                {selectedStartup.logo.startsWith('http') ? (
                  <Image src={selectedStartup.logo} alt={`${selectedStartup.name} logo`} layout="fill" objectFit="cover" className="rounded-xl" />
                ) : (
                  selectedStartup.logo
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{selectedStartup.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedStartup.tagline}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">{selectedStartup.category}</Badge>
                  {selectedStartup.ai_risk_score !== null && (
                    <Badge
                      variant="secondary"
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedStartup.ai_risk_score < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        selectedStartup.ai_risk_score < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      <BrainCircuit className="w-3 h-3" />
                      Risk: {selectedStartup.ai_risk_score}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-4 dark:text-gray-200">{selectedStartup.pitch}</p>
          </div>

          {/* Funding & Engagement */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Funding & Engagement</h3>
            <div className="space-y-4">
              {selectedStartup.amount_sought && (
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <span>Raised: {selectedStartup.currency}{selectedStartup.amount_raised?.toLocaleString() || '0'}</span>
                    <span>Target: {selectedStartup.currency}{selectedStartup.amount_sought?.toLocaleString()}</span>
                  </div>
                  <Progress value={fundingProgress} className="h-2 bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                      style={{ width: `${fundingProgress}%` }}
                    />
                  </Progress>
                  {fundingProgress >= 100 && (
                    <p className="text-xs text-green-600 mt-2 font-medium dark:text-green-400">Funding target reached!</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Eye className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                <span className="font-semibold">{selectedStartup.interests} people signaled interest</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.room_members}</div>
                  <div className="text-sm text-gray-500">Members</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.active_chats}</div>
                  <div className="text-sm text-gray-500">Active Chats</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.interests}</div>
                  <div className="text-sm text-gray-500">Interested</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.location}</div>
                  <div className="text-sm text-gray-500">Location</div>
                </div>
              </div>
              {selectedStartup.amount_sought && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.currency}{selectedStartup.amount_sought?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Amount Sought</div>
                  </div>
                </div>
              )}
              {selectedStartup.funding_stage && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-50">{selectedStartup.funding_stage}</div>
                    <div className="text-sm text-gray-500">Funding Stage</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {selectedStartup.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">About {selectedStartup.name}</h3>
              <p className="text-gray-700 dark:text-gray-200">{selectedStartup.description}</p>
            </div>
          )}

          {/* AI Market Trend Analysis */}
          {selectedStartup.market_trend_analysis && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
                <BrainCircuit className="w-5 h-5 text-purple-700 dark:text-purple-400" /> AI Market Trend Analysis
              </h3>
              <p className="text-gray-700 dark:text-gray-200">{selectedStartup.market_trend_analysis}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            {userRole === 'investor' && (
              <>
                <Button
                  onClick={() => handleStartChat(selectedStartup)}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Slide in 💬
                </Button>
                <Button
                  onClick={() => setIsCommitmentDialogOpen(true)}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  aria-label="Make a commitment"
                >
                  <DollarSign className="w-4 h-4" />
                  Commit 💰
                </Button>
              </>
            )}
            <Button
              onClick={() => toggleInterest(selectedStartup.id)}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isInterested
                  ? 'bg-teal-50 text-teal-700 border-2 border-teal-600 hover:bg-teal-100 dark:bg-teal-900 dark:text-teal-200 dark:border-teal-700 dark:hover:bg-teal-800'
                  : 'bg-purple-50 text-purple-700 border-2 border-purple-600 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              {isInterested ? 'Interest Signaled' : 'Signal Interest'}
            </Button>
            <Button
              onClick={() => setCurrentScreen('startupRoom', { startupRoomId: selectedStartup.id })}
              className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700"
              aria-label={`Join room for ${selectedStartup.name}`}
            >
              <Rocket className="w-4 h-4" />
              Join room 🚀
            </Button>
          </div>
        </div>

        {isCommitmentDialogOpen && userRole === 'investor' && userProfile && (
          <CommitmentDialog
            isOpen={isCommitmentDialogOpen}
            onClose={() => setIsCommitmentDialogOpen(false)}
            startupId={selectedStartup.id}
            startupName={selectedStartup.name}
            startupLogo={selectedStartup.logo}
            founderId={selectedStartup.founder_id}
            founderName={selectedStartup.founder_name}
            investorId={userProfile.id}
            investorName={userProfile.name || userProfile.email?.split('@')[0] || 'Investor'}
            logActivity={logActivity}
            fetchUserProfile={fetchUserProfile}
            fetchStartups={fetchStartups} {/* NEW: Pass fetchStartups */}
          />
        )}
      </div>
    </>
  );
};

export default StartupDetailContent;