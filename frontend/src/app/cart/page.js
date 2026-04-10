"use client";

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
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto">
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
            <div
              key={item.id}
              className="glass-card p-5 group"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-primary/30" />
                </div>

                {/* Details */}
                <div className="flex-grow space-y-2 min-w-0">
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
                      <span>{item.location}</span>
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
                  className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors h-fit cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
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
                <Link href="/claim" className="btn-primary w-full text-center block">
                  Complete Pickups
                </Link>
                <Link
                  href="/all-foods"
                  className="btn-outline w-full text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

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
