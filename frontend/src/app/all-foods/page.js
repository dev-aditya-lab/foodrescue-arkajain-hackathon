"use client";

import { useEffect, useMemo, useState } from "react";
import FoodCard from "@/components/FoodCard";
import FilterBar from "@/components/FilterBar";
import { fetchFoodItems } from "@/lib/api";
import { mapFoodFromApi } from "@/lib/foodAdapter";
import { attachRoadDistances } from "@/lib/roadDistance";
import { useAuth } from "@/context/AuthContext";

export default function AllFoodsPage() {
  const { user } = useAuth();
  const userLatitude = user?.latitude;
  const userLongitude = user?.longitude;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    distance: null,
    expiry: "all",
    foodType: "",
    search: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadFoods() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchFoodItems({ search: filters.search, sort: "dynamic" });
        let apiItems = (response?.foodItems || [])
          .map(mapFoodFromApi)
          .filter(Boolean);
        if (!ignore) {
          setItems(apiItems);
          setIsLoading(false);

          attachRoadDistances(apiItems, {
            latitude: userLatitude,
            longitude: userLongitude,
          })
            .then((itemsWithDistance) => {
              if (!ignore) {
                setItems(itemsWithDistance);
              }
            })
            .catch(() => {
              // Keep the quick initial list if distance lookup fails.
            });
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load food items");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFoods();
    return () => {
      ignore = true;
    };
  }, [filters.search, userLatitude, userLongitude]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.distance !== null && typeof item.distance === "number" && item.distance > filters.distance) {
        return false;
      }

      // Expiry filter
      if (filters.expiry !== "all") {
        if (filters.expiry === "urgent" && item.expiryTime >= 60) return false;
        if (filters.expiry === "today" && item.expiryTime > 1440) return false;
        if (filters.expiry === "week" && item.expiryTime > 10080) return false;
      }

      // Food type filter
      if (
        filters.foodType &&
        !(item.foodType || "").toLowerCase().includes(filters.foodType.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [filters, items]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
          Browse Nearby Food
        </h1>
        <p className="text-muted-foreground">
          Discover available food items in your area. Fast, simple, and
          effective.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar
          onSearch={(query) => setFilters((prev) => ({ ...prev, search: query }))}
          onFilterChange={setFilters}
        />
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground font-medium text-sm">
          {isLoading ? "Loading food items..." : ""}
          {!isLoading ? (
            <>
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "item" : "items"} available
          {filters.search && ` matching "${filters.search}"`}
            </>
          ) : null}
        </p>
        {error ? (
          <p className="text-sm text-destructive mt-2">{error}</p>
        ) : null}
      </div>

      {/* Food Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No food items found
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your filters or check back soon for more available
            items.
          </p>
        </div>
      )}
    </div>
  );
}
