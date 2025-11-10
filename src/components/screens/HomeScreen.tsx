"use client";

import React from 'react';
import InvestorFeed from './home/InvestorFeed';
import FounderDashboard from './home/FounderDashboard';
import BottomNav from '../BottomNav';
import { Profile, Startup, ActivityLog, ScreenParams } from '@/types'; // Import types from the shared file

interface HomeScreenProps {
  userRole: string | null;
  startups: Startup[];
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean;
  userProfileId: string | null;
  userProfileName: string | null;
  userProfileEmail: string | null;
  handleStartChat: (startup: Startup) => Promise<void>;
  recentActivities: ActivityLog[];
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userRole,
  startups,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  setCurrentScreen,
  activeTab,
  setActiveTab,
  loading,
  userProfileId,
  userProfileName,
  userProfileEmail,
  handleStartChat,
  recentActivities,
  fetchStartups,
  handleJoinStartupRoom,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {userRole === 'investor' ? (
        <InvestorFeed
          startups={startups}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups}
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest}
          setCurrentScreen={setCurrentScreen}
          loading={loading}
          handleStartChat={handleStartChat}
          fetchStartups={fetchStartups}
          handleJoinStartupRoom={handleJoinStartupRoom}
          userProfileId={userProfileId}
        />
      ) : (
        <FounderDashboard
          setActiveTab={setActiveTab}
          setCurrentScreen={setCurrentScreen}
          userProfileId={userProfileId || ''}
          loading={loading}
          recentActivities={recentActivities}
          startups={startups} // Pass the global startups array
          userProfileProAccount={userProfile?.pro_account || false} // Pass pro_account
        />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default HomeScreen;