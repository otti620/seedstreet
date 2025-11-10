"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  count?: number;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, count, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700 ${className}`}
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 text-gray-600 dark:text-gray-300">{icon}</div>
        <span className="font-medium text-gray-900 dark:text-gray-50">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold dark:bg-purple-900 dark:text-purple-300">
            {count}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
    </button>
  );
};

export default MenuItem;