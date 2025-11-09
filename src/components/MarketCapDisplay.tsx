"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Import the specific type

interface MarketCapDisplayProps {
  // No props needed for now, it fetches its own data
}

const MarketCapDisplay: React.FC<MarketCapDisplayProps> = () => {
  const [totalMarketCap, setTotalMarketCap] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketCap = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-market-cap', {
        body: {}, // No specific body needed for this function
      });

      if (error) {
        console.error("Error invoking calculate-market-cap function:", error);
        toast.error("Failed to fetch market cap: " + error.message);
        setTotalMarketCap(null);
      } else if (data && typeof data.totalMarketCap === 'number') {
        setTotalMarketCap(data.totalMarketCap);
      } else {
        setTotalMarketCap(0); // Default to 0 if no data or invalid format
      }
    } catch (invokeError: any) {
      console.error("Unexpected error during market cap invocation:", invokeError);
      toast.error("An unexpected error occurred while fetching market cap.");
      setTotalMarketCap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketCap();

    // Set up real-time subscription for startups to update market cap
    const channel = supabase
      .channel('market_cap_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, (payload: RealtimePostgresChangesPayload<any>) => { // Apply the type here
        // Re-fetch market cap on any change to the startups table
        // This ensures updates to valuation or new approved startups trigger a refresh
        console.log('Realtime startup change detected for market cap:', payload);
        fetchMarketCap();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMarketCap]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 animate-pulse dark:bg-gray-800 dark:border-gray-700 mt-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 mt-4 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700"
    >
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 dark:bg-purple-900 dark:text-purple-300">
        <TrendingUp className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Total Market Cap Today</p>
        <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
          {totalMarketCap !== null ? `$${totalMarketCap.toLocaleString()}` : 'N/A'}
        </p>
      </div>
    </motion.div>
  );
};

export default MarketCapDisplay;