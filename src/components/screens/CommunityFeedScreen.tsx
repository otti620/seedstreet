"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Bell, Heart, MessageCircle, MoreVertical, Edit, Trash2 } from 'lucide-react'; // Import Edit, Trash2
import BottomNav from '../BottomNav'; // Corrected path
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define TypeScript interfaces for data structures
interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
}

interface CommunityFeedScreenProps {
  communityPosts: CommunityPost[];
  setCurrentScreen: (screen: string, params?: { postId?: string }) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: string | null;
  userProfileId: string | null; // Pass userProfileId
  fetchCommunityPosts: () => Promise<void>; // Pass fetch function
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
  const [loading, setLoading] = useState(true); // Assume loading initially

  useEffect(() => {
    // Since communityPosts are passed as a prop, we can assume loading is done once they are available
    if (communityPosts) {
      setLoading(false);
    }
  }, [communityPosts]);

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
      fetchCommunityPosts(); // Re-fetch to update the list
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!userProfileId) {
      toast.error("You must be logged in to delete posts.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userProfileId); // Ensure only author can delete

    if (error) {
      toast.error("Failed to delete post: " + error.message);
      console.error("Error deleting post:", error);
    } else {
      toast.success("Post deleted successfully!");
      fetchCommunityPosts(); // Re-fetch to update the list
    }
  };

  const renderPostSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Community Feed</h1>
            <p className="text-sm text-gray-500">Share and connect with others</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Create Post Button */}
        <button
          onClick={() => setCurrentScreen('createCommunityPost')}
          className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" />
          Create New Post
        </button>

        {/* Community Posts */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderPostSkeleton()}</React.Fragment>)
        ) : (
          communityPosts.length > 0 ? (
            communityPosts.map(post => {
              const isLikedByUser = userProfileId && post.likes.includes(userProfileId);
              const isAuthor = userProfileId === post.author_id;

              return (
                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
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
                    </div>
                    {isAuthor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setCurrentScreen('communityPostDetail', { postId: post.id })} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Edit Post (View Detail)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-60 object-cover w-full" />
                  )}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleLikeToggle(post.id, post.likes)}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isLikedByUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
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
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No community posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share an update!</p>
            </div>
          )
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default CommunityFeedScreen;