"use client";

import React from 'react';
import InvestorFeed from './home/InvestorFeed';
import FounderDashboard from './home/FounderDashboard';
import BottomNav from '../BottomNav';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[]; // Array of startup IDs
  interested_startups: string[]; // Array of startup IDs
}

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

interface HomeScreenProps {
  userRole: string | null;
  startups: Startup[];
  bookmarkedStartups: string[]; // Changed to string[]
  interestedStartups: string[]; // Changed to string[]
  toggleBookmark: (startupId: string) => void; // Changed to string
  toggleInterest: (startupId: string) => void; // Changed to string
  setSelectedStartup: (startup: Startup) => void;
  setSelectedChat: (chat: any) => void; // Still 'any' for now
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