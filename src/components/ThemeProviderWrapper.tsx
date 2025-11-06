"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";
import { Toaster } from "sonner";

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <GlobalLoadingIndicator />
      {children}
      <Toaster richColors position="top-center" />
    </NextThemesProvider>
  );
}