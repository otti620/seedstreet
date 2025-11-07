"use client"; // Keep "use client" if page.tsx needs client features, otherwise it can be removed.

import dynamic from "next/dynamic";
// Removed import for Skeleton as it's no longer needed here

// Dynamically import SeedstreetApp to ensure it only renders on the client
const DynamicSeedstreetApp = dynamic(() => import("@/components/SeedstreetApp"), {
  ssr: false,
  // Removed the loading fallback as SeedstreetApp now handles its own splash screen
});

export default function Home() {
  return <DynamicSeedstreetApp />;
}