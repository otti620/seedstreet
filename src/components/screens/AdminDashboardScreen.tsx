"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Flag, MessageCircle, Sparkles, Rocket } from 'lucide-react'; // Import Rocket icon
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

interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  category: string;
  founder_name: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  founder_id: string; // Added founder_id to Startup interface
}

interface AdminDashboardScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ setCurrentScreen }) => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedMessage[]>([]);
  const [pendingStartups, setPendingStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    // Fetch flagged items
    const { data: flaggedData, error: flaggedError } = await supabase
      .from('flagged_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (flaggedError) {
      toast.error("Failed to load flagged items: " + flaggedError.message);
      console.error("Error fetching flagged items:", flaggedError);
      setFlaggedItems([]);
    } else if (flaggedData) {
      setFlaggedItems(flaggedData as FlaggedMessage[]);
    }

    // Fetch pending startups
    const { data: startupData, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (startupError) {
      toast.error("Failed to load pending startups: " + startupError.message);
      console.error("Error fetching pending startups:", startupError);
      setPendingStartups([]);
    } else if (startupData) {
      setPendingStartups(startupData as Startup[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();

    // Realtime subscription for flagged items
    const flaggedChannel = supabase
      .channel('public:flagged_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flagged_messages' }, payload => {
        fetchAdminData();
      })
      .subscribe();

    // Realtime subscription for startups (specifically for status changes)
    const startupChannel = supabase
      .channel('public:startups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'startups' }, payload => {
        fetchAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(flaggedChannel);
      supabase.removeChannel(startupChannel);
    };
  }, []);

  const handleUpdateFlaggedStatus = async (itemId: string, newStatus: 'Resolved' | 'Dismissed') => {
    const { error } = await supabase
      .from('flagged_messages')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
      console.error("Error updating status:", error);
    } else {
      toast.success(`Item status updated to ${newStatus}!`);
      fetchAdminData(); // Re-fetch to update UI
    }
  };

  const handleUpdateStartupStatus = async (startupId: string, newStatus: 'Approved' | 'Rejected') => {
    // First, get the startup details to send a notification
    const { data: startupToUpdate, error: fetchError } = await supabase
      .from('startups')
      .select('name, founder_id')
      .eq('id', startupId)
      .single();

    if (fetchError || !startupToUpdate) {
      toast.error("Failed to fetch startup details for notification: " + (fetchError?.message || "Unknown error"));
      console.error("Error fetching startup for notification:", fetchError);
      return;
    }

    const { error } = await supabase
      .from('startups')
      .update({ status: newStatus })
      .eq('id', startupId);

    if (error) {
      toast.error(`Failed to update startup status: ${error.message}`);
      console.error("Error updating startup status:", error);
    } else {
      toast.success(`Startup ${newStatus.toLowerCase()}!`);
      fetchAdminData(); // Re-fetch to update UI

      // Send notification to the founder
      await supabase.from('notifications').insert({
        user_id: startupToUpdate.founder_id,
        type: `startup_${newStatus.toLowerCase()}`,
        message: `Your startup "${startupToUpdate.name}" has been ${newStatus.toLowerCase()}!`,
        link: `/startup/${startupId}`,
        related_entity_id: startupId,
      });
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
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50"><Skeleton className="h-6 w-40" /></h3>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={`startup-skel-${i}`} className="h-24 w-full rounded-xl" />
          ))}
          <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6 dark:text-gray-50"><Skeleton className="h-6 w-40" /></h3>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`flagged-skel-${i}`} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Admin Dashboard</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pending Startups Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">Pending Startups ({pendingStartups.length})</h3>
          {pendingStartups.length > 0 ? (
            pendingStartups.map((startup) => (
              <div key={startup.id} className="flex flex-col gap-2 p-4 rounded-xl shadow-sm border bg-white border-gray-100 mb-3 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-gray-50">{startup.name}</span>
                  </div>
                  <Badge className="bg-amber-500 text-white">Pending</Badge>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 dark:text-gray-200">{startup.tagline}</p>
                <p className="text-xs text-gray-500">
                  By {startup.founder_name} from {startup.location} ({startup.category})
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStartupStatus(startup.id, 'Approved')}
                    className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900"
                    aria-label={`Approve startup ${startup.name}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStartupStatus(startup.id, 'Rejected')}
                    className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900"
                    aria-label={`Reject startup ${startup.name}`}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                🚀
              </div>
              <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No pending startups</h3>
            </div>
          )}
        </div>

        {/* Flagged Items Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-gray-50">Flagged Content ({flaggedItems.length})</h3>
          {flaggedItems.length > 0 ? (
            flaggedItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-2 p-4 rounded-xl shadow-sm border ${
                  item.status === 'Pending' ? 'bg-red-50 border-red-100 dark:bg-red-950 dark:border-red-900' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                } mb-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getItemIcon(item.chat_type)}
                    <span className="font-semibold text-gray-900 dark:text-gray-50">
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
                <p className="text-sm text-gray-700 dark:text-gray-200">
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
                        onClick={() => handleUpdateFlaggedStatus(item.id, 'Resolved')}
                        className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900"
                        aria-label={`Resolve flagged item from ${item.sender}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateFlaggedStatus(item.id, 'Dismissed')}
                        className="h-8 text-xs text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900"
                        aria-label={`Dismiss flagged item from ${item.sender}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 p-4 text-center bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-2xl dark:bg-gray-700">
                ✅
              </div>
              <h3 className="text-md font-bold text-gray-900 dark:text-gray-50">No flagged items</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;