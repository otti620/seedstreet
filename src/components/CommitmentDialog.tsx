"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation';
import { motion } from 'framer-motion';
import { Profile } from '@/types'; // Import Profile from the shared file

interface CommitmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startupId: string;
  startupName: string;
  startupLogo: string;
  founderId: string;
  founderName: string;
  investorId: string;
  investorName: string;
  logActivity: (type: string, description: string, entity_id?: string, icon?: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>; // Updated to accept userId and return Profile | null
  fetchStartups: () => Promise<void>;
}

const CommitmentDialog: React.FC<CommitmentDialogProps> = ({
  isOpen,
  onClose,
  startupId,
  startupName,
  startupLogo,
  founderId,
  founderName,
  investorId,
  investorName,
  logActivity,
  fetchUserProfile,
  fetchStartups,
}) => {
  const [amount, setAmount] = useState<number | ''>('');

  const { mutate: makeCommitment, loading: committing } = useSupabaseMutation(
    async (commitmentAmount: number) => {
      if (commitmentAmount <= 0) {
        throw new Error("Commitment amount must be positive.");
      }

      const { data: newCommitment, error: commitmentError } = await supabase
        .from('commitments')
        .insert({
          investor_id: investorId,
          investor_name: investorName,
          founder_id: founderId,
          founder_name: founderName,
          startup_id: startupId,
          startup_name: startupName,
          amount: commitmentAmount,
          status: 'Approved',
        })
        .select()
        .single();

      if (commitmentError) throw commitmentError;

      const { data: startupData, error: fetchStartupError } = await supabase
        .from('startups')
        .select('amount_raised')
        .eq('id', startupId)
        .single();

      if (fetchStartupError) throw fetchStartupError;

      const newAmountRaised = (startupData?.amount_raised || 0) + commitmentAmount;

      const { error: updateStartupError } = await supabase
        .from('startups')
        .update({ amount_raised: newAmountRaised })
        .eq('id', startupId);

      if (updateStartupError) throw updateStartupError;

      const { data: investorProfileData, error: fetchInvestorProfileError } = await supabase
        .from('profiles')
        .select('total_committed')
        .eq('id', investorId)
        .single();

      if (fetchInvestorProfileError) throw fetchInvestorProfileError;

      const newTotalCommitted = (investorProfileData?.total_committed || 0) + commitmentAmount;

      const { error: updateInvestorProfileError } = await supabase
        .from('profiles')
        .update({ total_committed: newTotalCommitted })
        .eq('id', investorId);

      if (updateInvestorProfileError) throw updateInvestorProfileError;

      await logActivity('commitment_made', `Committed $${commitmentAmount.toLocaleString()} to ${startupName}`, startupId, '💰');
      
      await fetchUserProfile(investorId);
      
      await fetchStartups();

      return newCommitment;
    },
    {
      onSuccess: () => {
        toast.success("Commitment made successfully! Founder has been notified.");
        setAmount('');
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to make commitment: ${error.message}`);
        console.error("Commitment error:", error);
      },
      errorMessage: "Failed to process your commitment.",
    }
  );

  const handleSubmit = () => {
    if (amount === '' || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    makeCommitment(amount);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-gray-50">Make a Commitment to {startupName}</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            Enter the amount you wish to commit to {startupName}. This action will notify the founder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="py-4"
        >
          <div className="relative">
            <Input
              id="commitment-amount"
              type="number"
              placeholder=" "
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="peer w-full h-14 px-12 border-2 border-gray-200 rounded-2xl focus:border-purple-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:focus:border-purple-500"
              aria-label="Commitment amount"
              min="1"
            />
            <Label htmlFor="commitment-amount" className="absolute left-12 top-4 text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs transition-all dark:peer-focus:text-purple-500">Commitment Amount</Label>
            <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400 peer-focus:text-purple-700 dark:peer-focus:text-purple-500" />
          </div>
        </motion.div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} disabled={committing} className="dark:text-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleSubmit} disabled={committing || amount === '' || amount <= 0} className="bg-gradient-to-r from-purple-700 to-teal-600 text-white">
              {committing ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Commit'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CommitmentDialog;