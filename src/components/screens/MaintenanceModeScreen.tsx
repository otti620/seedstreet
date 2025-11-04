"use client";

import React from 'react';
import { Wrench, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenanceModeScreenProps {
  message?: string;
}

const MaintenanceModeScreen: React.FC<MaintenanceModeScreenProps> = ({
  message = "We are currently performing scheduled maintenance. We will be back shortly!",
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center p-6 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 0.2, rotate: 0 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-700 rounded-full filter blur-3xl"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: 30 }}
          animate={{ scale: 1, opacity: 0.2, rotate: 0 }}
          transition={{ duration: 7, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gray-600 rounded-full filter blur-3xl"
        />
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-md">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="flex flex-col items-center justify-center"
        >
          <Wrench className="w-24 h-24 text-yellow-400 mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
        </motion.div>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
          className="text-lg text-gray-300 leading-relaxed"
        >
          {message}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-gray-400 text-sm"
        >
          <Clock className="w-4 h-4" />
          <span>We appreciate your patience.</span>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceModeScreen;