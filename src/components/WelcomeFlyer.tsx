"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeFlyerProps {
  userName: string;
  onDismiss: () => void;
}

const WelcomeFlyer: React.FC<WelcomeFlyerProps> = ({ userName, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4 border-2 border-white/30"
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss welcome message"
      >
        <X className="w-5 h-5" />
      </button>
      <Sparkles className="w-12 h-12 text-yellow-300 animate-bounce" />
      <h2 className="text-2xl font-bold">Welcome, {userName}!</h2>
      <p className="text-white/90 leading-relaxed">
        We're thrilled to have you on Seedstreet. Explore startups, connect with founders, and make an impact!
      </p>
      <Button
        onClick={onDismiss}
        className="w-full bg-white text-purple-700 rounded-xl font-semibold hover:bg-gray-100 active:scale-95 transition-all shadow-md"
        aria-label="Start exploring"
      >
        Start Exploring
      </Button>
    </motion.div>
  );
};

export default WelcomeFlyer;