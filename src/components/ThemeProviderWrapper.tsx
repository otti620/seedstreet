"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"; // Import ThemeProviderProps directly

interface ThemeProviderWrapperProps extends ThemeProviderProps {
  children: React.ReactNode; // Explicitly add children prop
}

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderWrapperProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}