"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

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