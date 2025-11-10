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
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Startup, ScreenParams } from '@/types'; // Import Startup and ScreenParams from shared types

interface ManageStartupScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  userProfileId: string;
  userProfileName: string;
  userProfileEmail: string;
  startupId?: string;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  userProfileProAccount: boolean;
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
  pitch: z.string().min(50, { message: "Pitch must be at least 50 characters." }).max(1000, { message: "Pitch cannot exceed 1000 characters." }),
  description: z.string().max(1000, { message: "Description cannot exceed 1000 characters." }).nullable().optional(),
  category: z.enum(startupCategories as [string, ...string[]], { message: "Please select a valid category." }),
  location: z.string().min(2, { message: "Location is required." }),
  amount_sought: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, { message: "Amount must be a positive number." }).nullable()
  ).optional(),
  currency: z.enum(currencies as [string, ...string[]], { message: "Please select a valid currency." }).nullable().optional(),
  funding_stage: z.enum(fundingStages as [string, ...string[]], { message: "Please select a valid funding stage." }).nullable().optional(),
});

const ManageStartupScreen: React.FC<ManageStartupScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  userProfileName,
  userProfileEmail,
  startupId,
  logActivity,
  userProfileProAccount,
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasExistingStartup, setHasExistingStartup] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      tagline: '',
      pitch: '',
      description: undefined,
      category: undefined,
      location: '',
      amount_sought: undefined,
      currency: undefined,
      funding_stage: undefined,
    },
  });

  useEffect(() => {
    const checkExistingStartup = async () => {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('startups')
        .select('id')
        .eq('founder_id', userProfileId);

      if (error) {
        console.error("Error checking for existing startup:", error);
        toast.error("Failed to check for existing startups.");
        setInitialLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setHasExistingStartup(true);
        if (!startupId && !userProfileProAccount) {
          setCurrentScreen('upgradeToPro');
          return;
        }
      } else {
        setHasExistingStartup(false);
      }

      if (startupId) {
        const { data: startupData, error: fetchError } = await supabase
          .from('startups')
          .select('*')
          .eq('id', startupId)
          .single();

        if (fetchError) {
          toast.error("Failed to load startup data: " + fetchError.message);
          console.error("Error fetching startup:", fetchError);
          setCurrentScreen('home');
        } else if (startupData) {
          form.reset({
            name: startupData.name,
            logo: startupData.logo,
            tagline: startupData.tagline,
            pitch: startupData.pitch,
            description: startupData.description || undefined, // Convert null to undefined for optional fields
            category: startupData.category,
            location: startupData.location,
            amount_sought: startupData.amount_sought ?? undefined, // Use nullish coalescing
            currency: startupData.currency ?? undefined, // Use nullish coalescing
            funding_stage: startupData.funding_stage ?? undefined, // Use nullish coalescing
          });
        }
      }
      setInitialLoading(false);
    };
    checkExistingStartup();
  }, [startupId, userProfileId, userProfileProAccount, setCurrentScreen, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (!startupId && hasExistingStartup && !userProfileProAccount) {
      toast.error("You can only list one startup with a free account. Please upgrade to Pro.");
      setCurrentScreen('upgradeToPro');
      setLoading(false);
      return;
    }

    const startupData = {
      name: values.name,
      logo: values.logo,
      tagline: values.tagline,
      pitch: values.pitch,
      description: values.description || null, // Can be null
      category: values.category,
      location: values.location,
      amount_sought: values.amount_sought || null, // Can be null
      currency: values.currency || null, // Can be null
      funding_stage: values.funding_stage || null, // Can be null
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
              },
            },
          });

          if (aiError) {
            console.error("Error invoking AI analysis function:", aiError);
            toast.error("AI analysis failed: " + aiError.message);
          } else if (aiAnalysis) {
            console.log("AI Analysis Result:", aiAnalysis);
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
            {startupId ? 'Edit Your Startup' : 'List Your Startup'}
          </h2>
          <Button type="submit" form="startup-form" disabled={loading} size="sm" className="bg-gradient-to-r from-purple-700 to-teal-600 text-white" aria-label={startupId ? 'Save changes' : 'Submit listing'}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              startupId ? 'Save Changes' : 'Launch Startup'
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Form {...form}>
          <form id="startup-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
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
                        placeholder="What's your startup's name?"
                        className="peer w-full h-12 px-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        aria-label="Startup name"
                      />
                      <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Logo (Emoji)</FormLabel>
                    <div className="relative flex items-center gap-3">
                      <Input
                        {...field}
                        type="text"
                        placeholder="Pick a vibe! Your startup's emoji logo."
                        maxLength={2}
                        className="peer flex-1 h-12 px-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        aria-label="Startup logo emoji"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                      {field.value && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-2xl dark:bg-gray-700">
                          {field.value}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
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
                        placeholder="Your startup's one-liner. Make it catchy!"
                        className="peer w-full h-12 px-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        aria-label="Startup tagline"
                      />
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="pitch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Your Elevator Pitch (Required)</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="What problem are you solving and how? Keep it concise and impactful!"
                      className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup pitch"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Full Description (Optional)</FormLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ''} // Use nullish coalescing for value
                      placeholder="Dive deeper! Tell us more about your vision, team, market, and what makes you unique."
                      className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                      aria-label="Startup description"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? ''} aria-label="Select startup category">
                      <FormControl>
                        <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                          <SelectValue placeholder="What industry are you disrupting?" />
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
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
                        placeholder="Where are you building the future?"
                        className="peer w-full h-12 px-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        aria-label="Startup location"
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
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
                        placeholder="How much capital are you seeking? (e.g., 500000)"
                        className="peer w-full h-12 px-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        value={field.value ?? ''} // Use nullish coalescing for value
                        aria-label="Amount to be raised"
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? ''} aria-label="Select currency">
                      <FormControl>
                        <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                          <SelectValue placeholder="What currency are you raising in?" />
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <FormField
                control={form.control}
                name="funding_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-50">Funding Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? ''} aria-label="Select funding stage">
                      <FormControl>
                        <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500">
                          <SelectValue placeholder="What's your current funding stage?" />
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
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ManageStartupScreen;