"use client";

import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
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
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface AuthActionScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
  authActionType: 'forgotPassword' | 'changePassword';
}

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const changePasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your new password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;
type ChangePasswordFormInputs = z.infer<typeof changePasswordSchema>;

const AuthActionScreen: React.FC<AuthActionScreenProps> = ({ setCurrentScreen, authActionType }) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Use 'any' for the form's generic parameter to simplify complex conditional typing
  const form = useForm<any>({
    resolver: zodResolver(authActionType === 'forgotPassword' ? forgotPasswordSchema : changePasswordSchema) as any, // Explicitly cast resolver to any
    defaultValues: {
      ...(authActionType === 'forgotPassword' ? { email: '' } : { password: '', confirmPassword: '' }),
    },
  });

  const handleForgotPassword = async (values: ForgotPasswordFormInputs) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth-callback?type=changePassword`,
    });

    if (error) {
      toast.error("Failed to send reset email: " + error.message);
      console.error("Forgot password error:", error);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setEmailSent(true);
    }
    setLoading(false);
  };

  const handleChangePassword = async (values: ChangePasswordFormInputs) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error("Failed to update password: " + error.message);
      console.error("Change password error:", error);
    } else {
      toast.success("Password updated successfully!");
      setCurrentScreen('auth');
    }
    setLoading(false);
  };

  const onSubmit = (values: any) => { // Use 'any' here for simplicity due to conditional types
    if (authActionType === 'forgotPassword') {
      handleForgotPassword(values as ForgotPasswordFormInputs);
    } else {
      handleChangePassword(values as ChangePasswordFormInputs);
    }
  };

  const title = authActionType === 'forgotPassword' ? 'Forgot Password' : 'Change Password';
  const description = authActionType === 'forgotPassword'
    ? 'Enter your email to receive a password reset link.'
    : 'Set a new password for your account.';

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('auth')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-50">{title}</h3>
          <p className="text-gray-600 mb-6 dark:text-gray-300">{description}</p>

          {emailSent && authActionType === 'forgotPassword' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center text-green-600 dark:text-green-400"
            >
              <Mail className="w-16 h-16 mx-auto mb-4" />
              <p className="font-semibold text-lg">Email sent!</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">Please check your inbox for instructions to reset your password.</p>
              <Button onClick={() => setCurrentScreen('auth')} className="mt-6 bg-gradient-to-r from-purple-700 to-teal-600 text-white">Back to Login</Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {authActionType === 'forgotPassword' && (
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
                )}

                {authActionType === 'changePassword' && (
                  <>
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
                              aria-label="New password"
                            />
                            <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">New Password</Label>
                            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <Input
                              {...field}
                              type="password"
                              placeholder=" "
                              className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
                              aria-label="Confirm new password"
                            />
                            <Label className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Confirm New Password</Label>
                            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all" aria-label={authActionType === 'forgotPassword' ? 'Send Reset Link' : 'Change Password'}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    authActionType === 'forgotPassword' ? 'Send Reset Link' : 'Change Password'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthActionScreen;