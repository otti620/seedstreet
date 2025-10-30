"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Flag, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FlaggedMessage {
  id: string;
  message_id: string;
  original_message_id: string | null; // For community posts, this would be the post ID
  chat_id: string; // Could be chat ID or 'community'
  sender: string;
  sender_id: string | null;
  chat_type: 'DM' | 'Community';
  startup_name: string | null;
  reason: string;
  timestamp: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  reported_by: string;
}

interface AdminDashboardScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ setCurrentScreen }) => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlaggedItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flagged_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      toast.error("Failed to load flagged items: " + error.message);
      console.error("Error fetching flagged items:", error);
      setFlaggedItems([]);
    } else if (data) {
      setFlaggedItems(data as FlaggedMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlaggedItems();

    // Realtime subscription for flagged items
    const channel = supabase
      .channel('public:flagged_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flagged_messages' }, payload => {
        fetchFlaggedItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (itemId: string, newStatus: 'Resolved' | 'Dismissed') => {
    const { error } = await supabase
      .from('flagged_messages')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
      console.error("Error updating status:", error);
    } else {
      toast.success(`Item status updated to ${newStatus}!`);
      fetchFlaggedItems(); // Re-fetch to update UI
    }
  };

  const getItemIcon = (chatType: 'DM' | 'Community') => {
    if (chatType === 'DM') {
      return <MessageCircle className="w-5 h-5 text-blue-600" />;
    } else if (chatType === 'Community') {
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
    return <Flag className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1">Admin Dashboard</h2>
        </div>
      </div>

      {/* Flagged Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {flaggedItems.length > 0 ? (
          flaggedItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col gap-2 p-4 rounded-xl shadow-sm border ${
                item.status === 'Pending' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getItemIcon(item.chat_type)}
                  <span className="font-semibold text-gray-900">
                    {item.chat_type === 'DM' ? 'Message' : 'Post'} from {item.sender}
                  </span>
                </div>
                <Badge
                  className={`${
                    item.status === 'Pending' ? 'bg-red-500' :
                    item.status === 'Resolved' ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Reason:</span> {item.reason}
              </p>
              <p className="text-xs text-gray-500">
                Reported by: {item.reported_by} at {new Date(item.timestamp).toLocaleString()}
              </p>
              <div className="flex gap-2 mt-2">
                {item.status === 'Pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                      className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, 'Dismissed')}
                      className="h-8 text-xs text-gray-700 border-gray-200 hover:bg-gray-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Dismiss
                    </Button>
                  </>
                )}
                {/* Optionally add a button to view original content */}
                {/* <Button variant="ghost" size="sm" className="h-8 text-xs">View Original</Button> */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
              ✅
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No flagged items</h3>
            <p className="text-gray-600 mb-6">All clear here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;