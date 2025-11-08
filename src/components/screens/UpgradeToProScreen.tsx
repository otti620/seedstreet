"use client";

import React from 'react';
import { ArrowLeft, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface UpgradeToProScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const UpgradeToProScreen: React.FC<UpgradeToProScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-teal-500 flex items-center justify-center p-6 text-white overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delay" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="space-y-4"
        >
          <Crown className="w-24 h-24 mx-auto text-yellow-300 animate-bounce" />
          <h1 className="text-4xl font-bold">Unlock Pro Features!</h1>
          <p className="text-white/90 text-xl leading-relaxed">
            You've reached the limit for free listings. Upgrade to a Pro account to list more startups and access exclusive benefits.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 10 }}
          className="space-y-4"
        >
          <Button
            onClick={() => alert("Simulating upgrade to Pro!")} // Placeholder for actual upgrade logic
            className="w-full px-8 py-4 bg-yellow-400 text-purple-900 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            aria-label="Upgrade to Pro"
          >
            <Sparkles className="w-6 h-6" /> Upgrade to Pro Now
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentScreen('home')}
            className="w-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="No thanks, go back"
          >
            No thanks, maybe later
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradeToProScreen;