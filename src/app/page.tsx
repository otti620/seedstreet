"use client"; // Keep "use client" if page.tsx needs client features, otherwise it can be removed.

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading fallback

// Dynamically import SeedstreetApp to ensure it only renders on the client
const DynamicSeedstreetApp = dynamic(() => import("@/components/SeedstreetApp"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-2xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <DynamicSeedstreetApp />;
}