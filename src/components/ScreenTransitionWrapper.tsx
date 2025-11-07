"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenTransitionWrapperProps {
  children: React.ReactNode;
  currentScreen: string;
  screenVariants: {
    initial: { opacity: number; x: number };
    in: { opacity: number; x: number };
    out: { opacity: number; x: number };
  };
}

const ScreenTransitionWrapper: React.FC<ScreenTransitionWrapperProps> = ({ children, currentScreen, screenVariants }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentScreen}
        initial="initial"
        animate="in"
        exit="out"
        variants={screenVariants}
        transition={{ type: 'tween', duration: 0.3 }}
        className="w-full h-full absolute top-0 left-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenTransitionWrapper;