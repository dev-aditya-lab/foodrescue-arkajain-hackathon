"use client";

import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchStats();
        if (!ignore) {
          setStats(response?.stats || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadStats();
    }

    return () => {
      ignore = true;
    };
  }, [authLoading]);

  if (authLoading || isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-10">Loading analytics...</div>;
  }

  const platform = stats?.platform || {};
  const user = stats?.user || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">Food Waste Analytics</h1>
        <p className="text-muted-foreground">Track impact across platform and your profile.</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Platform Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Food Listed", value: platform.totalFoodListed ?? 0 },
            { label: "Meals Saved", value: platform.mealsSaved ?? 0 },
            { label: "Weight Saved (kg)", value: platform.weightSavedKg ?? 0 },
            { label: "Collected Food", value: platform.collectedFood ?? 0 },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">My Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === "provider"
            ? [
                { label: "My Listings", value: user.totalListed ?? 0 },
                { label: "My Collected", value: user.totalCollected ?? 0 },
                { label: "Meals Saved", value: user.mealsSaved ?? 0 },
                { label: "Weight Saved (kg)", value: user.weightSavedKg ?? 0 },
              ]
            : [
                { label: "My Claims", value: user.totalClaims ?? 0 },
                { label: "Completed Claims", value: user.completedClaims ?? 0 },
                { label: "Active Food", value: platform.availableFood ?? 0 },
                { label: "Providers", value: platform.providers ?? 0 },
              ]
          .map((item) => (
            <div key={item.label} className="glass-card p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
