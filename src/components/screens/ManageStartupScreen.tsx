"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Rocket, Tag, AlignLeft, DollarSign, MapPin, User, Image as ImageIcon, Check } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  founder_id: string;
  amount_sought: number | null; // Added
  currency: string | null; // Added
  funding_stage: string | null; // Added
}

interface ManageStartupScreenProps {
  setCurrentScreen: (screen: string, params?: { startupName?: string }) => void;
  userProfileId: string;
  userProfileName: string;
  userProfileEmail: string;
  startupId?: string; // Optional prop for editing
}

const startupCategories = [
  "AgriTech", "AI/ML", "CleanTech", "EdTech", "FinTech", "Food & Beverage",
  "HealthTech", "Logistics", "Media & Entertainment", "PropTech", "SaaS",
  "Social Impact", "E-commerce", "Other"
];

const currencies = ["Naira", "Euro", "Dollar", "Pounds Sterling"]; // New: Currencies
const fundingStages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Growth", "IPO"]; // New: Funding Stages

const formSchema = z.object({
  name: z.string().min(3, { message: "Startup name must be at least 3 characters." }),
  logo: z.string().emoji({ message: "Logo must be a single emoji." }).min(1, { message: "Logo is required." }),
  tagline: z.string().min(10, { message: "Tagline must be at least 10 characters." }).max(100, { message: "Tagline cannot exceed 100 characters." }),
  description: z.string().min(50, { message: "Description must be at least 50 characters." }).max(1000, { message: "Description cannot exceed 1000 characters." }),
  category: z.enum(startupCategories as [string, ...string[]], { message: "Please select a valid category." }),
  location: z.string().min(2, { message: "Location is required." }),
  amount_sought: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, { message: "Amount must be a positive number." }).nullable()
  ).optional(), // New: Amount sought
  currency: z.enum(currencies as [string, ...string[]], { message: "Please select a valid currency." }).optional(), // New: Currency
  funding_stage: z.enum(fundingStages as [string, ...string[]], { message: "Please select a valid funding stage." }).optional(), // New: Funding Stage
});

const ManageStartupScreen: React.FC<ManageStartupScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  userProfileName,
  userProfileEmail,
  startupId, // Destructure startupId
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For loading existing data

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      tagline: '',
      description: '',
      category: undefined, // Use undefined for initial empty state of select
      location: '',
      amount_sought: null, // Default for new field
      currency: undefined, // Default for new field
      funding_stage: undefined, // Default for new field
    },
  });

  // Fetch existing startup data if in edit mode
  useEffect(() => {
    if (startupId) {
      const fetchStartup = async () => {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('id', startupId)
          .single();

        if (error) {
          toast.error("Failed to load startup data: " + error.message);
          console.error("Error fetching startup:", error);
          setCurrentScreen('home'); // Go back if data can't be loaded
        } else if (data) {
          form.reset({
            name: data.name,
            logo: data.logo,
            tagline: data.tagline,
            description: data.description,
            category: data.category,
            location: data.location,
            amount_sought: data.amount_sought, // Populate new field
            currency: data.currency, // Populate new field
            funding_stage: data.funding_stage, // Populate new field
          });
        }
        setInitialLoading(false);
      };
      fetchStartup();
    } else {
      setInitialLoading(false); // Not in edit mode, no initial loading needed
    }
  }, [startupId, form, setCurrentScreen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const startupData = {
      ...values,
      founder_id: userProfileId,
      founder_name: userProfileName,
      status: 'Pending', // New startups are pending, existing ones might retain status or be reset
      room_members: 0,
      active_chats: 0,
      interests: 0,
      updated_at: new Date().toISOString(),
      amount_sought: values.amount_sought || null, // Ensure null if empty
      currency: values.currency || null, // Ensure null if empty
      funding_stage: values.funding_stage || null, // Ensure null if empty
    };

    let error;
    if (startupId) {
      // Update existing startup
      const { error: updateError } = await supabase
        .from('startups')
        .update(startupData)
        .eq('id', startupId);
      error = updateError;
    } else {
      // Insert new startup
      const { error: insertError } = await supabase
        .from('startups')
        .insert(startupData);
      error = insertError;
    }

    if (error) {
      toast.error(`Failed to ${startupId ? 'update' : 'list'} startup: ` + error.message);
      console.error(`Error ${startupId ? 'updating' : 'listing'} startup:`, error);
    } else {
      toast.success(`Startup ${startupId ? 'updated' : 'listed'} successfully!`);
      if (!startupId) {
        // Only show celebration for new listings
        setCurrentScreen('startupListingCelebration', { startupName: values.name });
      } else {
        setCurrentScreen('home'); // Go back to founder dashboard for edits
      }
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {Array.from({ length: 10 }).map((_, i) => ( // Increased skeleton count
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1">
            {startupId ? 'Edit Startup' : 'List Your Startup'}
          </h2>
          <Button type="submit" form="startup-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white">
            {loading ? 'Saving...' : (startupId ? 'Save Changes' : 'Submit Listing')}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="startup-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Startup Name</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <Label>Logo (Emoji)</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      maxLength={2} // Restrict to 1-2 characters for emoji
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <Label>Tagline</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    />
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label>Description</Label>
                  <Textarea
                    {...field}
                    placeholder="Tell us more about your startup..."
                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Label>Category</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {startupCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            {/* New Field: Amount to be Raised */}
            <FormField
              control={form.control}
              name="amount_sought"
              render={({ field }) => (
                <FormItem>
                  <Label>Amount to be Raised</Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 500000"
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      value={field.value === null ? '' : field.value}
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Field: Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <Label>Currency</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Field: Funding Stage */}
            <FormField
              control={form.control}
              name="funding_stage"
              render={({ field }) => (
                <FormItem>
                  <Label>Funding Stage</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all">
                        <SelectValue placeholder="Select funding stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fundingStages.map(stage => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

export default ManageStartupScreen;