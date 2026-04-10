"use client";

import { useState, useMemo } from "react";
import FoodCard from "@/components/FoodCard";
import FilterBar from "@/components/FilterBar";
import { mockFoodItems } from "@/lib/mockData";

export default function AllFoodsPage() {
  const [filters, setFilters] = useState({
    distance: null,
    expiry: "all",
    foodType: "",
    search: "",
  });

  const filteredItems = useMemo(() => {
    return mockFoodItems.filter((item) => {
      // Search filter
      if (
        filters.search &&
        !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.foodType.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Distance filter
      if (filters.distance !== null && item.distance > filters.distance) {
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
        !item.foodType.toLowerCase().includes(filters.foodType.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

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
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "item" : "items"} available
          {filters.search && ` matching "${filters.search}"`}
        </p>
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
