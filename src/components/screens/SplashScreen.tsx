"use client";

import React from 'react';
import Image from 'next/image'; // Import Image from next/image
import { MadeWithDyad } from '../made-with-dyad';
import { cn } from '@/lib/utils'; // Import cn utility
import { motion } from 'framer-motion'; // Import motion

interface SplashScreenProps {
  // isFadingOut?: boolean; // Removed as it's no longer used
}

const SplashScreen: React.FC<SplashScreenProps> = ({ /* isFadingOut = false */ }) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-teal-500 flex items-center justify-center overflow-hidden"
      // Removed isFadingOut class logic
    )}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delay" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center animate-logoEntry">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-teal-400 blur-2xl opacity-50 animate-pulse" />
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center"
          >
            <svg viewBox="0 0 100 120" className="w-24 h-24">
              <defs>
                <linearGradient id="sGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6B21A8' }} />
                  <stop offset="100%" style={{ stopColor: '#14B8A6' }} />
                </linearGradient>
              </defs>
              <line x1="50" y1="10" x2="50" y2="25" stroke="url(#sGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              <line x1="50" y1="95" x2="50" y2="110" stroke="url(#sGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              <path d="M 70 35 C 70 25, 60 20, 50 20 C 40 20, 30 25, 30 35 C 30 45, 40 50, 50 55 C 60 60, 70 65, 70 75 C 70 85, 60 90, 50 90 C 40 90, 30 85, 30 75" fill="none" stroke="url(#sGradient)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
        <div className="text-white text-center space-y-2">
          <h1 className="text-3xl font-bold">Seedstreet</h1>
          <p className="text-white/80 text-sm">Where startups meet believers</p>
        </div>
        <div className="mt-8 flex space-x-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} className="w-2 h-2 bg-white/60 rounded-full" style={{ animation: `bounce 1s ease-in-out infinite ${delay}s` }} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default SplashScreen;