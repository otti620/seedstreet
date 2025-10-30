"use client";

import React from 'react';
import { Sparkles, Plus, Heart, MessageCircle } from 'lucide-react'; // Import Heart and MessageCircle icons
import { toast } from 'sonner';
import BottomNav from '../BottomNav';
import { supabase } from '@/integrations/supabase/client';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[]; // Array of user IDs who liked
  comments_count: number;
}

interface CommunityFeedScreenProps {
  communityPosts: CommunityPost[];
  setCurrentScreen: (screen: string, params?: { postId?: string }) => void; // Updated to accept postId
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: string | null;
  userProfileId: string | null; // New prop for current user's ID
  fetchCommunityPosts: () => void; // Function to re-fetch posts after an action
}

const CommunityFeedScreen: React.FC<CommunityFeedScreenProps> = ({
  communityPosts,
  setCurrentScreen,
  setActiveTab,
  activeTab,
  userRole,
  userProfileId,
  fetchCommunityPosts,
}) => {

  const handleLikeToggle = async (postId: string, currentLikes: string[]) => {
    if (!userProfileId) {
      toast.error("Please log in to like posts.");
      return;
    }

    const isLiked = currentLikes.includes(userProfileId);
    const newLikes = isLiked
      ? currentLikes.filter(id => id !== userProfileId)
      : [...currentLikes, userProfileId];

    const { error } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (error) {
      toast.error("Failed to update like: " + error.message);
      console.error("Error updating like:", error);
    } else {
      // No toast success here to avoid spamming, UI update is enough
      fetchCommunityPosts(); // Re-fetch posts to update the UI
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">What's happening ✨</h1>
          <button onClick={() => setCurrentScreen('createCommunityPost')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors">
            <Plus className="w-5 h-5 text-purple-700" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {communityPosts.length > 0 ? (
          communityPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl flex-shrink-0">
                  {post.author_avatar_url ? (
                    <img src={post.author_avatar_url} alt="Author Avatar" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    post.author_name?.[0] || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{post.author_name}</span> posted:
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-700 mt-2">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-48 object-cover w-full" />
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLikeToggle(post.id, post.likes)}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        userProfileId && post.likes.includes(userProfileId) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userProfileId && post.likes.includes(userProfileId) ? 'fill-current' : ''}`} />
                      {post.likes.length > 0 && <span>{post.likes.length}</span>}
                    </button>
                    <button
                      onClick={() => setCurrentScreen('communityPostDetail', { postId: post.id })}
                      className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-500"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count > 0 && <span>{post.comments_count}</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
              😴
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No community posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share something exciting!</p>
            <button onClick={() => setCurrentScreen('createCommunityPost')} className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg">
              Create Post ✨
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default CommunityFeedScreen;