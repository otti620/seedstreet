"use client";

import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
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
import { motion } from 'framer-motion'; // Import motion for animations

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface AuthScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  setIsLoggedIn: (loggedIn: boolean) => void;
}

// Define separate schemas for login and signup
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

// Infer types for form data
type LoginFormInputs = z.infer<typeof loginSchema>;
type SignUpFormInputs = z.infer<typeof signUpSchema>;
type AuthFormInputs = LoginFormInputs & Partial<SignUpFormInputs>; // Combined type for useForm

const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentScreen, setIsLoggedIn }) => {
  const [isSignUp, setIsSignUp] = useState(false); // Changed default to false for login
  const [loading, setLoading] = useState(false);

  const form = useForm<AuthFormInputs>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema), // Dynamically choose schema
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleAuth = async (values: AuthFormInputs) => {
    setLoading(true);
    let authError = null;

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              role: null, // Role will be set in role selector
            },
          },
        });
        authError = signUpError;
        if (!authError && data?.user) {
          toast.success("Account created! Please check your email to verify.");
          setIsLoggedIn(true);
          setCurrentScreen('roleSelector');
        }
      } else { // Log In path
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        authError = signInError;
        if (!authError && data?.user) {
          toast.success("Logged in successfully!");
          setIsLoggedIn(true);
          // The useAppData hook will now fetch the full profile and determine the next screen
          // based on role and onboarding_complete status.
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      authError = { message: error.message || "An unexpected authentication error occurred." };
    } finally {
      if (authError) {
        toast.error(authError.message);
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setCurrentScreen('authAction', { authActionType: 'forgotPassword' });
  };

  return (
    <div className="fixed inset-0 flex flex-col dark:bg-gray-950">
      {/* Hero Section */}
      <div className="h-2/5 bg-gradient-to-br from-purple-700 to-teal-500 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 0.2, rotate: 0 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: 30 }}
            animate={{ scale: 1, opacity: 0.2, rotate: 0 }}
            transition={{ duration: 7, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl"
          />
        </div>
        
        <div className="relative z-10 text-center text-white">
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl shadow-xl flex items-center justify-center"
          >
            <svg viewBox="0 0 100 120" className="w-16 h-16">
              <defs>
                <linearGradient id="sGrad" x1="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6B21A8' }} />
                  <stop offset="100%" style={{ stopColor: '#14B8A6' }} />
                </linearGradient>
              </defs>
              <path d="M 70 35 C 70 25, 60 20, 50 20 C 40 20, 30 25, 30 35 C 30 45, 40 50, 50 55 C 60 60, 70 65, 70 75 C 70 85, 60 90, 50 90 C 40 90, 30 85, 30 75" fill="none" stroke="url(#sGrad)" strokeWidth="12" strokeLinecap="round" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold">Seedstreet</h1>
          <p className="text-white/80 text-sm mt-2">Where startups meet believers</p>
        </div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }}
        className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-10 p-6 overflow-y-auto dark:bg-gray-900"
      >
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent mb-2">
              {isSignUp ? 'Join the Future' : 'Welcome Back, Visionary!'} 👋
            </h2>
            <p className="text-sm text-gray-500">Connect with 650+ innovators and investors</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <Input
                            {...field}
                            type="text"
                            placeholder=" "
                            className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                            aria-label="Full name"
                          />
                          <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Your Full Name</Label>
                          <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: isSignUp ? 0.2 : 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <Input
                          {...field}
                          type="email"
                          placeholder=" "
                          className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                          aria-label="Email"
                        />
                        <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Email Address</Label>
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: isSignUp ? 0.3 : 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <Input
                          {...field}
                          type="password"
                          placeholder=" "
                          className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                          aria-label="Password"
                        />
                        <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Password</Label>
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                </motion.div>
              </motion.div>

              {!isSignUp && (
                <motion.button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-700 hover:underline text-right block w-full dark:text-purple-400"
                  aria-label="Forgot password?"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  Forgot your password?
                </motion.button>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: isSignUp ? 0.4 : 0.4 }}
              >
                <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" aria-label={isSignUp ? 'Create Account' : 'Log In'}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    isSignUp ? 'Create Account' : 'Log In'
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : 'New here, fam?'}{' '}
          </p>
          <button 
            onClick={() => {
              setIsSignUp(prev => {
                const newState = !prev;
                form.reset({ // Reset form fields on toggle
                  name: "",
                  email: "",
                  password: "",
                });
                return newState;
              });
            }} 
            className="font-semibold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent cursor-pointer relative z-10 block mx-auto dark:text-purple-400" 
            aria-label={isSignUp ? 'Log In' : 'Sign Up'}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>

          {isSignUp && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              By signing up, you agree to our <button onClick={() => setCurrentScreen('termsAndPrivacy')} className="underline text-purple-700 dark:text-purple-400" aria-label="View Terms & Privacy Policy">Terms & Privacy Policy</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
```
<dyad-write path="src/components/screens/RoleSelectorScreen.tsx" description="Refining RoleSelectorScreen UI with improved card styling and animations.">
"use client";

import React, { useState } from 'react';
import { Rocket, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; // Import motion

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface RoleSelectorScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  setActiveTab: (tab: string) => void;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<any>; // Updated to accept userId and return any
  investorCount: number;
  founderCount: number;
}

const RoleSelectorScreen: React.FC<RoleSelectorScreenProps> = ({
  setCurrentScreen,
  setActiveTab,
  logActivity,
  fetchUserProfile,
  investorCount,
  founderCount,
}) => {
  const [selectedRole, setSelectedRole] = useState<'investor' | 'founder' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }

    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Authentication error. Please log in again.");
      setLoading(false);
      setCurrentScreen('auth');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: selectedRole, onboarding_complete: true, show_welcome_flyer: true }) // Set show_welcome_flyer to true
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to save role: " + error.message);
      console.error("Error saving role:", error);
    } else {
      toast.success(`Welcome, ${selectedRole}!`);
      logActivity('role_selected', `Selected role: ${selectedRole}`, user.id, selectedRole === 'investor' ? '💰' : '💡');
      await fetchUserProfile(user.id); // Re-fetch user profile to update local state
      setCurrentScreen('home'); // Navigate to home, which will then redirect based on profile
      setActiveTab('home');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-teal-50 flex flex-col items-center justify-center p-6 overflow-hidden dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3 dark:text-gray-50">
          Choose Your Path
        </h1>
        <p className="text-lg text-gray-600 opacity-90 dark:text-gray-300">
          Are you here to invest or to build?
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Investor Card */}
        <motion.button 
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`group relative flex-1 bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 active:scale-95 flex flex-col items-center justify-center ${
            selectedRole === 'investor' ? 'border-4 border-white ring-4 ring-white/50' : 'border-2 border-white/20 hover:border-white/50'
          }`}
          onClick={() => setSelectedRole('investor')}
          aria-label="Select role: Investor"
        >
          {selectedRole === 'investor' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 bg-white text-purple-700 rounded-full p-1 shadow-lg"
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
          <div className="relative space-y-6">
            <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-5xl animate-float">
              💰
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">I want to invest</h3>
              <p className="text-white/80 text-sm">Back startups and watch your impact grow</p>
            </div>

            <div className="inline-block px-4 py-1.5 bg-teal-500/30 border border-teal-400/40 rounded-full text-teal-100 text-sm font-semibold">
              Join {investorCount.toLocaleString()}+ investors
            </div>
          </div>
        </motion.button>

        {/* Founder Card */}
        <motion.button 
          whileHover={{ scale: 1.03, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`group relative flex-1 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 active:scale-95 flex flex-col items-center justify-center ${
            selectedRole === 'founder' ? 'border-4 border-white ring-4 ring-white/50' : 'border-2 border-white/20 hover:border-white/50'
          }`}
          onClick={() => setSelectedRole('founder')}
          aria-label="Select role: Founder"
        >
          {selectedRole === 'founder' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 bg-white text-teal-600 rounded-full p-1 shadow-lg"
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
          <div className="relative space-y-6">
            <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-5xl animate-float-delay-1s">
              💡
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">I'm building something</h3>
              <p className="text-white/80 text-sm">Get funded by people who actually get it</p>
            </div>

            <div className="inline-block px-4 py-1.5 bg-purple-500/30 border border-purple-400/40 rounded-full text-purple-100 text-sm font-semibold">
              Join {founderCount.toLocaleString()}+ founders
            </div>
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 w-full max-w-xs"
      >
        <Button
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="w-full h-14 bg-white text-purple-700 rounded-xl text-lg font-bold hover:bg-gray-100 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed dark:text-purple-900"
          aria-label="Continue with selected role"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Continue'
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default RoleSelectorScreen;
```
<dyad-write path="src/components/screens/home/InvestorFeed.tsx" description="Refining InvestorFeed UI with improved card styling, search/filter, and animations.">
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, MessageCircle, Bookmark, Check, Bell, Search, Filter, BrainCircuit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; // Import Input for search

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
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface InvestorFeedProps {
  startups: Startup[];
  bookmarkedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  loading: boolean;
  handleStartChat: (startup: Startup) => Promise<void>;
}

const startupCategories = [
  "AgriTech", "AI/ML", "CleanTech", "EdTech", "FinTech", "Food & Beverage",
  "HealthTech", "Logistics", "Media & Entertainment", "PropTech", "SaaS",
  "Social Impact", "E-commerce", "Other"
];

const InvestorFeed: React.FC<InvestorFeedProps> = ({
  startups,
  bookmarkedStartups,
  toggleBookmark,
  setCurrentScreen,
  loading,
  handleStartChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const filteredStartups = startups.filter(startup => {
    const matchesSearch =
      startup.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.tagline.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      startup.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? startup.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const renderStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Discover Startups</h1>
            <p className="text-sm text-gray-500">Find your next investment</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="View notifications">
            <Bell className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search startups..."
              className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search startups"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selectedCategory ? 'bg-purple-700 text-white dark:bg-purple-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label="Filter by category">
                <Filter className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)} className={!selectedCategory ? 'font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-50' : 'dark:text-gray-50'}>
                All Categories
              </DropdownMenuItem>
              {startupCategories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-50' : 'dark:text-gray-50'}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : (
          filteredStartups.length > 0 ? (
            filteredStartups.map(startup => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                    {startup.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                      <Check className="w-4 h-4 text-teal-600" />
                      {startup.ai_risk_score !== null && (
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            startup.ai_risk_score < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            startup.ai_risk_score < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          <BrainCircuit className="w-3 h-3" />
                          Risk: {startup.ai_risk_score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{startup.tagline}</p>
                  </div>
                  <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${bookmarkedStartups.includes(startup.id) ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={bookmarkedStartups.includes(startup.id) ? "Remove bookmark" : "Bookmark startup"}>
                    <Bookmark className="w-5 h-5" fill={bookmarkedStartups.includes(startup.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2 dark:text-gray-200">{startup.description}</p>

                <div className="flex gap-4 mb-4 p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl dark:from-gray-700 dark:to-gray-700">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.room_members}</div>
                    <div className="text-xs text-gray-500 uppercase">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.active_chats}</div>
                    <div className="text-xs text-gray-500 uppercase">Active Chats</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.interests}</div>
                    <div className="text-xs text-gray-500 uppercase">Interested</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleStartChat(startup)} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`Start chat with ${startup.founder_name}`}>
                    <MessageCircle className="w-4 h-4" />
                    Slide in 💬
                  </button>
                  <button onClick={() => {
                    setCurrentScreen('startupDetail', { startupId: startup.id }); // Use setCurrentScreen
                  }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`View details for ${startup.name}`}>
                    <Rocket className="w-4 h-4" />
                    Join room 🚀
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No startups found</h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default InvestorFeed;
```
<dyad-write path="src/components/screens/home/FounderDashboard.tsx" description="Refining FounderDashboard UI with improved card styling and animations.">
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Bell, Rocket, Check, Bookmark, Eye } from 'lucide-react'; // Import Bookmark and Eye icons
import BottomNav from '../../BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

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
  views: number; // Added views to the interface
}

interface ActivityLog { // New interface for activity log entries
  id: string;
  user_id: string;
  type: string; // e.g., 'startup_listed', 'chat_started', 'profile_updated', 'bookmark_added'
  description: string;
  timestamp: string;
  entity_id: string | null; // ID of the related entity (startup, chat, etc.)
  icon: string | null; // Lucide icon name or emoji
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface FounderDashboardProps {
  setActiveTab: (tab: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  userProfileId: string;
  loading: boolean;
  recentActivities: ActivityLog[]; // New prop for recent activities
}

const FounderDashboard: React.FC<FounderDashboardProps> = ({
  setActiveTab,
  setCurrentScreen,
  userProfileId,
  loading,
  recentActivities, // Destructure recentActivities
}) => {
  const [founderStartup, setFounderStartup] = useState<Startup | null>(null);
  const [startupLoading, setStartupLoading] = useState(true);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0); // State for rotating activities

  const fetchFounderStartup = async () => {
    setStartupLoading(true);
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('founder_id', userProfileId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching founder's startup:", error);
      toast.error("Failed to load your startup data.");
      setFounderStartup(null);
    } else if (data) {
      setFounderStartup(data as Startup);
    } else {
      setFounderStartup(null);
    }
    setStartupLoading(false);
  };

  useEffect(() => {
    if (userProfileId) {
      fetchFounderStartup();

      // Real-time subscription for the founder's specific startup
      const channel = supabase
        .channel(`founder_startup:${userProfileId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'startups', filter: `founder_id=eq.${userProfileId}` }, payload => {
          // When a change occurs, re-fetch the specific startup data
          fetchFounderStartup();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfileId]);

  // Effect for rotating recent activities
  useEffect(() => {
    if (recentActivities.length > 1) {
      const timer = setInterval(() => {
        setCurrentActivityIndex(prevIndex =>
          (prevIndex + 1) % recentActivities.length
        );
      }, 5000); // Change activity every 5 seconds
      return () => clearInterval(timer);
    }
  }, [recentActivities]);

  const renderFounderStatsSkeleton = () => (
    <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-4 bg-white/20" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 space-y-2">
            <Skeleton className="h-6 w-1/2 bg-white/20" />
            <Skeleton className="h-3 w-3/4 bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderYourStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-16 rounded-xl" />
        <Skeleton className="flex-1 h-16 rounded-xl" />
      </div>
    </div>
  );

  const renderRecentActivitySkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <Skeleton className="h-5 w-1/2 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 1 }).map((_, i) => ( // Only one skeleton for rotating display
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getActivityIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-5 h-5 text-white" />;
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-white" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5 text-white" />;
      case 'Eye': return <Eye className="w-5 h-5 text-white" />;
      case '💰': return <span className="text-white text-sm">💰</span>;
      case '💡': return <span className="text-white text-sm">💡</span>;
      default: return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const currentActivity = recentActivities[currentActivityIndex];

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Your Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your startup</p>
          </div>
          <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900 dark:hover:bg-purple-800" aria-label="View notifications">
            <Bell className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {startupLoading || loading ? (
          <div className="space-y-6">
            {renderFounderStatsSkeleton()}
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            {renderYourStartupCardSkeleton()}
            {renderRecentActivitySkeleton()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Founder Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <h2 className="text-lg font-semibold mb-4">Your Startup Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{founderStartup?.active_chats || 0}</div>
                  <div className="text-xs opacity-80">Active Chats</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{founderStartup?.room_members || 0}</div>
                  <div className="text-xs opacity-80">Room Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{founderStartup?.interests || 0}</div>
                  <div className="text-xs opacity-80">Interested</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentScreen('manageStartup')}
                className="h-24 bg-white rounded-2xl border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-50 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 dark:bg-gray-800 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700 shadow-sm"
                aria-label={founderStartup ? 'Update startup listing' : 'List your startup'}
              >
                <Plus className="w-6 h-6" />
                {founderStartup ? 'Update Listing' : 'List Startup'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('chats')}
                className="h-24 bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2 shadow-lg"
                aria-label="View chats"
              >
                <MessageCircle className="w-6 h-6" />
                View Chats
              </motion.button>
            </div>

            {/* Your Startup Card */}
            {founderStartup ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50">Your Startup</h3>
                  <button
                    onClick={() => setCurrentScreen('manageStartup', { startupId: founderStartup.id })}
                    className="text-purple-700 text-sm font-medium hover:underline dark:text-purple-400"
                    aria-label={`Edit ${founderStartup.name}`}
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                    {founderStartup.logo}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-50">{founderStartup.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{founderStartup.tagline}</p>
                    <p className={`text-xs font-medium mt-1 ${
                      founderStartup.status === 'Approved' ? 'text-green-600' :
                      founderStartup.status === 'Pending' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      Status: {founderStartup.status} {founderStartup.status === 'Approved' && <Check className="inline-block w-3 h-3" />}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 dark:bg-gray-700 text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{founderStartup.views || 0}</div> {/* Use actual views */}
                    <div className="text-xs text-gray-500">Total Views</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 dark:bg-gray-700 text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{founderStartup.views || 0}</div> {/* Using total views for "this week" as placeholder */}
                    <div className="text-xs text-gray-500">This Week</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center space-y-4 dark:bg-gray-800 dark:border-gray-700">
                <Rocket className="w-16 h-16 text-gray-400 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">No Startup Listed Yet</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">Get started by listing your amazing startup!</p>
                <button
                  onClick={() => setCurrentScreen('manageStartup')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all"
                  aria-label="List your startup now"
                >
                  List Your Startup Now
                </button>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  <AnimatePresence mode="wait">
                    {currentActivity && (
                      <motion.div
                        key={currentActivity.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-700"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-700 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs">
                          {getActivityIcon(currentActivity.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{currentActivity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(currentActivity.timestamp).toLocaleString()}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="text-center text-gray-500 py-4 dark:text-gray-400">No recent activity.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FounderDashboard;
```
<dyad-write path="src/components/screens/ProfileScreen.tsx" description="Refining ProfileScreen UI with improved card styling and animations.">
"use client";

import React from 'react';
import Image from 'next/image';
import { User, Bell, Bookmark, Settings, MessageCircle, LogOut, ShoppingBag, ShieldCheck, DollarSign } from 'lucide-react'; // Import ShieldCheck and DollarSign
import { toast } from 'sonner';
import BottomNav from '../BottomNav';
import MenuItem from '../MenuItem';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '@/lib/default-avatars';
import { motion } from 'framer-motion';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[];
  interested_startups: string[];
  bio: string | null;
  location: string | null;
  phone: string | null;
  total_committed: number;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface ProfileScreenProps {
  userProfile: Profile | null;
  userRole: string | null;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  setActiveTab: (tab: string) => void;
  activeTab: string;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserProfile: (profile: Profile | null) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  userRole,
  bookmarkedStartups,
  interestedStartups,
  setCurrentScreen,
  setActiveTab,
  activeTab,
  setIsLoggedIn,
  setUserProfile,
}) => {
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-teal-600 px-6 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl animate-float-delay-2s" />
        </div>
        <div className="flex justify-end mb-4 relative z-10">
          <button onClick={() => setCurrentScreen('settings')} className="text-white hover:text-gray-200 transition-colors" aria-label="Settings">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center text-white relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-purple-700 text-4xl font-bold mb-3 shadow-xl relative overflow-hidden border-4 border-white ring-4 ring-purple-300/50 dark:ring-teal-300/50"
          >
            {userProfile?.avatar_id ? (
              <Image src={getAvatarUrl(userProfile.avatar_id)} alt="User Avatar" layout="fill" objectFit="cover" className="rounded-full" />
            ) : (
              userProfile?.name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'
            )}
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">{userProfile?.name || userProfile?.email || 'User Name'}</h2>
          <p className="text-white/80 text-sm mb-3">{userProfile?.email || 'user@email.com'}</p>
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
            {userRole === 'investor' ? '💰 Investor' : userRole === 'founder' ? '💡 Founder' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-12 overflow-y-auto px-6 pb-24">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-50">Your Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{bookmarkedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Bookmarks</div>
            </div>
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{interestedStartups.length}</div>
              <div className="text-xs text-gray-500 mt-1">Interested</div>
            </div>
            <div className="text-center bg-gray-50 p-3 rounded-xl dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {userProfile?.total_committed ? `$${userProfile.total_committed.toLocaleString()}` : '$0'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Committed</div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 dark:bg-gray-800 dark:border-gray-700"
        >
          <MenuItem icon={<User />} label="Edit Profile" onClick={() => setCurrentScreen('editProfile')} />
          <MenuItem icon={<Bell />} label="Notifications" onClick={() => setCurrentScreen('notifications')} />
          <MenuItem icon={<Bookmark />} label="Saved Startups" count={bookmarkedStartups.length} onClick={() => setCurrentScreen('savedStartups')} />
          <MenuItem icon={<ShoppingBag />} label="Merch Store" onClick={() => setCurrentScreen('merchStore')} />
          <MenuItem icon={<Settings />} label="Settings" onClick={() => setCurrentScreen('settings')} />
          <MenuItem icon={<MessageCircle />} label="Help & Support" onClick={() => setCurrentScreen('helpAndSupport')} />
          {isAdmin && (
            <MenuItem icon={<ShieldCheck />} label="Admin Dashboard" onClick={() => setCurrentScreen('adminDashboard')} />
          )}
        </motion.div>

        {/* Logout */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              toast.error("Failed to log out: " + error.message);
            } else {
              toast.success("Logged out successfully!");
              setIsLoggedIn(false);
              setUserProfile(null);
              setCurrentScreen('auth');
            }
          }}
          className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </motion.button>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default ProfileScreen;
```
<dyad-write path="src/components/screens/SavedStartupsScreen.tsx" description="Refining SavedStartupsScreen UI with improved card styling and animations.">
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Bookmark, Eye, MessageCircle, Rocket, Search, Filter, BrainCircuit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Define TypeScript interfaces for data structures
interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string | null;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface SavedStartupsScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  userProfileId: string;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  // Removed setSelectedStartup prop
  handleStartChat: (startup: Startup) => Promise<void>;
}

const SavedStartupsScreen: React.FC<SavedStartupsScreenProps> = ({
  setCurrentScreen,
  userProfileId,
  bookmarkedStartups,
  interestedStartups,
  toggleBookmark,
  toggleInterest,
  // Removed setSelectedStartup from destructuring
  handleStartChat,
}) => {
  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'bookmarked' | 'interested'>('bookmarked');

  useEffect(() => {
    const fetchSavedStartups = async () => {
      setLoading(true);
      let startupIdsToFetch: string[] = [];
      if (filter === 'bookmarked') {
        startupIdsToFetch = bookmarkedStartups;
      } else if (filter === 'interested') {
        startupIdsToFetch = interestedStartups;
      }

      if (startupIdsToFetch.length === 0) {
        setSavedStartups([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .in('id', startupIdsToFetch);

      if (error) {
        toast.error("Failed to load saved startups: " + error.message);
        console.error("Error fetching saved startups:", error);
        setSavedStartups([]);
      } else if (data) {
        // Sort to maintain order if needed, or just display as fetched
        setSavedStartups(data as Startup[]);
      }
      setLoading(false);
    };

    fetchSavedStartups();
  }, [bookmarkedStartups, interestedStartups, filter]);

  const renderStartupCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-xl dark:bg-gray-700">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to profile">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Saved Startups</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex gap-2 dark:bg-gray-900 dark:border-gray-800">
        <button
          onClick={() => setFilter('bookmarked')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filter === 'bookmarked'
              ? 'bg-purple-700 text-white shadow-md dark:bg-purple-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Bookmarks ({bookmarkedStartups.length})
        </button>
        <button
          onClick={() => setFilter('interested')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            filter === 'interested'
              ? 'bg-teal-600 text-white shadow-md dark:bg-teal-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Interested ({interestedStartups.length})
        </button>
      </div>

      {/* Saved Startups List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <React.Fragment key={i}>{renderStartupCardSkeleton()}</React.Fragment>)
        ) : savedStartups.length > 0 ? (
          savedStartups.map(startup => {
            const isBookmarked = bookmarkedStartups.includes(startup.id);
            const isInterested = interestedStartups.includes(startup.id);

            return (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden">
                    {startup.logo.startsWith('http') ? (
                      <Image src={startup.logo} alt={`${startup.name} logo`} layout="fill" objectFit="cover" className="rounded-xl" />
                    ) : (
                      startup.logo
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-50">{startup.name}</h3>
                      {startup.ai_risk_score !== null && (
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            startup.ai_risk_score < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            startup.ai_risk_score < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          <BrainCircuit className="w-3 h-3" />
                          Risk: {startup.ai_risk_score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{startup.tagline}</p>
                  </div>
                  <button onClick={() => toggleBookmark(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isBookmarked ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark startup"}>
                    <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2 dark:text-gray-200">{startup.description}</p>

                <div className="flex gap-4 mb-4 p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl dark:from-gray-700 dark:to-gray-700">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.room_members}</div>
                    <div className="text-xs text-gray-500 uppercase">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.active_chats}</div>
                    <div className="text-xs text-gray-500 uppercase">Active Chats</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{startup.interests}</div>
                    <div className="text-xs text-gray-500 uppercase">Interested</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleStartChat(startup)} className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" aria-label={`Start chat with ${startup.founder_name}`}>
                    <MessageCircle className="w-4 h-4" />
                    Slide in 💬
                  </button>
                  <button onClick={() => {
                    setCurrentScreen('startupDetail', { startupId: startup.id }); // Use setCurrentScreen
                  }} className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-gray-700" aria-label={`View details for ${startup.name}`}>
                    <Rocket className="w-4 h-4" />
                    Join room 🚀
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl dark:bg-gray-800">
              {filter === 'bookmarked' ? '🔖' : '👀'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-gray-50">No {filter} startups</h3>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              {filter === 'bookmarked'
                ? 'You haven\'t bookmarked any startups yet.'
                : 'You haven\'t signaled interest in any startups yet.'}
            </p>
            <button onClick={() => setCurrentScreen('home')} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all">
              Discover Startups
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedStartupsScreen;
```
<dyad-write path="src/components/screens/StartupDetailScreen.tsx" description="Updating StartupDetailScreen to use the new centralized navigation and parameter passing, and improving UI.">
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  pitch: string;
  description: string | null;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
  amount_raised: number;
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
}

interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: any;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

interface StartupDetailScreenProps {
  selectedStartup: Startup;
  bookmarkedStartups: string[];
  interestedStartups: string[];
  toggleBookmark: (startupId: string) => void;
  toggleInterest: (startupId: string) => void;
  setCurrentScreen: (screen: string, params?: ScreenParams) => void; // Updated to accept params
  activeTab: string;
  userRole: string | null;
  setActiveTab: (tab: string) => void;
  handleStartChat: (startup: Startup) => Promise<void>;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  userProfile: Profile | null;
}

// Dynamically import the content component
const DynamicStartupDetailContent = dynamic(
  () => import('./StartupDetailContent').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
        <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    ),
  }
);

const StartupDetailScreen: React.FC<StartupDetailScreenProps> = (props) => {
  return <DynamicStartupDetailContent {...props} />;
};

export default StartupDetailScreen;