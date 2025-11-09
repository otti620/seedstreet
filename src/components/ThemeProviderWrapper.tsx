"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// We are no longer relying solely on extending ThemeProviderProps,
// but explicitly defining the common props to ensure they are recognized.

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  // Add any other props from next-themes' ThemeProviderProps that you might use,
  // e.g., storageKey?: string; themes?: string[]; value?: Record<string, string>; nonce?: string;
}

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderWrapperProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}