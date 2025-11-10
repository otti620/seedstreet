"use client";

import React from 'react';
import { ArrowLeft, Crown, Sparkles, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface UpgradeToProScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const UpgradeToProScreen: React.FC<UpgradeToProScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-teal-50 flex flex-col dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Upgrade to Pro</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-8 text-white shadow-lg"
        >
          <Crown className="w-20 h-20 mx-auto mb-4 animate-pulse" />
          <h3 className="text-3xl font-bold mb-2">Unlock Pro Features!</h3>
          <p className="text-white/90 text-lg">
            Take your Seedstreet experience to the next level.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Why Go Pro?</h4>
          <ul className="text-left space-y-3 text-gray-700 dark:text-gray-200">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>List multiple startups (Founders)</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Advanced analytics & insights</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Exclusive investor matching (Investors)</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span>Ad-free experience</span>
            </li>
          </ul>
          <Button
            onClick={() => alert("Simulating upgrade to Pro!")} // Placeholder for actual upgrade logic
            className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            aria-label="Upgrade to Pro now"
          >
            <DollarSign className="w-5 h-5 mr-2" /> Upgrade to Pro Now
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradeToProScreen;