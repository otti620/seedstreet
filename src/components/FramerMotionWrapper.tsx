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
  // Removed 'key' from interface as it's a special React prop
}

const FramerMotionWrapper: React.FC<FramerMotionWrapperProps> = ({ children, currentScreen, screenVariants }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentScreen} // This key is for AnimatePresence to track children, which is correct.
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