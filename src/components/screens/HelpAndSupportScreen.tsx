"use client";

import React from 'react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

interface HelpAndSupportScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const HelpAndSupportScreen: React.FC<HelpAndSupportScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1">Help & Support</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need a Hand?</h3>
          <p className="text-gray-700 mb-6">
            We're here to help! Reach out to us through the following channels:
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
              <Mail className="w-6 h-6 text-purple-700" />
              <a href="mailto:ottigospel@gmail.com" className="text-purple-700 font-medium text-lg underline">
                ottigospel@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-teal-50 rounded-xl">
              <Phone className="w-6 h-6 text-teal-700" />
              <a href="tel:+2347077599057" className="text-teal-700 font-medium text-lg underline">
                +2347077599057
              </a>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Our support team is available to assist you.
        </p>
      </div>
    </div>
  );
};

export default HelpAndSupportScreen;