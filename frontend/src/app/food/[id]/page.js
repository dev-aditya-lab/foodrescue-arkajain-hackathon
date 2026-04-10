"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  Check,
  User,
} from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFoodItemById } from "@/lib/api";
import { mapFoodFromApi } from "@/lib/foodAdapter";
import { attachRoadDistances } from "@/lib/roadDistance";

export default function FoodDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { role, user } = useAuth();
  const userLatitude = user?.latitude;
  const userLongitude = user?.longitude;
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadFood() {
      setIsLoading(true);
      try {
        const response = await getFoodItemById(id);
        let mapped = mapFoodFromApi(response?.foodItem);
        if (mapped) {
          const [withDistance] = await attachRoadDistances([mapped], {
            latitude: userLatitude,
            longitude: userLongitude,
          });
          mapped = withDistance;
        }
        if (!ignore) {
          setItem(mapped);
        }
      } catch {
        if (!ignore) {
          setItem(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFood();
    return () => {
      ignore = true;
    };
  }, [id, userLatitude, userLongitude]);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center">Loading food item...</div>;
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="space-y-4">
          <div className="text-5xl">🍽️</div>
          <h1 className="text-3xl font-bold text-foreground">Item Not Found</h1>
          <p className="text-muted-foreground">
            This food item may have been claimed or removed.
          </p>
          <Link href="/all-foods" className="btn-primary inline-flex">
            Browse Food Items
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (item.status !== "available") return;
    addItem(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <Link
        href="/all-foods"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all-foods
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="glass-card overflow-hidden">
            <div className="w-full h-64 sm:h-80 bg-linear-to-br from-primary/8 to-secondary/8 flex items-center justify-center relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center space-y-2 opacity-40">
                  <span className="text-6xl">🍽️</span>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.foodType}
                  </p>
                </div>
              )}
              {item.expiryTime < 60 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse-slow">
                  ⚡ Urgent
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                {item.foodType}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="glass-card p-6 sm:p-8 space-y-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {item.name}
            </h1>

            {item.description && (
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Quantity
                </p>
                <p className="text-lg font-bold text-foreground">
                  {item.quantity}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Distance
                </p>
                <p className="text-lg font-bold text-foreground">
                  {Number.isFinite(item.distance) ? `${item.distance} km` : "N/A"}
                </p>
              </div>
            </div>

            {/* Location & Time */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pickup location
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.pickupTime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pickup window
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            {/* Countdown */}
            <div className="glass-card p-5 space-y-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Time Remaining
              </p>
              <CountdownTimer expiryTime={item.expiryTime} size="lg" />
            </div>

            {/* Provider Card */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Provider
              </h3>
              <div className="space-y-3">
                <p className="font-semibold text-foreground">{item.provider}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{item.providerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{item.providerEmail}</span>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            {role === "receiver" ? (
              <>
                <button
                  onClick={handleAdd}
                  disabled={item.status !== "available"}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all duration-300 ${
                    item.status !== "available"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : isAdded
                        ? "bg-secondary text-white cursor-pointer"
                        : "btn-primary cursor-pointer"
                  }`}
                >
                  {item.status !== "available" ? (
                    "No longer available"
                  ) : isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Basket!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Basket
                    </>
                  )}
                </button>

                <Link href="/claim" className="btn-outline w-full text-center block">
                  Claim This Food
                </Link>

                <Link href={`/map?foodId=${item.id}`} className="btn-outline w-full text-center block">
                  View Pickup Route
                </Link>
              </>
            ) : (
              <div className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-muted text-muted-foreground">
                Only receivers can claim or order food
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
