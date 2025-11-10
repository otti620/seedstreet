"use client";

import React from 'react';
import Image from 'next/image';
import { User, Bell, Bookmark, Settings, MessageCircle, LogOut, ShoppingBag, ShieldCheck, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '../BottomNav';
import MenuItem from '../MenuItem';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '@/lib/default-avatars';
import { Profile, ScreenParams } from '@/types'; // Import types from the shared file

interface ProfileScreenProps {
  userProfile: Profile | null;
  userRole: string | null;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  setActiveTab: (tab: string) => void;
  activeTab: string;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserProfile: (profile: Profile | null) => void;
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
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-teal-600 px-6 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl animate-float-delay-2s" />
        </div>
        <div className="flex justify-end mb-4 relative z-10">
          <button onClick={() => setCurrentScreen('settings')} className="text-white hover:text-gray-200 transition-colors" aria-label="Settings">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center text-white relative z-10">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold mb-2 shadow-xl relative overflow-hidden border-4 border-white ring-4 ring-purple-300/50 dark:ring-teal-300/50">
            {userProfile?.avatar_id ? (
              <Image src={getAvatarUrl(userProfile.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
            ) : (
              userProfile?.name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <h2 className="text-xl font-bold mb-0.5">{userProfile?.name || userProfile?.email || 'User Name'}</h2>
          <p className="text-white/80 text-xs mb-2">{userProfile?.email || 'user@email.com'}</p>
          <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
            {userRole === 'investor' ? '💰 Investor' : userRole === 'founder' ? '💡 Founder' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-12 overflow-y-auto px-6 pb-24">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Your Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{bookmarkedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Bookmarks</div>
            </div>
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{interestedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Interested</div>
            </div>
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
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
          {isAdmin && (
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
              setUserProfile(null);
              setCurrentScreen('auth');
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