"use client";

import React from 'react';
import { ArrowLeft, Bell, CheckCircle, XCircle, Info, MessageCircle, Rocket, Bookmark, Sparkles, Eye } from 'lucide-react'; // Added Sparkles for community posts and Eye for new_interest
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  related_entity_id: string | null;
}

interface NotificationsScreenProps {
  notifications: Notification[];
  setCurrentScreen: (screen: string, params?: { startupId?: string, postId?: string, chatId?: string }) => void; // Updated to accept chatId
  fetchNotifications: () => void; // Function to re-fetch notifications after an action
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  setCurrentScreen,
  fetchNotifications,
}) => {
  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast.error("Failed to mark notification as read: " + error.message);
      console.error("Error marking notification as read:", error);
    } else {
      toast.success("Notification marked as read!");
      fetchNotifications(); // Re-fetch to update the list
    }
  };

  const handleViewDetails = (notification: Notification) => {
    if (!notification.related_entity_id) {
      toast.info("No specific details available for this notification.");
      return;
    }

    switch (notification.type) {
      case 'startup_approved':
      case 'startup_rejected':
      case 'new_interest':
      case 'bookmark_update':
        setCurrentScreen('startupDetail', { startupId: notification.related_entity_id });
        break;
      case 'new_chat':
        setCurrentScreen('chat', { chatId: notification.related_entity_id }); // Direct navigation to chat
        break;
      case 'new_comment':
      case 'post_liked':
        setCurrentScreen('communityPostDetail', { postId: notification.related_entity_id });
        break;
      default:
        toast.info(`Navigating to: ${notification.link || 'home'}`);
        setCurrentScreen('home');
        break;
    }
    // Optionally mark as read after viewing details
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_chat':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'startup_approved':
        return <Rocket className="w-5 h-5 text-green-600" />;
      case 'startup_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'bookmark_update':
        return <Bookmark className="w-5 h-5 text-purple-600" />;
      case 'new_interest':
        return <Eye className="w-5 h-5 text-orange-600" />;
      case 'new_comment':
      case 'post_liked':
        return <Sparkles className="w-5 h-5 text-pink-600" />;
      case 'general':
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Notifications</h2>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-sm border ${
                notification.read ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-purple-50 border-purple-100 dark:bg-purple-950 dark:border-purple-900'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notification.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 font-semibold dark:text-gray-50'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  {notification.related_entity_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(notification)}
                      className="h-8 text-xs dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      aria-label={`View details for notification: ${notification.message}`}
                    >
                      View Details
                    </Button>
                  )}
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="h-8 text-xs text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900"
                      aria-label={`Mark notification as read: ${notification.message}`}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
              🔔
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No new notifications</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;