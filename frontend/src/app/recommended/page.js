"use client";

import { useEffect, useState } from "react";
import FoodCard from "@/components/FoodCard";
import { fetchRecommendedFoodItems } from "@/lib/api";
import { mapFoodFromApi } from "@/lib/foodAdapter";
import { useAuth } from "@/context/AuthContext";

export default function RecommendedPage() {
  const { role, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadRecommended() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchRecommendedFoodItems();
        const mapped = (response?.foodItems || []).map((item) => {
          const card = mapFoodFromApi(item);
          if (!card) return null;
          return {
            ...card,
            distance: item.distanceKm ?? card.distance,
            matchReason: item.matchReason,
            dynamicPriorityScore: item.dynamicPriorityScore,
          };
        }).filter(Boolean);

        if (!ignore) {
          setItems(mapped);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load recommendations");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (!authLoading && role === "receiver") {
      loadRecommended();
    } else if (!authLoading) {
      setIsLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [authLoading, role]);

  if (authLoading || isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-10">Loading recommendations...</div>;
  }

  if (role !== "receiver") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-card p-8 space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Receiver Access Only</h1>
          <p className="text-muted-foreground">Smart matching is available for receiver accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">Smart Recommendations</h1>
        <p className="text-muted-foreground">Best matches based on urgency, quantity, impact, and proximity.</p>
      </div>

      {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}

      {items.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground">No recommendations available right now.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <FoodCard {...item} />
              <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">{item.matchReason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
