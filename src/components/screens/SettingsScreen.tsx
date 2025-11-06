"use client";

import React from 'react';
import { ArrowLeft, Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle'; // Import ThemeToggle
import MenuItem from '../MenuItem'; // Import MenuItem
import { Lock } from 'lucide-react'; // Import Lock icon

interface SettingsScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Settings</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
            <Palette className="w-5 h-5 text-purple-700 dark:text-purple-400" /> Theme
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-200">Choose your preferred theme:</p>
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-0 p-5 flex items-center gap-2 dark:text-gray-50">
            <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Account Security
          </h3>
          <MenuItem icon={<Lock />} label="Change Password" onClick={() => setCurrentScreen('authAction', { authActionType: 'changePassword' })} />
        </div>

        {/* Future settings can go here */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Other Settings</h3>
          <p className="text-gray-600 dark:text-gray-300">More settings coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;