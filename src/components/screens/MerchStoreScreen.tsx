"use client";

import React from 'react';
import { ArrowLeft, Shirt, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MerchStoreScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const MerchStoreScreen: React.FC<MerchStoreScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1">Merch Store</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
        <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <ShoppingBag className="w-20 h-20 mx-auto mb-4 animate-float" />
          <h3 className="text-3xl font-bold mb-2">Seedstreet Swag!</h3>
          <p className="text-white/90 text-lg">
            Show your support for the startup ecosystem with exclusive Seedstreet merchandise.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Featured Items</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Merch Item 1 */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center">
              <Shirt className="w-16 h-16 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Seedstreet T-Shirt</p>
              <p className="text-sm text-gray-600">Premium cotton, unisex fit.</p>
              <span className="text-lg font-bold text-purple-700 mt-2">$25.00</span>
              <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white">
                Add to Cart
              </Button>
            </div>
            {/* Merch Item 2 */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center">
              <Star className="w-16 h-16 text-yellow-500 mb-2" />
              <p className="font-semibold text-gray-900">Founder's Mug</p>
              <p className="text-sm text-gray-600">For those late-night coding sessions.</p>
              <span className="text-lg font-bold text-purple-700 mt-2">$18.00</span>
              <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white">
                Add to Cart
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            More awesome merch coming soon! Stay tuned.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MerchStoreScreen;