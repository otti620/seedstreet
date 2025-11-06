"use client";

import React from 'react';
import { ArrowLeft, Users, MessageCircle, FileText, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartupRoomScreenProps {
  setCurrentScreen: (screen: string) => void;
  selectedStartup: {
    id: string;
    name: string;
    logo: string;
    founder_name: string;
    room_members: number;
    active_chats: number;
  };
}

const StartupRoomScreen: React.FC<StartupRoomScreenProps> = ({ setCurrentScreen, selectedStartup }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('startupDetail')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to startup details">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {selectedStartup.logo}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{selectedStartup.name} Room</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
        <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <Users className="w-20 h-20 mx-auto mb-4 animate-float" />
          <h3 className="text-3xl font-bold mb-2">Welcome to the {selectedStartup.name} Room!</h3>
          <p className="text-white/90 text-lg">
            This is a dedicated space for founders and investors to connect, share, and collaborate.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h4 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Room Features (Coming Soon)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700">
              <MessageCircle className="w-12 h-12 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Live Q&A Sessions</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Engage directly with the founder.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700">
              <FileText className="w-12 h-12 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Shared Documents</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Access pitch decks, financials, and more.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700">
              <Calendar className="w-12 h-12 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Event Schedule</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Stay updated on important dates.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700">
              <Info className="w-12 h-12 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Exclusive Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get the latest news directly from the team.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setCurrentScreen('startupDetail')} className="mt-6 bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label="Back to startup details">
          Back to Startup Details
        </Button>
      </div>
    </div>
  );
};

export default StartupRoomScreen;