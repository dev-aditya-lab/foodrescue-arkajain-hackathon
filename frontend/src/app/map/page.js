"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const PickupMapClient = dynamic(() => import("@/components/PickupMapClient"), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-10 text-center text-muted-foreground">Loading map...</div>
  ),
});

export default function MapPage() {
  const searchParams = useSearchParams();
  const initialFoodId = searchParams.get("foodId");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <Link
        href="/all-foods"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all-foods
      </Link>

      <div className="space-y-6">
        <div className="glass-card p-8 sm:p-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight inline-flex items-center gap-3">
            <MapPin className="w-7 h-7 text-primary" />
            Pickup Route Map
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            View provider location, your current position, and shortest driving route for pickup.
          </p>
        </div>

        <PickupMapClient initialFoodId={initialFoodId} />
      </div>
    </div>
  );
}
