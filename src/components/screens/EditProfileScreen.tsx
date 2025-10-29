"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Info, Save } from 'lucide-react';
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

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[];
  interested_startups: string[];
  bio: string | null;
  location: string | null;
  phone: string | null;
}

interface EditProfileScreenProps {
  userProfile: Profile;
  setCurrentScreen: (screen: string) => void;
  setUserProfile: (profile: Profile | null) => void;
}

const profileSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }).optional().or(z.literal('')),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }).optional().or(z.literal('')),
  name: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }).optional(), // Email might not be editable directly
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  avatar_url: z.string().url({ message: "Invalid URL for avatar." }).optional().or(z.literal('')),
});

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ userProfile, setCurrentScreen, setUserProfile }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: userProfile.first_name || '',
      last_name: userProfile.last_name || '',
      name: userProfile.name || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      phone: userProfile.phone || '',
      avatar_url: userProfile.avatar_url || '',
    },
  });

  // Reset form with new userProfile data if it changes
  useEffect(() => {
    form.reset({
      first_name: userProfile.first_name || '',
      last_name: userProfile.last_name || '',
      name: userProfile.name || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      phone: userProfile.phone || '',
      avatar_url: userProfile.avatar_url || '',
    });
  }, [userProfile, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        name: values.name || null,
        bio: values.bio || null,
        location: values.location || null,
        phone: values.phone || null,
        avatar_url: values.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update profile: " + error.message);
      console.error("Error updating profile:", error);
    } else if (data) {
      setUserProfile(data as Profile); // Update local state with new profile data
      toast.success("Profile updated successfully!");
      setCurrentScreen('home'); // Go back to profile screen or home
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
          <h2 className="text-lg font-bold text-gray-900 flex-1">Edit Profile</h2>
          <Button type="submit" form="profile-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white">
            {loading ? 'Saving...' : <Save className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <Label>Avatar URL</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="url"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    {/* Placeholder for image upload button */}
                    <Button variant="outline" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => toast.info("Image upload coming soon!")}>Upload</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Display Name</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <Label>First Name</Label>
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Last Name</Label>
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <Label>Bio</Label>
                  <Textarea
                    {...field}
                    placeholder="Tell us about yourself..."
                    className="min-h-[80px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <Label>Location</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="tel"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
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

export default EditProfileScreen;