"use client";

import React from 'react';
import { AnimatePresence, motion } from '@/lib/framer-motion-elements'; // Import from the new re-export module

interface FramerMotionWrapperProps {
  currentScreen: string;
  screenVariants: {
    initial: { opacity: number; x: number };
    in: { opacity: number; x: number };
    out: { opacity: number; x: number };
  };
  children: React.ReactNode;
}

const FramerMotionWrapper: React.FC<FramerMotionWrapperProps> = ({
  currentScreen,
  screenVariants,
  children,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        variants={screenVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ type: "tween", duration: 0.2 }}
        className="fixed inset-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default FramerMotionWrapper;