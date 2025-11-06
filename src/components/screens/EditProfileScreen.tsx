"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react'; // Removed ImageIcon, Upload
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
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl } from '@/lib/default-avatars'; // Import getAvatarUrl

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null; // Changed from avatar_url
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  onboarding_complete: boolean;
  bio: string | null;
  location: string | null;
  phone: string | null;
}

interface EditProfileScreenProps {
  setCurrentScreen: (screen: string) => void;
  userProfile: Profile;
  setUserProfile: (profile: Profile | null) => void;
}

const formSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).nullable(),
  location: z.string().nullable(),
  phone: z.string().nullable(),
});

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  setCurrentScreen,
  userProfile,
  setUserProfile,
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: userProfile.first_name || '',
      last_name: userProfile.last_name || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      phone: userProfile.phone || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        name: `${values.first_name} ${values.last_name}`, // Update full name
        email: values.email,
        bio: values.bio,
        location: values.location,
        phone: values.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to update profile: " + error.message);
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profile updated successfully!");
      // Update local userProfile state
      setUserProfile({
        ...userProfile,
        ...values,
        name: `${values.first_name} ${values.last_name}`,
      });
      setCurrentScreen('home'); // Go back to profile dashboard
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to profile">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Edit Profile</h2>
          <Button type="submit" form="profile-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label="Save changes">
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Display (no upload) */}
            <FormItem className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-700 relative overflow-hidden border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                {userProfile.avatar_id ? (
                  <Image src={getAvatarUrl(userProfile.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
                ) : (
                  userProfile.name?.[0] || userProfile.email?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your current avatar</p>
            </FormItem>

            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">First Name</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="First name"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Last Name</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Last name"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Email</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      disabled // Email is usually not editable directly here
                      aria-label="Email address"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Bio</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                    aria-label="Biography"
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
                  <FormLabel className="dark:text-gray-50">Location</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Location"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
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
                  <FormLabel className="dark:text-gray-50">Phone Number</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="tel"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Phone number"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
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