"use client";

import React from 'react';
import { Plus, MessageCircle } from 'lucide-react';

interface FounderDashboardProps {
  setActiveTab: (tab: string) => void;
}

const FounderDashboard: React.FC<FounderDashboardProps> = ({ setActiveTab }) => {
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
            {/* Bell icon placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell w-5 h-5 text-purple-700"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
        </div>
      </div>

      {/* Search & Filter (placeholder for consistency, might be different for founder) */}
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            {/* Search icon placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Search your dashboard..." className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
          </div>
          <button className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            {/* Filter icon placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter w-5 h-5 text-gray-600"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div className="space-y-6">
          {/* Founder Stats Card */}
          <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Your Startup Performance</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs opacity-80">Active Chats</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs opacity-80">Room Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs opacity-80">Interested</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="h-24 bg-white rounded-2xl border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-50 active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
              <Plus className="w-6 h-6" />
              List Startup
            </button>
            <button onClick={() => setActiveTab('chats')} className="h-24 bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6" />
              View Chats
            </button>
          </div>

          {/* Your Startup Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Your Startup</h3>
              <button className="text-purple-700 text-sm font-medium">Edit</button>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                🌱
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">GreenTech Africa</h4>
                <p className="text-sm text-gray-600">Solar-powered solutions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-semibold text-gray-900">1,245</div>
                <div className="text-xs text-gray-500">Total Views</div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-semibold text-gray-900">34</div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
            </div>
          </div>

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
      </div>
    </>
  );
};

export default FounderDashboard;