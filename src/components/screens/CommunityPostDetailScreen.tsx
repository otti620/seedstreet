"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { ArrowLeft, Heart, MessageCircle, Send, Flag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
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

interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface CommunityPostDetailScreenProps {
  setCurrentScreen: (screen: string, params?: { postId?: string }) => void;
  selectedCommunityPostId: string;
  userProfile: Profile | null;
}

const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty." }).max(250, { message: "Comment cannot exceed 250 characters." }),
});

const CommunityPostDetailScreen: React.FC<CommunityPostDetailScreenProps> = ({
  setCurrentScreen,
  selectedCommunityPostId,
  userProfile,
}) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<CommunityComment | null>(null);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const fetchPostAndComments = async () => {
    setLoading(true);
    // Fetch post details
    const { data: postData, error: postError } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', selectedCommunityPostId)
      .single();

    if (postError) {
      toast.error("Failed to load post: " + postError.message);
      console.error("Error fetching post:", postError);
      setCurrentScreen('home');
      setLoading(false);
      return;
    }
    setPost(postData as CommunityPost);

    // Fetch comments for the post
    const { data: commentsData, error: commentsError } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', selectedCommunityPostId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      setComments([]);
    } else {
      setComments(commentsData as CommunityComment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCommunityPostId) {
      fetchPostAndComments();

      const channel = supabase
        .channel(`post_comments:${selectedCommunityPostId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${selectedCommunityPostId}` }, payload => {
          // When a change occurs, re-fetch to get the latest state, including real IDs
          fetchPostAndComments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedCommunityPostId]);

  const handleLikeToggle = async () => {
    if (!userProfile?.id || !post) {
      toast.error("Please log in to like posts.");
      return;
    }

    const isLiked = post.likes.includes(userProfile.id);
    const originalLikes = post.likes;
    const newLikes = isLiked
      ? post.likes.filter(id => id !== userProfile.id)
      : [...post.likes, userProfile.id];

    // Optimistic UI update
    setPost(prev => prev ? { ...prev, likes: newLikes } : null);

    const { error } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', post.id);

    if (error) {
      toast.error("Failed to update like: " + error.message);
      console.error("Error updating like:", error);
      // Revert optimistic update on error
      setPost(prev => prev ? { ...prev, likes: originalLikes } : null);
    } else {
      // Notify post author of new like
      if (!isLiked && post.author_id !== userProfile.id) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'post_liked',
          message: `${userProfile.name || userProfile.email} liked your post!`,
          link: `/communityPostDetail/${post.id}`,
          related_entity_id: post.id,
        });
      }
    }
  };

  const handleAddComment = async (values: z.infer<typeof commentSchema>) => {
    if (!userProfile?.id || !userProfile?.name || !post?.id) {
      toast.error("User profile or post information is missing. Cannot add comment.");
      return;
    }

    setSubmittingComment(true);
    const commentContent = values.content;
    form.reset(); // Clear input immediately

    const tempComment: CommunityComment = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      post_id: post.id,
      author_id: userProfile.id,
      author_name: userProfile.name,
      author_avatar_url: userProfile.avatar_url,
      content: commentContent,
      created_at: new Date().toISOString(),
    };

    setComments(prevComments => [...prevComments, tempComment]);
    setPost(prevPost => prevPost ? { ...prevPost, comments_count: prevPost.comments_count + 1 } : null);


    const { data: newCommentData, error } = await supabase.from('community_comments').insert({
      post_id: post.id,
      author_id: userProfile.id,
      author_name: userProfile.name,
      author_avatar_url: userProfile.avatar_url,
      content: commentContent,
    }).select().single(); // Select the new row to get its actual ID

    if (error) {
      toast.error("Failed to add comment: " + error.message);
      console.error("Error adding comment:", error);
      // Revert optimistic update on error
      setComments(prevComments => prevComments.filter(c => c.id !== tempComment.id));
      setPost(prevPost => prevPost ? { ...prevPost, comments_count: prevPost.comments_count - 1 } : null);
    } else if (newCommentData) {
      toast.success("Comment added!");
      // Replace the temporary comment with the real one from the database
      setComments(prevComments =>
        prevComments.map(c => (c.id === tempComment.id ? (newCommentData as CommunityComment) : c))
      );
      // Notify post author of new comment
      if (post.author_id !== userProfile.id) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'new_comment',
          message: `${userProfile.name || userProfile.email} commented on your post!`,
          link: `/communityPostDetail/${post.id}`,
          related_entity_id: post.id,
        });
      }
    }
    setSubmittingComment(false);
  };

  const handleReportPost = async () => {
    if (!userProfile?.id || !post) {
      toast.error("You must be logged in to report a post.");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this post:");
    if (!reason || reason.trim() === "") {
      toast.info("Post not reported. A reason is required.");
      return;
    }

    setSubmittingComment(true);
    const { error } = await supabase.from('flagged_messages').insert({
      message_id: post.id,
      original_message_id: post.id,
      chat_id: 'community',
      sender: post.author_name,
      sender_id: post.author_id,
      chat_type: 'Community',
      startup_name: null,
      reason: reason.trim(),
      reported_by: userProfile.id,
      status: 'Pending',
    });

    if (error) {
      toast.error("Failed to report post: " + error.message);
      console.error("Error reporting post:", error);
    } else {
      toast.success("Post reported successfully. We will review it shortly.");
    }
    setSubmittingComment(false);
  };

  const confirmDeleteComment = (comment: CommunityComment) => {
    if (!userProfile?.id) {
      toast.error("You must be logged in to delete comments.");
      return;
    }
    if (userProfile.id !== comment.author_id) {
      toast.error("You can only delete your own comments.");
      return;
    }
    // Prevent deletion of temporary comments that haven't been synced
    if (comment.id.startsWith('temp-')) {
      toast.error("This comment is still being processed. Please wait a moment or refresh.");
      return;
    }
    setCommentToDelete(comment);
    setShowDeleteCommentConfirm(true);
  };

  const handleDeleteComment = async () => {
    if (!userProfile?.id || !commentToDelete) {
      toast.error("User profile or comment information is missing. Cannot delete comment.");
      return;
    }

    setShowDeleteCommentConfirm(false); // Close dialog
    const commentId = commentToDelete.id;
    const originalComments = comments;

    // Optimistic UI update: remove comment immediately
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    setPost(prevPost => prevPost ? { ...prevPost, comments_count: prevPost.comments_count - 1 } : null);


    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', userProfile.id);

    if (error) {
      toast.error("Failed to delete comment: " + error.message);
      console.error("Error deleting comment:", error);
      // Revert optimistic update on error
      setComments(originalComments);
      setPost(prevPost => prevPost ? { ...prevPost, comments_count: prevPost.comments_count + 1 } : null);
    } else {
      toast.success("Comment deleted!", {
        action: {
          label: "Undo",
          onClick: async () => {
            const { error: undoError } = await supabase
              .from('community_comments')
              .insert(commentToDelete); // Re-insert the original comment data
            if (undoError) {
              toast.error("Failed to undo deletion: " + undoError.message);
              console.error("Error undoing deletion:", undoError);
            } else {
              toast.success("Deletion undone!");
              fetchPostAndComments(); // Re-fetch to ensure state is consistent
            }
          },
        },
        duration: 5000, // Allow 5 seconds to undo
      });
      // Real-time subscription will handle updating the comments list
    }
    setCommentToDelete(null);
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
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-6 text-center dark:bg-gray-950">
        <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Post Not Found</h2>
        <p className="text-gray-600 mb-6 dark:text-gray-400">The community post you are looking for does not exist or has been removed.</p>
        <Button onClick={() => setCurrentScreen('home')} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white">
          Go to Home
        </Button>
      </div>
    );
  }

  const isLikedByUser = userProfile?.id && post.likes.includes(userProfile.id);
  const isPostAuthor = userProfile?.id === post.author_id;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to community feed">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Post Details</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Post options">
                <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPostAuthor && (
                <>
                  <DropdownMenuItem onClick={() => setCurrentScreen('createCommunityPost', { postId: post.id })} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => confirmDeleteComment(post as unknown as CommunityComment)} className="flex items-center gap-2 text-red-600">
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleReportPost} className="flex items-center gap-2 text-red-600">
                <Flag className="w-4 h-4" /> Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl flex-shrink-0">
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
          </div>
          <p className="text-sm text-gray-700 mb-3 dark:text-gray-200">{post.content}</p>
          {post.image_url && (
            <Image src={post.image_url} alt="Post Image" width={500} height={300} objectFit="cover" className="mt-3 rounded-lg w-full" />
          )}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 text-sm font-medium ${
                isLikedByUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
              }`}
              aria-label={isLikedByUser ? "Unlike post" : "Like post"}
            >
              <Heart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
              {post.likes.length > 0 && <span>{post.likes.length}</span>}
            </button>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              {post.comments_count > 0 && <span>{post.comments_count}</span>}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Comments ({comments.length})</h3>
          {comments.length > 0 ? (
            <AnimatePresence initial={false}>
              {comments.map(comment => {
                const isCommentAuthor = userProfile?.id === comment.author_id;
                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0 relative overflow-hidden dark:bg-gray-700 dark:text-gray-50">
                        {comment.author_avatar_url ? (
                          <Image src={comment.author_avatar_url} alt="Author Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                        ) : (
                          comment.author_name?.[0] || '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{comment.author_name}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                      {isCommentAuthor && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" aria-label="Comment options">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => confirmDeleteComment(comment)} className="flex items-center gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" /> Delete Comment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 ml-10 dark:text-gray-200">{comment.content}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <p className="text-center text-gray-500 py-4 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="bg-white border-t border-gray-100 p-4 dark:bg-gray-900 dark:border-gray-800">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddComment)} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a comment..."
                      className="min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-purple-100 border-2 border-transparent focus:border-purple-700 transition-all dark:bg-gray-800 dark:text-gray-50 dark:focus:border-purple-500"
                      disabled={submittingComment}
                      aria-label="Comment input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submittingComment || !form.formState.isValid} size="icon" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-teal-600 text-white hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send comment">
              {submittingComment ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </Form>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteCommentConfirm}
        onClose={() => setShowDeleteCommentConfirm(false)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default CommunityPostDetailScreen;