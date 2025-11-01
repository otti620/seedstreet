"use client";

import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; // Import motion

interface RoleSelectorScreenProps {
  setCurrentScreen: (screen: string) => void;
  setUserRole: (role: string | null) => void;
  setActiveTab: (tab: string) => void;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>; // Add logActivity prop
}

const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({ setCurrentScreen, setUserRole, setActiveTab, logActivity }) => {
  const handleRoleSelection = async (role: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role, onboarding_complete: true })
        .eq('id', user.id);

      if (error) {
        toast.error("Failed to set user role: " + error.message);
        console.error("Error setting user role:", error);
      } else {
        setUserRole(role);
        setCurrentScreen('home');
        setActiveTab('home');
        toast.success(`Welcome, ${role}!`);
        logActivity('role_selected', `Selected role: ${role}`, user.id, role === 'investor' ? '💰' : '💡'); // Log activity
      }
    } else {
      toast.error("No active user session found.");
      setCurrentScreen('auth'); // Redirect to auth if no user
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-6 overflow-hidden dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-float dark:bg-purple-800" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-200 rounded-full filter blur-3xl opacity-30 animate-float-delay-2s dark:bg-teal-800" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-50">
            Welcome to Seedstreet, <span className="bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent">User</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Choose your path</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Investor Card */}
          <motion.button 
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelection('investor')}
            className="group relative bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 active:scale-95"
            aria-label="Select role: Investor"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative space-y-6">
              <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-5xl animate-float">
                💰
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">I want to invest</h3>
                <p className="text-white/80 text-sm">Back startups and watch your impact grow</p>
              </div>

              <div className="inline-block px-4 py-1.5 bg-teal-500/30 border border-teal-400/40 rounded-full text-teal-100 text-sm font-semibold">
                Join 650+ investors
              </div>
            </div>
          </motion.button>

          {/* Founder Card */}
          <motion.button 
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelection('founder')}
            className="group relative bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 active:scale-95"
            aria-label="Select role: Founder"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative space-y-6">
              <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-5xl animate-float-delay-1s">
                💡
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">I'm building something</h3>
                <p className="text-white/80 text-sm">Get funded by people who actually get it</p>
              </div>

              <div className="inline-block px-4 py-1.5 bg-purple-500/30 border border-purple-400/40 rounded-full text-purple-100 text-sm font-semibold">
                Join 89 founders
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectorScreen;