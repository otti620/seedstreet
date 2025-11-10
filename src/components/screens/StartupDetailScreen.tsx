"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Startup, Profile, ScreenParams } from '@/types'; // Import types from the shared file

interface StartupDetailScreenProps {
  selectedStartup: Startup;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  activeTab: string;
  userRole: string | null;
  setActiveTab: (tab: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
  userProfile: Profile | null;
  fetchStartups: () => Promise<void>;
  handleJoinStartupRoom: (startup: Startup) => Promise<void>;
  userProfileId: string | null;
}

// Dynamically import the content component
const DynamicStartupDetailContent = dynamic<StartupDetailScreenProps>(
  () => import('./StartupDetailContent').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    ),
  }
);

const StartupDetailScreen: React.FC<StartupDetailScreenProps> = (props) => {
  return <DynamicStartupDetailContent {...props} />;
};

export default StartupDetailScreen;