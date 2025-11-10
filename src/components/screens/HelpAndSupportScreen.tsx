"use client";

import React from 'react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface HelpAndSupportScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const HelpAndSupportScreen: React.FC<HelpAndSupportScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Help & Support</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Need a Hand?</h3>
          <p className="text-gray-700 mb-6 dark:text-gray-200">
            We're here to help! Reach out to us through the following channels:
          </p>
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl dark:bg-purple-950 border border-purple-100 dark:border-purple-900 cursor-pointer"
            >
              <Mail className="w-6 h-6 text-purple-700 dark:text-purple-400" />
              <a href="mailto:ottigospel@gmail.com" className="text-purple-700 font-medium text-lg underline dark:text-purple-400">
                ottigospel@gmail.com
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 p-4 bg-teal-50 rounded-xl dark:bg-teal-950 border border-teal-100 dark:border-teal-900 cursor-pointer"
            >
              <Phone className="w-6 h-6 text-teal-700 dark:text-teal-400" />
              <a href="tel:+2347077599057" className="text-teal-700 font-medium text-lg underline dark:text-teal-400">
                +2347077599057
              </a>
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-sm text-gray-500 mt-8 dark:text-gray-400"
        >
          Our support team is available to assist you.
        </motion.p>
      </div>
    </div>
  );
};

export default HelpAndSupportScreen;