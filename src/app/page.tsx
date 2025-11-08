"use client"; // Keep "use client" if page.tsx needs client features, otherwise it can be removed.

import dynamic from "next/dynamic";
import { Suspense } from "react"; // Import Suspense

// Dynamically import SplashScreen to ensure it's client-only
const DynamicSplashScreen = dynamic(() => import("@/components/screens/SplashScreen"), {
  ssr: false,
});

// Dynamically import SeedstreetApp to ensure it only renders on the client
const DynamicSeedstreetApp = dynamic(() => import("@/components/SeedstreetApp"), {
  ssr: false,
  loading: () => <DynamicSplashScreen />, // Use the dynamically imported SplashScreen
});

export default function Home() {
  return (
    <Suspense fallback={<DynamicSplashScreen />}> {/* Wrap with Suspense */}
      <DynamicSeedstreetApp />
    </Suspense>
  );
}