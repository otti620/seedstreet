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

interface ActivityLog { // New interface for activity log entries
  id: string;
  user_id: string;
  type: string; // e.g., 'startup_listed', 'chat_started', 'profile_updated', 'bookmark_added'
  description: string;
  timestamp: string;
  entity_id: string | null; // ID of the related entity (startup, chat, etc.)
  icon: string | null; // Lucide icon name or emoji
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface HomeScreenProps {
  userRole: string | null;
  startups: Startup[];
  bookmarkedStartups: string[]; // Changed to string[]
  interestedStartups: string[]; // Changed to string[]
  toggleBookmark: (startupId: string) => void; // Changed to string
  toggleInterest: (startupId: string) => void; // Changed to string
  // Removed setSelectedStartup and setSelectedChat props
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean; // New prop for loading state
  userProfileId: string | null; // New prop for founder dashboard
  userProfileName: string | null;
  userProfileEmail: string | null;
  handleStartChat: (startup: Startup) => Promise<void>; // Added handleStartChat prop
  recentActivities: ActivityLog[]; // New prop for recent activities
  fetchStartups: () => Promise<void>; // NEW: Add fetchStartups prop
  handleJoinStartupRoom: (startup: Startup) => Promise<void>; // NEW: Add handleJoinStartupRoom prop
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userRole,
  startups,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  // Removed setSelectedStartup and setSelectedChat from destructuring
  setCurrentScreen,
  activeTab,
  setActiveTab,
  loading,
  userProfileId,
  userProfileName,
  userProfileEmail,
  handleStartChat,
  recentActivities,
  fetchStartups, // NEW: Destructure fetchStartups
  handleJoinStartupRoom, // NEW: Destructure handleJoinStartupRoom
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {userRole === 'investor' ? (
        <InvestorFeed
          startups={startups}
          bookmarkedStartups={bookmarkedStartups}
          interestedStartups={interestedStartups} // NEW: Pass interestedStartups
          toggleBookmark={toggleBookmark}
          toggleInterest={toggleInterest} // NEW: Pass toggleInterest
          // Removed setSelectedStartup and setSelectedChat props
          setCurrentScreen={setCurrentScreen}
          loading={loading}
          handleStartChat={handleStartChat}
          fetchStartups={fetchStartups} // NEW: Pass fetchStartups
          handleJoinStartupRoom={handleJoinStartupRoom} // NEW: Pass handleJoinStartupRoom
        />
      ) : (
        <FounderDashboard
          setActiveTab={setActiveTab}
          setCurrentScreen={setCurrentScreen}
          userProfileId={userProfileId || ''}
          loading={loading}
          recentActivities={recentActivities}
        />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default HomeScreen;