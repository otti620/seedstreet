"use client";

import React from 'react';
import { ArrowLeft, Users, MessageCircle, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Startup, ScreenParams } from '@/types'; // Import types from the shared file

interface StartupRoomScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  selectedStartup: Startup;
}

const StartupRoomScreen: React.FC<StartupRoomScreenProps> = ({ setCurrentScreen, selectedStartup }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">{selectedStartup.name} Room</h2>
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
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-purple-700 shadow-xl">
            {selectedStartup.logo}
          </div>
          <h3 className="text-3xl font-bold mb-2">{selectedStartup.name}</h3>
          <p className="text-white/90 text-lg">
            Welcome to the exclusive room for {selectedStartup.name}!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Room Features</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-50">Connect with Members</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Engage with other interested parties.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
              <MessageCircle className="w-6 h-6 text-teal-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-50">Exclusive Updates</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get direct updates from the founder.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-50">Funding Discussions</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Participate in funding rounds.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
              <Info className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-50">Detailed Insights</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Access deeper startup information.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={() => setCurrentScreen('startupDetail', { startupId: selectedStartup.id })}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          aria-label="View Startup Details"
        >
          View Startup Details
        </Button>
      </div>
    </div>
  );
};

export default StartupRoomScreen;