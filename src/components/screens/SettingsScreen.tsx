"use client";

import React from 'react';
import { ArrowLeft, Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle'; // Import ThemeToggle

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

        {/* Future settings can go here */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Account</h3>
          <p className="text-gray-600 dark:text-gray-300">Account settings coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;