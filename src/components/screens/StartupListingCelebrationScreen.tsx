"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface StartupListingCelebrationScreenProps {
  startupName: string;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const StartupListingCelebrationScreen: React.FC<StartupListingCelebrationScreenProps> = ({
  startupName,
  setCurrentScreen,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const celebrationTimer = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(celebrationTimer);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-teal-500 flex items-center justify-center overflow-hidden p-6">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delay" />
      </div>

      <div className="relative z-10 text-white text-center space-y-8">
        {!showCelebration ? (
          <div className="space-y-4">
            <p className="text-xl font-medium">Get ready!</p>
            <motion.h1
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="text-7xl font-extrabold animate-bounce"
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.h1>
            <p className="text-lg font-semibold">Your startup is about to go live!</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="relative w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-logoEntry">
              <Sparkles className="w-20 h-20 text-yellow-400 animate-pulse-dot" />
              <CheckCircle className="absolute bottom-0 right-0 w-10 h-10 text-green-500 bg-white rounded-full" />
            </div>
            <h2 className="text-4xl font-bold">Congratulations!</h2>
            <p className="text-white/90 text-xl leading-relaxed">
              <span className="font-bold text-yellow-300">{startupName}</span> has been successfully listed!
              <br />
              The market is now open for your innovation.
            </p>
            <Button
              onClick={() => setCurrentScreen('home')}
              className="mt-8 px-8 py-4 bg-white text-purple-700 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              aria-label="View dashboard"
            >
              View Dashboard
            </Button>
          </motion.div>
        )}
      </div>

      {/* Simple balloon visuals */}
      {showCelebration && (
        <>
          <div className="absolute top-10 left-10 w-12 h-16 bg-red-400 rounded-full rounded-bl-none animate-float-delay-1s opacity-70" />
          <div className="absolute bottom-20 right-10 w-10 h-14 bg-blue-400 rounded-full rounded-br-none animate-float opacity-70" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-18 bg-yellow-400 rounded-full rounded-tl-none animate-float-delay-2s opacity-70" />
        </>
      )}
    </div>
  );
};

export default StartupListingCelebrationScreen;