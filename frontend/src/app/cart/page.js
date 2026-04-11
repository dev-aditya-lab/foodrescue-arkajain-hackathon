"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { claimFoodItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import { buildGoogleMapsLink } from "@/lib/mapLinks";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const { role, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const handleCompletePickups = async () => {
    if (!items.length || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await claimFoodItem(item.id);
            return {
              itemId: item.id,
              itemName: item.name,
              success: true,
              claimId: response?.claim?._id || null,
              message: response?.message || "Claim created successfully",
            };
          } catch (error) {
            return {
              itemId: item.id,
              itemName: item.name,
              success: false,
              message: error.message || "Failed to create claim",
            };
          }
        })
      );

      const succeededIds = results.filter((result) => result.success).map((result) => result.itemId);
      succeededIds.forEach((id) => removeItem(id));

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "lastClaimCheckout",
          JSON.stringify({
            createdAt: new Date().toISOString(),
            results,
          })
        );
      }

      if (results.some((result) => result.success)) {
        router.push("/claim");
        return;
      }

      setSubmitError("None of the selected items could be claimed. Please refresh and try again.");
    } catch {
      setSubmitError("Something went wrong while submitting your claims.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16">Loading...</div>;
  }

  if (role !== "receiver") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="glass-card p-8 space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Receiver Access Only</h1>
          <p className="text-muted-foreground">Only receivers can order or claim food.</p>
          <Link href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-12 h-12 text-primary/50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Your Basket is Empty
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start adding food items to your basket. Browse available food and
              claim them!
            </p>
          </div>
          <Link href="/all-foods" className="btn-primary inline-flex">
            Browse Food Items
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
          Your Basket
        </h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} ready for
          pickup
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            (() => {
              const googleMapsUrl = buildGoogleMapsLink(item.providerLatitude, item.providerLongitude);
              return (
            <div
              key={item.id}
              className="glass-card p-5 group"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 bg-linear-to-br from-primary/8 via-white to-secondary/10 rounded-xl shrink-0 overflow-hidden relative border border-border/60">
                  {item.image ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                      role="img"
                      aria-label={item.name}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grow space-y-2 min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Qty:{" "}
                    <span className="font-semibold text-foreground">
                      {item.quantity}
                    </span>
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      {googleMapsUrl ? (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline"
                        >
                          Open in Google Maps
                        </a>
                      ) : (
                        <span>Location unavailable</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.pickupTime}</span>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="bg-muted/50 rounded-lg p-2 space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {item.provider}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{item.providerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{item.providerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors h-fit cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
              );
            })()
          ))}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            {/* Summary */}
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-lg font-bold text-foreground">Summary</h2>

              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items in basket:</span>
                  <span className="font-bold text-foreground">{items.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCompletePickups}
                  disabled={isSubmitting}
                  className="btn-primary w-full text-center block disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting claims...
                    </span>
                  ) : (
                    "Claim & Order"
                  )}
                </button>
                <Link
                  href="/all-foods"
                  className="btn-outline w-full text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

              {submitError ? (
                <p className="text-sm text-destructive">{submitError}</p>
              ) : null}

              <button
                onClick={clearCart}
                className="w-full px-4 py-2.5 text-sm text-destructive hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-200 cursor-pointer"
              >
                Clear Basket
              </button>
            </div>

            {/* Next Steps */}
            <div className="bg-secondary/8 rounded-xl border border-secondary/15 p-5 space-y-3">
              <h3 className="font-bold text-foreground text-sm">Next Steps</h3>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Review item details and provider info</li>
                <li>Contact provider for confirmation</li>
                <li>Pick up items at specified time</li>
                <li>Enjoy and reduce food waste!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
