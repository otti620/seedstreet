"use client";

import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
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

interface AuthScreenProps {
  setCurrentScreen: (screen: string) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserRole: (role: string | null) => void;
}

const authSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentScreen, setIsLoggedIn, setUserRole }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleAuth = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    let authError = null;

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
        // Fetch user role and navigate
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profileError) {
          toast.error("Failed to fetch user role after login: " + profileError.message);
          setCurrentScreen('roleSelector'); // Still go to role selector if profile fetch fails
        } else if (profileData?.role) {
          setUserRole(profileData.role);
          setCurrentScreen('home');
        } else {
          setCurrentScreen('roleSelector');
        }
      }
    }

    if (authError) {
      toast.error(authError.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col dark:bg-gray-950">
      {/* Hero Section */}
      <div className="h-2/5 bg-gradient-to-br from-purple-700 to-teal-500 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl opacity-30 animate-float-delay-2s" />
        </div>
        
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-16 h-16">
              <defs>
                <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6B21A8' }} />
                  <stop offset="100%" style={{ stopColor: '#14B8A6' }} />
                </linearGradient>
              </defs>
              <path d="M 70 35 C 70 25, 60 20, 50 20 C 40 20, 30 25, 30 35 C 30 45, 40 50, 50 55 C 60 60, 70 65, 70 75 C 70 85, 60 90, 50 90 C 40 90, 30 85, 30 75" fill="none" stroke="url(#sGrad)" strokeWidth="12" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Seedstreet</h1>
          <p className="text-white/80 text-sm mt-2">Where startups meet believers</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-10 p-6 overflow-y-auto dark:bg-gray-900">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back, legend'} 👋
            </h2>
            <p className="text-sm text-gray-500">Join 650+ investors and founders</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              {isSignUp && (
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
                        <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Full name</Label>
                        <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                      <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Email</Label>
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              />

              <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" aria-label={isSignUp ? 'Create Account' : 'Log In'}>
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Log In')}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
            <button 
              onClick={() => {
                setIsSignUp(prev => !prev); // Reverted form.reset()
              }} 
              className="font-semibold bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent cursor-pointer relative z-10 block mx-auto dark:text-purple-400" // Reverted styling
              aria-label={isSignUp ? 'Log In' : 'Sign Up'}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          {isSignUp && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              By signing up, you agree to our <span className="underline">Terms & Privacy Policy</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;