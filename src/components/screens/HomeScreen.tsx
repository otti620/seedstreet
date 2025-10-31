"use client";

import React from 'react';
import InvestorFeed from './home/InvestorFeed';
import FounderDashboard from './home/FounderDashboard';
import BottomNav from '../BottomNav'; // Corrected path

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

interface ActivityLog { // New interface for activity log entries
  id: string;
  user_id: string;
  type: string; // e.g., 'startup_listed', 'chat_started', 'profile_updated', 'bookmark_added'
  description: string;
  timestamp: string;
  entity_id: string | null; // ID of the related entity (startup, chat, etc.)
  icon: string | null; // Lucide icon name or emoji
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
  setCurrentScreen: (screen: string, params?: { startupId?: string }) => void; // Updated to accept params
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean; // New prop for loading state
  userProfileId: string | null; // New prop for founder dashboard
  userProfileName: string | null;
  userProfileEmail: string | null;
  handleStartChat: (startup: Startup) => Promise<void>; // Added handleStartChat prop
  recentActivities: ActivityLog[]; // New prop for recent activities
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
  loading,
  userProfileId,
  userProfileName,
  userProfileEmail,
  handleStartChat,
  recentActivities, // Destructure recentActivities
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
          loading={loading}
          handleStartChat={handleStartChat}
        />
      ) : (
        <FounderDashboard
          setActiveTab={setActiveTab}
          setCurrentScreen={setCurrentScreen}
          userProfileId={userProfileId || ''} // Pass userProfileId
          loading={loading}
          recentActivities={recentActivities} // Pass recent activities to FounderDashboard
        />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default HomeScreen;