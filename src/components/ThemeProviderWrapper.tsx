"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
// Removed GlobalLoadingIndicator and Toaster imports

interface ThemeProviderWrapperProps extends ThemeProviderProps {
  // Removed showGlobalLoadingIndicator prop
}

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderWrapperProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}