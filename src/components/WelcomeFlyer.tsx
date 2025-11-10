"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Profile } from '@/types'; // Import Profile from shared types

interface WelcomeFlyerProps {
  userName: string;
  onDismiss: () => void;
}

const WelcomeFlyer: React.FC<WelcomeFlyerProps> = ({ userName, onDismiss }) => {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-purple-700 to-teal-600 text-white shadow-lg rounded-t-2xl"
    >
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-xl font-bold">Welcome, {userName}! 👋</h2>
        <Button variant="ghost" size="icon" onClick={onDismiss} className="text-white hover:bg-white/20" aria-label="Dismiss welcome message">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-sm mb-4">
        We're thrilled to have you on Seedstreet. Explore startups, connect with founders, or list your own venture!
      </p>
      <Button onClick={onDismiss} className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold" aria-label="Get started">
        Get Started
      </Button>
    </motion.div>
  );
};

export default WelcomeFlyer;