"use client";

import React, { useState } from 'react';

interface OnboardingScreenProps {
  setCurrentScreen: (screen: string) => void;
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

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setCurrentScreen }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <button onClick={() => setCurrentScreen('auth')} className="absolute top-6 right-6 z-20 text-gray-500 text-sm font-medium">Skip</button>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-12">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full opacity-10 blur-3xl`} />
            <div className={`relative w-32 h-32 mx-auto bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl flex items-center justify-center shadow-2xl animate-float`}>
              <span className="text-6xl">{slides[currentSlide].emoji}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">{slides[currentSlide].description}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-center space-x-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`rounded-full transition-all ${i === currentSlide ? 'w-8 h-2 bg-gradient-to-r from-purple-700 to-teal-600' : 'w-2 h-2 bg-gray-300'}`} />
          ))}
        </div>
        
        <button onClick={() => currentSlide === slides.length - 1 ? setCurrentScreen('auth') : setCurrentSlide(currentSlide + 1)} className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all">
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;