"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { ArrowLeft, Image as ImageIcon, Send, X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl } from '@/lib/default-avatars'; // Import getAvatarUrl
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label'; // Import Label for floating labels

// Define TypeScript interfaces for data structures
interface Profile {
  id: string;
  name: string | null;
  avatar_id: number | null; // Changed from avatar_url
}

interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_id: number | null; // Changed from author_avatar_url
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface CreateCommunityPostScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  userProfile: Profile;
  postId?: string; // Optional prop for editing
}

const formSchema = z.object({
  content: z.string().min(1, { message: "Post content cannot be empty." }).max(1000, { message: "Post cannot exceed 1000 characters." }),
  image_url: z.string().url({ message: "Invalid image URL." }).optional().or(z.literal('')), // Keep image_url for existing posts, but no upload
});

const CreateCommunityPostScreen: React.FC<CreateCommunityPostScreenProps> = ({
  setCurrentScreen,
  userProfile,
  postId,
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For loading existing post data

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      image_url: '',
    },
  });

  // Fetch existing post data if in edit mode
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) {
          toast.error("Failed to load post data: " + error.message);
          console.error("Error fetching post:", error);
          setCurrentScreen('home'); // Go back if data can't be loaded
        } else if (data) {
          form.reset({
            content: data.content,
            image_url: data.image_url || '',
          });
        }
        setInitialLoading(false);
      };
      fetchPost();
    } else {
      setInitialLoading(false); // Not in edit mode, no initial loading needed
    }
  }, [postId, form, setCurrentScreen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const postData = {
      content: values.content,
      image_url: values.image_url || null, // Use the URL from the form, or null
      updated_at: new Date().toISOString(),
    };

    let error;
    if (postId) {
      // Update existing post
      const { error: updateError } = await supabase
        .from('community_posts')
        .update(postData)
        .eq('id', postId)
        .eq('author_id', userProfile.id); // Ensure only author can update
      error = updateError;
    } else {
      // Insert new post
      const { error: insertError } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          author_id: userProfile.id,
          author_name: userProfile.name,
          author_avatar_id: userProfile.avatar_id, // Use avatar_id
          likes: [],
          comments_count: 0,
        });
      error = insertError;
    }

    if (error) {
      toast.error(`Failed to ${postId ? 'update' : 'create'} post: ` + error.message);
      console.error(`Error ${postId ? 'updating' : 'creating'} post:`, error);
    } else {
      toast.success(`Post ${postId ? 'updated' : 'created'} successfully!`);
      setCurrentScreen('home'); // Go back to community feed
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to community feed">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">
            {postId ? 'Edit Post' : 'Create New Post'}
          </h2>
          <Button type="submit" form="community-post-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label={postId ? 'Save changes' : 'Post'}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {postId ? <Save className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {postId ? 'Save Changes' : 'Post'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="community-post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">What's on your mind?</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Share an update, ask a question, or start a discussion..."
                      className="min-h-[150px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Post content"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Image URL Input (no upload) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Input
                        {...field}
                        type="url"
                        placeholder=" "
                        className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        aria-label="Image URL"
                      />
                      <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Image URL (Optional)</Label>
                      <ImageIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-4 relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image src={field.value} alt="Image Preview" layout="fill" objectFit="cover" />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCommunityPostScreen;