"use client";

import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Bell, Rocket, Check } from 'lucide-react';
import BottomNav from '../../BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface FounderDashboardProps {
  setActiveTab: (tab: string) => void;
  setCurrentScreen: (screen: string, params?: { startupId?: string }) => void; // Added params for startupId
  userProfileId: string;
  loading: boolean; // Prop for loading state
}

const FounderDashboard: React.FC<FounderDashboardProps> = ({
  setActiveTab,
  setCurrentScreen,
  userProfileId,
  loading,
}) => {
  const [founderStartup, setFounderStartup] = useState<Startup | null>(null);
  const [startupLoading, setStartupLoading] = useState(true);

  useEffect(() => {
    const fetchFounderStartup = async () => {
      setStartupLoading(true);
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .eq('founder_id', userProfileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching founder's startup:", error);
        toast.error("Failed to load your startup data.");
        setFounderStartup(null);
      } else if (data) {
        setFounderStartup(data as Startup);
      } else {
        setFounderStartup(null);
      }
      setStartupLoading(false);
    };

    if (userProfileId) {
      fetchFounderStartup();
    }
  }, [userProfileId]);

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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <Skeleton className="h-5 w-1/2 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your startup</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-700" />
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
              <button
                onClick={() => setCurrentScreen('manageStartup')}
                className="h-24 bg-white rounded-2xl border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-50 active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                {founderStartup ? 'Update Listing' : 'List Startup'}
              </button>
              <button onClick={() => setActiveTab('chats')} className="h-24 bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
                <MessageCircle className="w-6 h-6" />
                View Chats
              </button>
            </div>

            {/* Your Startup Card */}
            {founderStartup ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Your Startup</h3>
                  <button
                    onClick={() => setCurrentScreen('manageStartup', { startupId: founderStartup.id })}
                    className="text-purple-700 text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                    {founderStartup.logo}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{founderStartup.name}</h4>
                    <p className="text-sm text-gray-600">{founderStartup.tagline}</p>
                    <p className={`text-xs font-medium mt-1 ${
                      founderStartup.status === 'Approved' ? 'text-green-600' :
                      founderStartup.status === 'Pending' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      Status: {founderStartup.status} {founderStartup.status === 'Approved' && <Check className="inline-block w-3 h-3" />}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="text-sm font-semibold text-gray-900">1,245</div> {/* Mock data for views */}
                    <div className="text-xs text-gray-500">Total Views</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="text-sm font-semibold text-gray-900">34</div> {/* Mock data for views this week */}
                    <div className="text-xs text-gray-500">This Week</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center space-y-4">
                <Rocket className="w-16 h-16 text-gray-400 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">No Startup Listed Yet</h3>
                <p className="text-gray-600 text-sm">Get started by listing your amazing startup!</p>
                <button
                  onClick={() => setCurrentScreen('manageStartup')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all"
                >
                  List Your Startup Now
                </button>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center text-white text-xs">JO</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Jane started a chat</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs">DA</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">David joined your room</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FounderDashboard;