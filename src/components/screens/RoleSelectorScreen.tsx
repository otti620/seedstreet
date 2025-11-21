"use client";

    import React, { useState, useEffect } from 'react';
    import { ArrowLeft, Rocket, Users } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { supabase } from '@/integrations/supabase/client';
    import { toast } from 'sonner';
    import { Profile, ScreenParams } from '@/types'; // Assuming Profile and ScreenParams are imported

    interface RoleSelectorScreenProps {
      setCurrentScreen: (screen: string, params?: ScreenParams) => void;
      setActiveTab: (tab: string) => void;
      logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
      fetchUserProfile: (userId: string) => Promise<Profile | null>;
      investorCount: number; // Prop for dynamic investor count
      founderCount: number;  // Prop for dynamic founder count
    }

    const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({
      setCurrentScreen,
      setActiveTab,
      logActivity,
      fetchUserProfile,
      investorCount, // Destructure the prop
      founderCount,  // Destructure the prop
    }) => {
      const [selectedRole, setSelectedRole] = useState<'investor' | 'founder' | null>(null);
      const [loading, setLoading] = useState(false);

      const handleRoleSelection = async () => {
        if (!selectedRole) {
          toast.error("Please select a role to continue.");
          return;
        }

        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error("Authentication error. Please log in again.");
          setCurrentScreen('auth');
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: selectedRole })
          .eq('id', user.id);

        if (updateError) {
          toast.error("Failed to update role: " + updateError.message);
          console.error("Role update error:", updateError);
        } else {
          toast.success(`Role set as ${selectedRole}!`);
          logActivity('role_selected', `Selected role: ${selectedRole}`, user.id, selectedRole === 'investor' ? 'DollarSign' : 'Rocket');
          // Re-fetch user profile to ensure the role is updated in state
          await fetchUserProfile(user.id);
          setActiveTab('home');
          setCurrentScreen('home');
        }
        setLoading(false);
      };

      return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-teal-500 flex flex-col items-center justify-center p-6 text-white dark:from-purple-800 dark:to-teal-700">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold mb-3">Choose Your Path</h1>
            <p className="text-lg opacity-90">Are you here to invest or to launch?</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
              className={`flex-1 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 ${
                selectedRole === 'investor'
                  ? 'bg-white text-purple-700 scale-105 ring-4 ring-purple-300 dark:bg-gray-900 dark:text-purple-400 dark:ring-purple-600'
                  : 'bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedRole('investor')}
            >
              <div className="flex flex-col items-center">
                <Users className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Investor</h2>
                <p className="text-center opacity-80">Discover and fund the next big thing.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
              className={`flex-1 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 ${
                selectedRole === 'founder'
                  ? 'bg-white text-teal-600 scale-105 ring-4 ring-teal-300 dark:bg-gray-900 dark:text-teal-400 dark:ring-teal-600'
                  : 'bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedRole('founder')}
            >
              <div className="flex flex-col items-center">
                <Rocket className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Founder</h2>
                <p className="text-center opacity-80">Launch your vision and secure funding.</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
            className="w-full max-w-md mt-8"
          >
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || loading}
              className="w-full h-14 bg-white text-purple-700 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-gray-100 active:scale-95 transition-all dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-purple-700 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Continue'
              )}
            </Button>
            <p className="text-center mt-4 text-sm opacity-80">
              Join a thriving community of <span className="font-bold text-white">{investorCount}</span> investors and <span className="font-bold text-white">{founderCount}</span> founders already here!
            </p>
          </motion.div>
        </div>
      );
    };

    export default RoleSelectorScreen;