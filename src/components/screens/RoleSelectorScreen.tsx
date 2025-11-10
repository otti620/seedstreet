"use client";

import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScreenParams, Profile } from '@/types'; // Import types from the shared file

interface RoleSelectorScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setActiveTab: (tab: string) => void;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>; // Updated to accept userId and return Profile | null
  investorCount: number;
  founderCount: number;
}

const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({ setCurrentScreen, setActiveTab, logActivity, fetchUserProfile, investorCount, founderCount }) => {
  const handleRoleSelection = async (role: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role, onboarding_complete: true, show_welcome_flyer: true })
        .eq('id', user.id);

      if (error) {
        toast.error("Failed to set user role: " + error.message);
        console.error("Error setting user role:", error);
      } else {
        toast.success(`Welcome, ${role}!`);
        logActivity('role_selected', `Selected role: ${role}`, user.id, role === 'investor' ? '💰' : '💡');
        await fetchUserProfile(user.id);
        setCurrentScreen('home');
        setActiveTab('home');
      }
    } else {
      toast.error("No active user session found.");
      setCurrentScreen('auth');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-6 overflow-hidden dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-float dark:bg-purple-800" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-200 rounded-full filter blur-3xl opacity-30 animate-float-delay-2s dark:bg-teal-800" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3 dark:text-gray-50">What's Your Role?</h1>
          <p className="text-gray-600 text-lg dark:text-gray-300">Choose how you'll engage with Seedstreet.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
            onClick={() => handleRoleSelection('investor')}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center space-y-3 cursor-pointer dark:bg-gray-800 dark:border-gray-700"
          >
            <span className="text-5xl">💰</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Investor</h2>
            <p className="text-gray-600 text-sm dark:text-gray-300">Discover and fund promising startups.</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">{investorCount} investors already here!</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
            onClick={() => handleRoleSelection('founder')}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center space-y-3 cursor-pointer dark:bg-gray-800 dark:border-gray-700"
          >
            <span className="text-5xl">💡</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Founder</h2>
            <p className="text-gray-600 text-sm dark:text-gray-300">List your startup and attract investors.</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">{founderCount} founders already here!</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectorScreen;