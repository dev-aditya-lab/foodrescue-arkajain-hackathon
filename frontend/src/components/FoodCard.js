"use client";

import { useState } from "react";
import { Clock, MapPin, Apple, Phone, Mail, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function FoodCard({
  id,
  name,
  quantity,
  distance,
  expiryTime,
  image,
  location,
  provider,
  providerPhone,
  providerEmail,
  pickupTime,
  foodType,
}) {
  const isUrgent = expiryTime < 60;
  const { addItem } = useCart();
  const { role } = useAuth();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      quantity,
      distance,
      expiryTime,
      location,
      provider,
      providerPhone,
      providerEmail,
      image,
      pickupTime,
      foodType,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const expiryColor = isUrgent
    ? "bg-red-50 text-red-700 border-red-200"
    : expiryTime < 240
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const expiryText =
    expiryTime < 60
      ? `${expiryTime}m left`
      : `${Math.round(expiryTime / 60)}h left`;

  return (
    <Link href={`/food/${id}`} className="block group">
      <div className="glass-card overflow-hidden h-full flex flex-col">
        {/* Image Area */}
        <div className="w-full h-44 bg-linear-to-br from-primary/8 to-secondary/8 flex items-center justify-center relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-40">
              <Apple className="w-12 h-12 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{foodType || "Food"}</span>
            </div>
          )}

          {/* Urgency Badge */}
          {isUrgent && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse-slow">
              ⚡ Urgent
            </div>
          )}

          {/* Food Type Tag */}
          {foodType && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">
              {foodType}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Qty: <span className="font-medium text-foreground">{quantity}</span>
            </p>
          </div>

          {/* Info Row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{Number.isFinite(distance) ? `${distance.toFixed(1)} km away` : location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{pickupTime}</span>
            </div>
          </div>

          {/* Expiry */}
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border w-fit ${expiryColor}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{expiryText}</span>
          </div>

          {/* Provider */}
          <div className="bg-muted/60 rounded-lg p-2.5 space-y-1.5 mt-auto">
            <p className="text-xs font-semibold text-foreground">{provider}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{providerPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{providerEmail}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          {role === "receiver" ? (
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 cursor-pointer ${
                isAdded
                  ? "bg-secondary text-white"
                  : "btn-primary"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Basket
                </>
              )}
            </button>
          ) : (
            <div className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground">
              Only receivers can order or claim food
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
