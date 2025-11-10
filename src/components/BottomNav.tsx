"use client";

import React from 'react';
import { Home, Rocket, MessageCircle, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile } from '@/types'; // Import Profile from shared types

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userRole }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'startups', icon: Rocket, label: 'Startups', showForRole: 'investor' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40 dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="flex justify-around h-16 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          // If item has showForRole, only render if userRole matches or is admin
          if (item.showForRole && userRole !== item.showForRole && userRole !== 'admin') {
            return null;
          }

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full text-sm font-medium transition-colors relative ${
                isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 h-0.5 w-full bg-gradient-to-r from-purple-700 to-teal-600 rounded-b-full"
                />
              )}
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;