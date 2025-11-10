"use client";

import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { Profile, ScreenParams } from '@/types'; // Import types from the shared file

interface AuthScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type SignUpFormInputs = z.infer<typeof signUpSchema>;
type AuthFormInputs = LoginFormInputs | SignUpFormInputs; // Use union type for form inputs

function AuthScreen({ setCurrentScreen, setIsLoggedIn, fetchUserProfile }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AuthFormInputs>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
    defaultValues: isSignUp
      ? { name: "", email: "", password: "" }
      : { email: "", password: "" },
  });

  // Reset form when isSignUp changes
  useEffect(() => {
    form.reset(isSignUp
      ? { name: "", email: "", password: "" }
      : { email: "", password: "" });
  }, [isSignUp, form]);


  const handleAuth = async (values: AuthFormInputs) => {
    setLoading(true);
    let authError = null;

    try {
      if (isSignUp) {
        const signUpValues = values as SignUpFormInputs;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: signUpValues.email,
          password: signUpValues.password,
          options: {
            data: {
              name: signUpValues.name,
              role: null,
            },
          },
        });
        authError = signUpError;
        if (!authError && data?.user) {
          toast.success("Account created! Please check your email to verify.");
          setIsLoggedIn(true);
          await fetchUserProfile(data.user.id);
        }
      } else {
        const loginValues = values as LoginFormInputs;
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: loginValues.email,
          password: loginValues.password,
        });
        authError = signInError;
        if (!authError && data?.user) {
          toast.success("Logged in successfully!");
          setIsLoggedIn(true);
          await fetchUserProfile(data.user.id);
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
              <> {/* Added React.Fragment here */}
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
                  />
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
              </> {/* Closed React.Fragment here */}
            </form>
          </Form>

          <div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : 'New here, fam?'}{' '}
            </p>
            <button
              onClick={() => {
                setIsSignUp(prev => {
                  const newState = !prev;
                  form.reset(newState
                    ? { name: "", email: "", password: "" }
                    : { email: "", password: "" });
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
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;