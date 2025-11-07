"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, count, onClick }) => (
  <button 
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className="text-gray-600 dark:text-gray-300">{icon}</div>
      <span className="text-gray-900 font-medium dark:text-gray-50">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold dark:bg-purple-900 dark:text-purple-300">
          {count}
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </div>
  </button>
);

export default MenuItem;