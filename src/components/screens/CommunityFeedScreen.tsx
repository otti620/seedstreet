"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { Plus, Heart, MessageCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import BottomNav from '../BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmationDialog from '../ConfirmationDialog'; // Import ConfirmationDialog

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
  userProfileId: string | null;
  fetchCommunityPosts: () => Promise<void>; // Function to re-fetch posts
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
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  useEffect(() => {
    // Simulate loading for initial render, then set to false
    // Actual data loading is handled by useAppData, so this is more for visual effect
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLikeToggle = async (post: CommunityPost) => {
    if (!userProfileId) {
      toast.error("Please log in to like posts.");
      return;
    }

    const isLiked = post.likes.includes(userProfileId);
    const newLikes = isLiked
      ? post.likes.filter(id => id !== userProfileId)
      : [...post.likes, userProfileId];

    // Optimistic UI update (handled by real-time subscription in useAppData)
    // For now, we'll let the subscription trigger a re-fetch.

    const { error } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', post.id);

    if (error) {
      toast.error("Failed to update like: " + error.message);
      console.error("Error updating like:", error);
    } else {
      // Notify post author of new like
      if (!isLiked && post.author_id !== userProfileId) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'post_liked',
          message: `${userProfileId} liked your post!`, // Use actual user name if available
          link: `/communityPostDetail/${post.id}`,
          related_entity_id: post.id,
        });
      }
    }
  };

  const confirmDeletePost = (post: CommunityPost) => {
    if (!userProfileId) {
      toast.error("You must be logged in to delete posts.");
      return;
    }
    if (userProfileId !== post.author_id) {
      toast.error("You can only delete your own posts.");
      return;
    }
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete || !userProfileId) {
      toast.error("Post information is missing. Cannot delete.");
      return;
    }

    setShowDeleteConfirm(false); // Close dialog

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postToDelete.id)
      .eq('author_id', userProfileId); // Ensure only author can delete

    if (error) {
      toast.error("Failed to delete post: " + error.message);
      console.error("Error deleting post:", error);
    } else {
      toast.success("Post deleted successfully!");
      fetchCommunityPosts(); // Re-fetch posts to update the list
    }
    setPostToDelete(null);
  };

  const renderPostSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg mb-4" />
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Community Feed</h1>
            <p className="text-sm text-gray-500">Share updates, ask questions</p>
          </div>
          <button onClick={() => setCurrentScreen('createCommunityPost')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="Create new post">
            <Plus className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderPostSkeleton()}</React.Fragment>)
        ) : communityPosts.length > 0 ? (
          <AnimatePresence>
            {communityPosts.map(post => {
              const isLikedByUser = userProfileId && post.likes.includes(userProfileId);
              const isAuthor = userProfileId === post.author_id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 relative overflow-hidden">
                      {post.author_avatar_url ? (
                        <Image src={post.author_avatar_url} alt="Author Avatar" layout="fill" objectFit="cover" className="rounded-xl" />
                      ) : (
                        post.author_name?.[0] || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-50">
                        <span className="font-semibold">{post.author_name}</span> posted:
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                    {isAuthor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" aria-label="Post options">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setCurrentScreen('createCommunityPost', { postId: post.id })} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDeletePost(post)} className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3 dark:text-gray-200">{post.content}</p>
                  {post.image_url && (
                    <Image src={post.image_url} alt="Post Image" width={500} height={300} objectFit="cover" className="mt-3 rounded-lg w-full" />
                  )}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleLikeToggle(post)}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isLikedByUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
                      }`}
                      aria-label={isLikedByUser ? "Unlike post" : "Like post"}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
                      {post.likes.length > 0 && <span>{post.likes.length}</span>}
                    </button>
                    <button
                      onClick={() => setCurrentScreen('communityPostDetail', { postId: post.id })}
                      className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-purple-700 dark:text-gray-400 dark:hover:text-purple-400"
                      aria-label={`View comments for post by ${post.author_name}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count > 0 && <span>{post.comments_count}</span>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
              ✨
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No posts yet</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-400">Be the first to share an update!</p>
            <button onClick={() => setCurrentScreen('createCommunityPost')} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all">
              Create Post
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this community post? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default CommunityFeedScreen;