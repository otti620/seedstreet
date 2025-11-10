"use client";

import React from 'react';
import { ArrowLeft, Shirt, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface MerchStoreScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const MerchStoreScreen: React.FC<MerchStoreScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Merch Store</h2>
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
          <ShoppingBag className="w-20 h-20 mx-auto mb-4 animate-float" />
          <h3 className="text-3xl font-bold mb-2">Seedstreet Swag!</h3>
          <p className="text-white/90 text-lg">
            Show your support for the startup ecosystem with exclusive Seedstreet merchandise.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Featured Items</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Merch Item 1 */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
            >
              <Shirt className="w-16 h-16 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Seedstreet T-Shirt</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Premium cotton, unisex fit.</p>
              <span className="text-lg font-bold text-purple-700 mt-2 dark:text-purple-400">$25.00</span>
              <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label="Add Seedstreet T-Shirt to cart">
                Add to Cart
              </Button>
            </motion.div>
            {/* Merch Item 2 */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
            >
              <Star className="w-16 h-16 text-yellow-500 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-gray-50">Founder's Mug</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">For those late-night coding sessions.</p>
              <span className="text-lg font-bold text-purple-700 mt-2 dark:text-purple-400">$18.00</span>
              <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label="Add Founder's Mug to cart">
                Add to Cart
              </Button>
            </motion.div>
          </div>
          <p className="text-sm text-gray-500 mt-6 dark:text-gray-400">
            More awesome merch coming soon! Stay tuned.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MerchStoreScreen;