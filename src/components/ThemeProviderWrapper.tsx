"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"; // Import ThemeProviderProps

// Use ThemeProviderProps directly from next-themes
export function ThemeProviderWrapper({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}