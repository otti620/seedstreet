"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Send, X } from 'lucide-react';
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

// Define TypeScript interfaces for data structures
interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

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

interface CreateCommunityPostScreenProps {
  setCurrentScreen: (screen: string, params?: { postId?: string }) => void;
  userProfile: Profile;
  postId?: string; // Optional prop for editing
}

const formSchema = z.object({
  content: z.string().min(1, { message: "Post content cannot be empty." }).max(1000, { message: "Post cannot exceed 1000 characters." }),
  // image_url is handled separately by file upload
});

const CreateCommunityPostScreen: React.FC<CreateCommunityPostScreenProps> = ({
  setCurrentScreen,
  userProfile,
  postId,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // For loading existing post data

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
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
          });
          if (data.image_url) {
            setImagePreview(data.image_url);
          }
        }
        setInitialLoading(false);
      };
      fetchPost();
    } else {
      setInitialLoading(false); // Not in edit mode, no initial loading needed
    }
  }, [postId, form, setCurrentScreen]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else if (!postId) { // Clear preview if not editing and no file
      setImagePreview(null);
    }
  }, [imageFile, postId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
      if (!postId) setImagePreview(null); // Only clear if not editing
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    let imageUrl = imagePreview; // Start with existing preview if any

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `community_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast.error("Failed to upload image: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('community_images').getPublicUrl(filePath);
      imageUrl = publicUrlData.publicUrl;
    } else if (imagePreview === null && postId) {
      // If in edit mode and image was removed, set imageUrl to null
      imageUrl = null;
    }

    const postData = {
      content: values.content,
      image_url: imageUrl,
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
          author_avatar_url: userProfile.avatar_url,
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
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to community feed">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">
            {postId ? 'Edit Post' : 'Create New Post'}
          </h2>
          <Button type="submit" form="community-post-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label={postId ? 'Save changes' : 'Post'}>
            {loading ? 'Saving...' : (postId ? 'Save Changes' : 'Post')}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="community-post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Image Upload */}
            <FormItem>
              <FormLabel className="dark:text-gray-50">Add Image (Optional)</FormLabel>
              <div className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden dark:border-gray-700">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Image Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center text-gray-500 cursor-pointer p-4">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                      aria-label="Upload image"
                    />
                  </label>
                )}
              </div>
            </FormItem>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCommunityPostScreen;