"use client";

import React from 'react';
import InvestorFeed from './home/InvestorFeed';
import FounderDashboard from './home/FounderDashboard';
import BottomNav from '../BottomNav';

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

interface HomeScreenProps {
  userRole: string | null;
  startups: Startup[];
  bookmarkedStartups: number[];
  interestedStartups: number[];
  toggleBookmark: (startupId: number) => void;
  toggleInterest: (startupId: number) => void;
  setSelectedStartup: (startup: Startup) => void;
  setSelectedChat: (chat: any) => void;
  setCurrentScreen: (screen: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userRole,
  startups,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  setSelectedStartup,
  setSelectedChat,
  setCurrentScreen,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {userRole === 'investor' ? (
        <InvestorFeed
          startups={startups}
          bookmarkedStartups={bookmarkedStartups}
          toggleBookmark={toggleBookmark}
          setSelectedStartup={setSelectedStartup}
          setCurrentScreen={setCurrentScreen}
          setSelectedChat={setSelectedChat}
        />
      ) : (
        <FounderDashboard
          setActiveTab={setActiveTab}
        />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default HomeScreen;