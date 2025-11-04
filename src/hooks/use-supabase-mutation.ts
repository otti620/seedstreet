"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: PostgrestError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useSupabaseMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData | null; error: PostgrestError | null }>,
  options?: UseSupabaseMutationOptions
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { data, error } = await mutationFn(variables);

      if (error) {
        setError(error);
        toast.error(options?.errorMessage || `Operation failed: ${error.message}`);
        options?.onError?.(error);
        return { data: null, error };
      }

      setData(data);
      toast.success(options?.successMessage || "Operation completed successfully!");
      options?.onSuccess?.(data);
      return { data, error: null };
    } catch (err: any) {
      const postgrestError: PostgrestError = {
        code: 'UNKNOWN',
        details: err.message,
        hint: '',
        message: err.message,
      };
      setError(postgrestError);
      toast.error(options?.errorMessage || `An unexpected error occurred: ${err.message}`);
      options?.onError?.(postgrestError);
      return { data: null, error: postgrestError };
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, loading, error, data };
};