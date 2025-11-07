"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Import motion
import localforage from 'localforage'; // Import localforage

interface OnboardingScreenProps {
  setCurrentScreen: (screen: string) => void;
  onOnboardingComplete?: () => void; // Made optional
}

const slides = [
  {
    emoji: "🚀",
    title: "Back the next big thing",
    description: "Discover startups building the future. Put your money where your belief is.",
    gradient: "from-purple-600 to-purple-800"
  },
  {
    emoji: "💡",
    title: "Your hustle, funded",
    description: "List your startup, tell your story, get backed by real people who believe.",
    gradient: "from-teal-500 to-teal-700"
  },
  {
    emoji: "✨",
    title: "Community > everything",
    description: "Investors and founders winning together. No gatekeepers. Just vibes.",
    gradient: "from-purple-600 to-teal-500"
  }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setCurrentScreen, onOnboardingComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGetStarted = async () => {
    await localforage.setItem('hasSeenOnboarding', true); // Mark as seen locally
    onOnboardingComplete?.(); // Call the prop handler (updates profile if logged in)
    setCurrentScreen('auth'); // Navigate to auth screen
  };

  return (
    <div className="bg-gray-50 flex flex-col w-full h-full dark:bg-gray-950">
      <button onClick={handleGetStarted} className="absolute top-6 right-6 z-20 text-gray-500 text-sm font-medium dark:text-gray-400" aria-label="Skip onboarding">Skip</button>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-12">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full opacity-10 blur-3xl`} />
            <motion.div
              key={currentSlide}
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`relative w-32 h-32 mx-auto bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl flex items-center justify-center shadow-2xl animate-float`}
            >
              <span className="text-6xl">{slides[currentSlide].emoji}</span>
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">{slides[currentSlide].description}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-center space-x-2">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)} 
              className={`rounded-full transition-all ${i === currentSlide ? 'w-8 h-2 bg-gradient-to-r from-purple-700 to-teal-600' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'}`} 
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        
        <button 
          onClick={() => {
            if (currentSlide === slides.length - 1) {
              handleGetStarted();
            } else {
              setCurrentSlide(currentSlide + 1);
            }
          }} 
          className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all"
          aria-label={currentSlide === slides.length - 1 ? "Get Started" : "Next slide"}
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;