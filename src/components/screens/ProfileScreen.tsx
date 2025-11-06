"use client";

import React from 'react';
import Image from 'next/image'; // Import Image from next/image
import { User, Bell, Bookmark, Settings, MessageCircle, LogOut, ShoppingBag, ShieldCheck } from 'lucide-react'; // Import ShieldCheck
import { toast } from 'sonner';
import BottomNav from '../BottomNav'; // Corrected path
import MenuItem from '../MenuItem';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '@/lib/default-avatars'; // Import getAvatarUrl
// ThemeToggle is moved to SettingsScreen

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null; // Changed from avatar_url
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null; // Added 'admin' role
  onboarding_complete: boolean;
  bookmarked_startups: string[]; // Array of startup IDs
  interested_startups: string[]; // Array of startup IDs
  bio: string | null;
  location: string | null;
  phone: string | null;
  total_committed: number; // Add total_committed
}

interface ProfileScreenProps {
  userProfile: Profile | null;
  userRole: string | null;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserProfile: (profile: Profile | null) => void; // Added to update profile after edit
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  userRole,
  bookmarkedStartups,
  interestedStartups,
  setCurrentScreen,
  setActiveTab,
  activeTab,
  setIsLoggedIn,
  setUserProfile,
}) => {
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950"> {/* Added dark mode background */}
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-teal-600 px-6 pt-12 pb-20">
        <div className="flex justify-end mb-4">
          {/* ThemeToggle moved to SettingsScreen */}
          <button onClick={() => setCurrentScreen('settings')} className="text-white" aria-label="Settings">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-700 text-3xl font-bold mb-3 shadow-xl relative overflow-hidden">
            {userProfile?.avatar_id ? (
              <Image src={getAvatarUrl(userProfile.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
            ) : (
              userProfile?.name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{userProfile?.name || userProfile?.email || 'User Name'}</h2>
          <p className="text-white/80 text-sm mb-3">{userProfile?.email || 'user@email.com'}</p>
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
            {userRole === 'investor' ? '💰 Investor' : userRole === 'founder' ? '💡 Founder' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-12 overflow-y-auto px-6 pb-24">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Your Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{bookmarkedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{interestedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Interested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {userProfile?.total_committed ? `$${userProfile.total_committed.toLocaleString()}` : '$0'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Committed</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <MenuItem icon={<User />} label="Edit Profile" onClick={() => setCurrentScreen('editProfile')} />
          <MenuItem icon={<Bell />} label="Notifications" onClick={() => setCurrentScreen('notifications')} />
          <MenuItem icon={<Bookmark />} label="Saved Startups" count={bookmarkedStartups.length} onClick={() => setCurrentScreen('savedStartups')} />
          <MenuItem icon={<ShoppingBag />} label="Merch Store" onClick={() => setCurrentScreen('merchStore')} />
          <MenuItem icon={<Settings />} label="Settings" onClick={() => setCurrentScreen('settings')} />
          <MenuItem icon={<MessageCircle />} label="Help & Support" onClick={() => setCurrentScreen('helpAndSupport')} />
          {isAdmin && ( // Conditionally render Admin Dashboard for admins
            <MenuItem icon={<ShieldCheck />} label="Admin Dashboard" onClick={() => setCurrentScreen('adminDashboard')} />
          )}
        </div>

        {/* Logout */}
        <button 
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              toast.error("Failed to log out: " + error.message);
            } else {
              toast.success("Logged out successfully!");
              setIsLoggedIn(false);
              setUserProfile(null); // Clear user profile on logout
              setCurrentScreen('auth'); // Redirect to auth screen after logout
            }
          }}
          className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default ProfileScreen;