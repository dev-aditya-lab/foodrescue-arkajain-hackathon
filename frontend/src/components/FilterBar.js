"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function FilterBar({ onSearch, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    distance: null,
    expiry: "all",
    foodType: "",
    search: "",
  });

  const handleSearchChange = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters =
    filters.distance !== null ||
    filters.expiry !== "all" ||
    filters.foodType !== "";

  const activeCount = [
    filters.distance !== null,
    filters.expiry !== "all",
    filters.foodType !== "",
  ].filter(Boolean).length;

  const expiryOptions = [
    { value: "all", label: "All" },
    { value: "urgent", label: "Urgent (< 1h)" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search food items..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="form-input pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
            isExpanded || hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              const reset = { distance: null, expiry: "all", foodType: "", search: filters.search };
              setFilters(reset);
              onFilterChange(reset);
            }}
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="glass-card p-5 space-y-5 animate-fade-in">
          {/* Distance */}
          <div>
            <label className="form-label">Distance (km)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={filters.distance || 0}
                onChange={(e) =>
                  handleFilterChange("distance", parseInt(e.target.value) || null)
                }
                className="flex-grow h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                {filters.distance ? `${filters.distance} km` : "Any"}
              </span>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="form-label">Expiry Time</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {expiryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange("expiry", opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    filters.expiry === opt.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Type */}
          <div>
            <label className="form-label">Food Type</label>
            <input
              type="text"
              placeholder="e.g., Vegetables, Bakery, Dairy..."
              value={filters.foodType}
              onChange={(e) => handleFilterChange("foodType", e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
