"use client"; // Keep "use client" if page.tsx needs client features, otherwise it can be removed.

import dynamic from "next/dynamic";
import SplashScreen from "@/components/screens/SplashScreen"; // Import SplashScreen directly

// Dynamically import SeedstreetApp to ensure it only renders on the client
const DynamicSeedstreetApp = dynamic(() => import("@/components/SeedstreetApp"), {
  ssr: false,
  loading: () => <SplashScreen />, // Render SplashScreen as a fallback
});

export default function Home() {
  return <DynamicSeedstreetApp />;
}