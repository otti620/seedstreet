"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingIndicatorProps {
  loading: boolean; // New prop
}

export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({ loading }) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-purple-700 to-teal-600"
        >
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};