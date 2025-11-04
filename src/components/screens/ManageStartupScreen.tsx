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
  description: string | null; // Made nullable as per schema
  pitch: string; // Added as required
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null; // Added for AI analysis
  market_trend_analysis: string | null; // Added for AI analysis
}

interface ManageStartupScreenProps {
  setCurrentScreen: (screen: string, params?: { startupName?: string }) => void;
  userProfileId: string;
  userProfileName: string;
  userProfileEmail: string;
  startupId?: string; // Optional prop for editing
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>; // Add logActivity prop
}

const startupCategories = [
  "AgriTech", "AI/ML", "CleanTech", "EdTech", "FinTech", "Food & Beverage",
  "HealthTech", "Logistics", "Media & Entertainment", "PropTech", "SaaS",
  "Social Impact", "E-commerce", "Other"
];

const currencies = ["Naira", "Euro", "Dollar", "Pounds Sterling"];
const fundingStages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Growth", "IPO"];

const formSchema = z.object({
  name: z.string().min(3, { message: "Startup name must be at least 3 characters." }),
  logo: z.string().emoji({ message: "Logo must be a single emoji." }).min(1, { message: "Logo is required." }),
  tagline: z.string().min(10, { message: "Tagline must be at least 10 characters." }).max(100, { message: "Tagline cannot exceed 100 characters." }),
  pitch: z.string().min(50, { message: "Pitch must be at least 50 characters." }).max(1000, { message: "Pitch cannot exceed 1000 characters." }), // New required field
  description: z.string().max(1000, { message: "Description cannot exceed 1000 characters." }).optional().or(z.literal('')), // Existing field, now optional
  category: z.enum(startupCategories as [string, ...string[]], { message: "Please select a valid category." }),
  location: z.string().min(2, { message: "Location is required." }),
  amount_sought: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, { message: "Amount must be a positive number." }).nullable()
  ).optional(),
  currency: z.enum(currencies as [string, ...string[]], { message: "Please select a valid currency." }).optional(),
  funding_stage: z.enum(fundingStages as [string, ...string[]], { message: "Please select a valid funding stage." }).optional(),
});

const ManageStartupScreen: React.FC<ManageStartupScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  userProfileName,
  userProfileEmail,
  startupId,
  logActivity, // Destructure logActivity
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      tagline: '',
      pitch: '',
      description: '',
      category: undefined,
      location: '',
      amount_sought: null,
      currency: undefined,
      funding_stage: undefined,
    },
  });

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
          setCurrentScreen('home');
        } else if (data) {
          form.reset({
            name: data.name,
            logo: data.logo,
            tagline: data.tagline,
            pitch: data.pitch,
            description: data.description || '',
            category: data.category,
            location: data.location,
            amount_sought: data.amount_sought,
            currency: data.currency,
            funding_stage: data.funding_stage,
          });
        }
        setInitialLoading(false);
      };
      fetchStartup();
    } else {
      setInitialLoading(false);
    }
  }, [startupId, form, setCurrentScreen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const startupData = {
      name: values.name,
      logo: values.logo,
      tagline: values.tagline,
      pitch: values.pitch,
      description: values.description || null,
      category: values.category,
      location: values.location,
      amount_sought: values.amount_sought || null,
      currency: values.currency || null,
      funding_stage: values.funding_stage || null,
      founder_id: userProfileId,
      founder_name: userProfileName,
      status: 'Pending',
      room_members: 0,
      active_chats: 0,
      interests: 0,
      updated_at: new Date().toISOString(),
    };

    let error;
    let newStartupId = startupId;
    if (startupId) {
      const { error: updateError } = await supabase
        .from('startups')
        .update(startupData)
        .eq('id', startupId);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('startups')
        .insert(startupData)
        .select('id')
        .single();
      error = insertError;
      if (data) newStartupId = data.id;
    }

    if (error) {
      toast.error(`Failed to ${startupId ? 'update' : 'list'} startup: ${error.message || JSON.stringify(error)}`);
      console.error(`Error ${startupId ? 'updating' : 'listing'} startup:`, error);
    } else {
      toast.success(`Startup ${startupId ? 'updated' : 'listed'} successfully!`);

      // --- AI Analysis Integration ---
      if (newStartupId) {
        try {
          const { data: aiAnalysis, error: aiError } = await supabase.functions.invoke('analyze-startup', {
            body: {
              startupData: {
                id: newStartupId,
                name: values.name,
                tagline: values.tagline,
                pitch: values.pitch,
                category: values.category,
                description: values.description,
                funding_stage: values.funding_stage,
                amount_sought: values.amount_sought,
                // Add any other relevant fields for AI analysis
              },
            },
          });

          if (aiError) {
            console.error("Error invoking AI analysis function:", aiError);
            toast.error("AI analysis failed: " + aiError.message);
          } else if (aiAnalysis) {
            console.log("AI Analysis Result:", aiAnalysis);
            // Update the startup with AI analysis results
            const { error: updateAiError } = await supabase
              .from('startups')
              .update({
                ai_risk_score: aiAnalysis.aiRiskScore,
                market_trend_analysis: aiAnalysis.marketTrendAnalysis,
              })
              .eq('id', newStartupId);

            if (updateAiError) {
              console.error("Error updating startup with AI analysis:", updateAiError);
              toast.error("Failed to save AI analysis results.");
            } else {
              toast.success("AI analysis complete and saved!");
            }
          }
        } catch (aiInvokeError) {
          console.error("Unexpected error during AI analysis invocation:", aiInvokeError);
          toast.error("An unexpected error occurred during AI analysis.");
        }
      }
      // --- End AI Analysis Integration ---

      if (!startupId) {
        logActivity('startup_listed', `Listed new startup: ${values.name}`, newStartupId, 'Rocket');
        setCurrentScreen('startupListingCelebration', { startupName: values.name });
      } else {
        logActivity('startup_updated', `Updated startup: ${values.name}`, newStartupId, 'Rocket');
        setCurrentScreen('home');
      }
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
          {Array.from({ length: 10 }).map((_, i) => (
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
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">
            {startupId ? 'Edit Startup' : 'List Your Startup'}
          </h2>
          <Button type="submit" form="startup-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label={startupId ? 'Save changes' : 'Submit listing'}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              startupId ? 'Save Changes' : 'Submit Listing'
            )}
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
                  <FormLabel className="dark:text-gray-50">Startup Name</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup name"
                    />
                    <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
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
                  <FormLabel className="dark:text-gray-50">Logo (Emoji)</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      maxLength={2}
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup logo emoji"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
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
                  <FormLabel className="dark:text-gray-50">Tagline</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup tagline"
                    />
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pitch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Pitch (Required)</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Give us your elevator pitch! What problem are you solving and how?"
                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                    aria-label="Startup pitch"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Full Description (Optional)</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Tell us more about your startup, team, vision, etc."
                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                    aria-label="Startup description"
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
                  <FormLabel className="dark:text-gray-50">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} aria-label="Select startup category">
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {startupCategories.map(category => (
                        <SelectItem key={category} value={category} className="dark:text-gray-50">{category}</SelectItem>
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
                  <FormLabel className="dark:text-gray-50">Location</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder=" "
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup location"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount_sought"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Amount to be Raised</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g., 500000"
                      className="peer w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      value={field.value === null ? '' : field.value}
                      aria-label="Amount to be raised"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} aria-label="Select currency">
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency} className="dark:text-gray-50">{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="funding_stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-50">Funding Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} aria-label="Select funding stage">
                    <FormControl>
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                        <SelectValue placeholder="Select funding stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {fundingStages.map(stage => (
                        <SelectItem key={stage} value={stage} className="dark:text-gray-50">{stage}</SelectItem>
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