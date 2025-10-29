"use client";

import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface CreateCommunityPostScreenProps {
  setCurrentScreen: (screen: string) => void;
  userProfile: Profile | null;
}

const postSchema = z.object({
  content: z.string().min(1, { message: "Post content cannot be empty." }).max(500, { message: "Post content cannot exceed 500 characters." }),
  image_url: z.string().url({ message: "Invalid URL for image." }).optional().or(z.literal('')),
});

const CreateCommunityPostScreen: React.FC<CreateCommunityPostScreenProps> = ({
  setCurrentScreen,
  userProfile,
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      image_url: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    if (!userProfile?.id || !userProfile?.name) {
      toast.error("User profile information is missing. Cannot create post.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('community_posts').insert({
      author_id: userProfile.id,
      author_name: userProfile.name,
      author_avatar_url: userProfile.avatar_url,
      content: values.content,
      image_url: values.image_url || null,
    });

    if (error) {
      toast.error("Failed to create post: " + error.message);
      console.error("Error creating post:", error);
    } else {
      toast.success("Post created successfully!");
      setCurrentScreen('home'); // Go back to community feed
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1">Create New Post</h2>
          <Button type="submit" form="post-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white">
            {loading ? 'Posting...' : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <Label>What's on your mind?</Label>
                  <Textarea
                    {...field}
                    placeholder="Share an update, ask a question, or start a discussion..."
                    className="min-h-[120px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <Label>Image URL (Optional)</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="url"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCommunityPostScreen;