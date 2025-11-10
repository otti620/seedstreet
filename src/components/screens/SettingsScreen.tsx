"use client";

import React from 'react';
import { ArrowLeft, User, Bell, MessageCircle, ShieldCheck, HelpCircle, FileText, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItem from '../MenuItem';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface SettingsScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setCurrentScreen }) => {
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.success("Logged out successfully!");
      setCurrentScreen('auth');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Settings</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 p-4 border-b border-gray-100 dark:text-gray-50 dark:border-gray-700">Account</h3>
          <MenuItem icon={<User />} label="Edit Profile" onClick={() => setCurrentScreen('editProfile')} />
          <MenuItem icon={<Bell />} label="Notification Preferences" onClick={() => setCurrentScreen('notifications')} />
          <MenuItem icon={<ShieldCheck />} label="Security & Privacy" onClick={() => setCurrentScreen('termsAndPrivacy')} />
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 p-4 border-b border-gray-100 dark:text-gray-50 dark:border-gray-700">App Preferences</h3>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-blue-500" />}
              {theme === 'system' && <Monitor className="w-5 h-5 text-gray-500" />}
              <span className="font-medium text-gray-900 dark:text-gray-50">Theme</span>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>Dark</Button>
              <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-purple-700 text-white hover:bg-purple-800' : 'dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'}>System</Button>
            </div>
          </div>
          <MenuItem icon={<MessageCircle />} label="Help & Support" onClick={() => setCurrentScreen('helpAndSupport')} />
          <MenuItem icon={<FileText />} label="Terms & Privacy" onClick={() => setCurrentScreen('termsAndPrivacy')} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;