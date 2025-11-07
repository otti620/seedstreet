"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";
import { Toaster } from "sonner";

interface ThemeProviderWrapperProps extends ThemeProviderProps {
  showGlobalLoadingIndicator?: boolean; // New prop
}

export function ThemeProviderWrapper({ children, showGlobalLoadingIndicator = false, ...props }: ThemeProviderWrapperProps) {
  return (
    <NextThemesProvider {...props}>
      <GlobalLoadingIndicator loading={showGlobalLoadingIndicator} /> {/* Pass loading prop */}
      {children}
      <Toaster richColors position="top-center" />
    </NextThemesProvider>
  );
}