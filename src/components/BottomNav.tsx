"use client";

import React from 'react';
import { Home, Rocket, MessageCircle, Sparkles, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string | null; // Not directly used in this component, but kept for consistency if needed later
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userRole }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'startups', icon: Rocket, label: 'Startups' },
    { id: 'chats', icon: MessageCircle, label: 'Chats', badge: 2 },
    { id: 'community', icon: Sparkles, label: 'Community' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50 dark:bg-gray-900 dark:border-gray-800" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all ${
                    isActive 
                      ? 'text-purple-700 scale-110 dark:text-purple-400' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium transition-all ${
                isActive 
                  ? 'text-purple-700 font-semibold dark:text-purple-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-gradient-to-r from-purple-700 to-teal-600 rounded-full animate-pulse-dot" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;