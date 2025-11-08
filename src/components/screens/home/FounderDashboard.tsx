"use client";

import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Bell, Rocket, Check, Bookmark, Eye } from 'lucide-react'; // Import Bookmark and Eye icons
import BottomNav from '../../BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

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
  status: 'Pending' | 'Approved' | 'Rejected';
  founder_id: string;
  views: number; // Added views to the interface
  valuation: number | null; // Added valuation
  amount_raised?: number; // Added amount_raised
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

interface FounderDashboardProps {
  setActiveTab: (tab: string) => void;
  setCurrentScreen: (screen: string, params?: { startupId?: string }) => void;
  userProfileId: string;
  loading: boolean;
  recentActivities: ActivityLog[]; // New prop for recent activities
  startups: Startup[]; // Pass the global startups array
}

const FounderDashboard: React.FC<FounderDashboardProps> = ({
  setActiveTab,
  setCurrentScreen,
  userProfileId,
  loading,
  recentActivities = [], // Add default empty array here
  startups, // Destructure global startups array
}) => {
  const [founderStartup, setFounderStartup] = useState<Startup | null>(null);
  const [startupLoading, setStartupLoading] = useState(true);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0); // State for rotating activities

  // Use a useEffect to find the founder's startup from the global 'startups' array
  // This ensures the dashboard always reflects the latest global state
  useEffect(() => {
    if (userProfileId && startups.length > 0) {
      const foundStartup = startups.find(s => s.founder_id === userProfileId);
      setFounderStartup(foundStartup || null);
      setStartupLoading(false);
    } else if (userProfileId && startups.length === 0 && !loading) {
      // If no startups are loaded yet, or none found for this founder
      setFounderStartup(null);
      setStartupLoading(false);
    }
  }, [userProfileId, startups, loading]); // Depend on userProfileId and the global startups array

  // Effect for rotating recent activities
  useEffect(() => {
    // With recentActivities defaulting to [], we only need to check its length.
    if (recentActivities.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      // The prop is guaranteed to be an array due to the default value,
      // so only check length here.
      if (recentActivities.length === 0) { // This case should ideally not be hit if initial length > 1
        clearInterval(timer);
        setCurrentActivityIndex(0);
        return;
      }
      setCurrentActivityIndex(prevIndex =>
        (prevIndex + 1) % recentActivities.length
      );
    }, 5000); // Change activity every 5 seconds
    return () => clearInterval(timer);
  }, [recentActivities]);

  const renderFounderStatsSkeleton = () => (
    <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-4 bg-white/20" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 space-y-2">
            <Skeleton className="h-6 w-1/2 bg-white/20" />
            <Skeleton className="h-3 w-3/4 bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderYourStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-16 rounded-xl" />
        <Skeleton className="flex-1 h-16 rounded-xl" />
      </div>
    </div>
  );

  const renderRecentActivitySkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <Skeleton className="h-5 w-1/2 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 1 }).map((_, i) => ( // Only one skeleton for rotating display
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getActivityIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-5 h-5 text-white" />;
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-white" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5 text-white" />;
      case 'Eye': return <Eye className="w-5 h-5 text-white" />;
      case '💰': return <span className="text-white text-sm">💰</span>;
      case '💡': return <span className="text-white text-sm">💡</span>;
      default: return <Bell className="w-5 h-5 text-white" />;
    }
  };

  // currentActivity is now safely accessed because recentActivities is guaranteed to be an array
  const currentActivity = recentActivities.length > 0
    ? recentActivities[currentActivityIndex]
    : null;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Your Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your startup</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="View notifications">
            <Bell className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {startupLoading || loading ? (
          <div className="space-y-6">
            {renderFounderStatsSkeleton()}
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            {renderYourStartupCardSkeleton()}
            {renderRecentActivitySkeleton()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Founder Stats Card */}
            <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Your Startup Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">{founderStartup?.active_chats || 0}</div>
                  <div className="text-xs opacity-80">Active Chats</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">{founderStartup?.room_members || 0}</div>
                  <div className="text-xs opacity-80">Room Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-2xl font-bold">{founderStartup?.interests || 0}</div>
                  <div className="text-xs opacity-80">Interested</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentScreen('manageStartup')}
                className="h-24 bg-white rounded-2xl border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-50 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 dark:bg-gray-800 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700"
                aria-label={founderStartup ? 'Update startup listing' : 'List your startup'}
              >
                <Plus className="w-6 h-6" />
                {founderStartup ? 'Update Listing' : 'List Startup'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('chats')}
                className="h-24 bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                aria-label="View chats"
              >
                <MessageCircle className="w-6 h-6" />
                View Chats
              </motion.button>
            </div>

            {/* Your Startup Card */}
            {founderStartup ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50">Your Startup</h3>
                  <button
                    onClick={() => setCurrentScreen('manageStartup', { startupId: founderStartup.id })}
                    className="text-purple-700 text-sm font-medium hover:underline dark:text-purple-400"
                    aria-label={`Edit ${founderStartup.name}`}
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                    {founderStartup.logo}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-50">{founderStartup.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{founderStartup.tagline}</p>
                    <p className={`text-xs font-medium mt-1 ${
                      founderStartup.status === 'Approved' ? 'text-green-600' :
                      founderStartup.status === 'Pending' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      Status: {founderStartup.status} {founderStartup.status === 'Approved' && <Check className="inline-block w-3 h-3" />}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{founderStartup.views || 0}</div> {/* Use actual views */}
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{founderStartup.amount_raised?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-gray-500">Amount Raised</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 dark:bg-gray-700">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{founderStartup.valuation?.toLocaleString() || 'N/A'}</div> {/* Display valuation */}
                    <div className="text-xs text-gray-500">Valuation</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center space-y-4 dark:bg-gray-800 dark:border-gray-700">
                <Rocket className="w-16 h-16 text-gray-400 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">No Startup Listed Yet</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">Get started by listing your amazing startup!</p>
                <button
                  onClick={() => setCurrentScreen('manageStartup')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all"
                  aria-label="List your startup now"
                >
                  List Your Startup Now
                </button>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  <AnimatePresence mode="wait">
                    {currentActivity && (
                      <motion.div
                        key={currentActivity.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-700"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-700 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs">
                          {getActivityIcon(currentActivity.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{currentActivity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(currentActivity.timestamp).toLocaleString()}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="text-center text-gray-500 py-4 dark:text-gray-400">No recent activity.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FounderDashboard;