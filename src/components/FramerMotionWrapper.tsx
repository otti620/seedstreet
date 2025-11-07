"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FramerMotionWrapperProps {
  children: React.ReactNode;
  currentScreen: string;
  screenVariants: {
    initial: { opacity: number; x: number };
    in: { opacity: number; x: number };
    out: { opacity: number; x: number };
  };
  key: string; // Add key prop to satisfy React's list rendering requirements if used in a list, or for AnimatePresence
}

const FramerMotionWrapper: React.FC<FramerMotionWrapperProps> = ({ children, currentScreen, screenVariants, key }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentScreen} // Use currentScreen as the key for motion.div to trigger exit/enter animations
        initial="initial"
        animate="in"
        exit="out"
        variants={screenVariants}
        transition={{ type: 'tween', duration: 0.3 }}
        className="w-full h-full absolute top-0 left-0" // Ensure it covers the full area
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default FramerMotionWrapper;