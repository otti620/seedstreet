"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/hooks/use-app-data'; // Import useAppData
import { supabase } from '@/integrations/supabase/client'; // Import supabase for userId

export const GlobalLoadingIndicator: React.FC = () => {
  // We need a dummy userId and isLoggedIn for useAppData to function in layout
  // In a real app, this might be handled by a global context or a more direct state.
  // For now, we'll use a placeholder and rely on the hook's internal logic.
  const { loadingData } = useAppData({
    userId: supabase.auth.currentUser?.id || null,
    isLoggedIn: !!supabase.auth.currentUser, // Check if user is logged in
    selectedChatId: null, // Not relevant for global loading
  });

  return (
    <AnimatePresence>
      {loadingData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-purple-700 to-teal-600"
        >
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};