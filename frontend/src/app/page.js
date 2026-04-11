"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchFoodItems } from "@/lib/api";
import { mapFoodFromApi } from "@/lib/foodAdapter";
import { attachRoadDistances } from "@/lib/roadDistance";
import { useAuth } from "@/context/AuthContext";

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const numericTarget = parseInt(target.replace(/[^0-9]/g, ""));
          const duration = 1500;
          const steps = 40;
          const stepValue = numericTarget / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += stepValue;
            if (current >= numericTarget) {
              setCount(numericTarget);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const userLatitude = user?.latitude;
  const userLongitude = user?.longitude;
  const [featuredItems, setFeaturedItems] = useState([]);

  const homeStats = useMemo(
    () => [
      { value: "500", suffix: "+", label: "Food items shared", icon: Utensils, tone: "primary" },
      { value: "2000", suffix: "+", label: "Meals saved", icon: Leaf, tone: "secondary" },
      { value: "1200", suffix: "+", label: "Active users", icon: TrendingUp, tone: "accent" },
    ],
    []
  );

  const principles = useMemo(
    () => [
      {
        title: "Precise pickup",
        description: "Saved coordinates and route-aware navigation help people reach food faster.",
        icon: MapPinned,
        tone: "primary",
      },
      {
        title: "Clear ownership",
        description: "Providers, receivers, and claims each have a focused space with no clutter.",
        icon: ShieldCheck,
        tone: "secondary",
      },
      {
        title: "Urgency first",
        description: "Expiry timing and priority are surfaced up front so urgent items are handled sooner.",
        icon: Clock3,
        tone: "accent",
      },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        number: "01",
        title: "List surplus food",
        description: "Add quantity, expiry, and coordinates once. The system handles the rest.",
      },
      {
        number: "02",
        title: "Match nearby demand",
        description: "Receivers see a clean feed ordered by urgency, distance, and impact.",
      },
      {
        number: "03",
        title: "Claim and collect",
        description: "One tap creates the claim, updates the route, and keeps both sides informed.",
      },
    ],
    []
  );

  const spotlightItem = featuredItems[0] || null;
  const supportingItems = featuredItems.slice(1, 4);

  useEffect(() => {
    let ignore = false;

    async function loadFeaturedItems() {
      try {
        const response = await fetchFoodItems();
        let items = (response?.foodItems || [])
          .map(mapFoodFromApi)
          .filter(Boolean);

        items = await attachRoadDistances(items, {
          latitude: userLatitude,
          longitude: userLongitude,
        });
        items = items.slice(0, 4);

        if (!ignore) {
          setFeaturedItems(items);
        }
      } catch {
        if (!ignore) {
          setFeaturedItems([]);
        }
      }
    }

    loadFeaturedItems();
    return () => {
      ignore = true;
    };
  }, [userLatitude, userLongitude]);

  return (
    <div className="space-y-0 pb-20">
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 right-0 w-120 h-120 bg-primary/6 rounded-full blur-3xl" />
          <div className="absolute top-28 left-0 w-72 h-72 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                Designed for fast rescue, clean pickup, and real impact
              </div>

              <div className="space-y-5 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Food rescue network
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-foreground">
                  Turn surplus food into
                  <span className="block bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                    immediate help.
                  </span>
                </h1>
                <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  A focused system for providers and receivers: list surplus food,
                  route it with saved coordinates, and claim it with a clear, professional flow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/add-food" className="btn-primary text-base px-6 py-3.5">
                  Share surplus food
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/all-foods" className="btn-outline text-base px-6 py-3.5">
                  Explore available food
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {homeStats.map((stat) => (
                  <div key={stat.label} className="glass-card p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <stat.icon className={`w-5 h-5 ${stat.tone === "primary" ? "text-primary" : stat.tone === "secondary" ? "text-secondary" : "text-accent"}`} />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Live</span>
                    </div>
                    <p className={`text-3xl font-extrabold ${stat.tone === "primary" ? "text-primary" : stat.tone === "secondary" ? "text-secondary" : "text-accent"}`}>
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-up xl:justify-self-end w-full max-w-xl">
              <div className="relative overflow-hidden rounded-4xl border border-border bg-linear-to-br from-white via-white to-primary/5 p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
                <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-primary/8 blur-3xl" />
                <div className="absolute -left-10 bottom-0 w-44 h-44 rounded-full bg-secondary/10 blur-3xl" />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Today’s pickup board</p>
                      <h2 className="mt-2 text-2xl font-bold text-foreground">Clean, coordinate-based routing</h2>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
                      <p className="text-xs text-muted-foreground">Pickup ready</p>
                      <p className="text-lg font-black text-primary">Live</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {principles.map((principle) => (
                      <div key={principle.title} className="rounded-2xl border border-border bg-white/85 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${principle.tone === "primary" ? "bg-primary/10" : principle.tone === "secondary" ? "bg-secondary/10" : "bg-accent/10"}`}>
                            <principle.icon className={`w-5 h-5 ${principle.tone === "primary" ? "text-primary" : principle.tone === "secondary" ? "text-secondary" : "text-accent"}`} />
                          </div>
                          <p className="font-semibold text-foreground">{principle.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/8 to-accent/10 border border-border p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Best path</p>
                        <p className="text-lg font-bold text-foreground">Provider location, receiver route, and claim flow in one view</p>
                      </div>
                      <Link href="/map" className="btn-secondary shrink-0">
                        Open map
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Why this layout works</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Less clutter, more action.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The homepage now reads like a product landing page: the promise, the proof, and the next step all live in distinct zones.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Same colors</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary">Different layout</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">Consistent UI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((step) => (
                <div key={step.number} className="glass-card p-5 sm:p-6 space-y-3 relative overflow-hidden">
                  <div className="absolute right-4 top-4 text-5xl font-black text-foreground/5">{step.number}</div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Step {step.number}</p>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Featured food</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Available food items, re-framed for faster scanning.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The feed below uses the same data, but the surrounding layout now gives it stronger hierarchy and clearer focus.
              </p>
            </div>
            <Link href="/all-foods" className="btn-outline self-start lg:self-auto">
              View all items
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {spotlightItem ? (
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
              <div className="glass-card overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-border/70 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Spotlight item</p>
                    <h3 className="mt-1 text-2xl font-bold text-foreground">Featured near you</h3>
                  </div>
                  <div className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary">
                    Fast pickup
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <FoodCard key={spotlightItem.id} {...spotlightItem} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Secondary items</p>
                      <h3 className="text-xl font-bold text-foreground mt-1">More options</h3>
                    </div>
                    <Users className="w-5 h-5 text-secondary" />
                  </div>

                  <div className="space-y-3">
                    {supportingItems.length > 0 ? (
                      supportingItems.map((item) => (
                        <Link
                          key={item.id}
                          href={`/food/${item.id}`}
                          className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.quantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-primary">
                              {Number.isFinite(item.distance) ? `${item.distance.toFixed(1)} km` : "Nearby"}
                            </p>
                            <p className="text-xs text-muted-foreground">Pickup ready</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional featured items yet.</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/10 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Immediate actions</p>
                  <p className="text-lg font-bold text-foreground leading-snug">
                    Add food if you’re a provider, or browse by proximity if you’re a receiver.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/add-food" className="btn-primary flex-1">
                      Add food
                    </Link>
                    <Link href="/map" className="btn-secondary flex-1">
                      Open map
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Loading live food items</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The homepage is ready; featured food will appear here as soon as the data loads.
              </p>
            </div>
          )}

          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.slice(0, 4).map((item) => (
                <FoodCard key={item.id} {...item} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">How it works</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Three steps, one consistent flow.
                </h2>
              </div>
              <p className="max-w-xl text-muted-foreground leading-relaxed">
                This section was redesigned to read like a product narrative, not a generic three-column card grid.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {[
                {
                  icon: Leaf,
                  title: "Share surplus",
                  description: "Providers create a listing with food details, manual impact data, and saved coordinates.",
                },
                {
                  icon: Users,
                  title: "Match and prioritize",
                  description: "Receivers see urgency, distance, and impact arranged in a clear visual hierarchy.",
                },
                {
                  icon: Sparkles,
                  title: "Claim and collect",
                  description: "The route, claim, and status updates stay tightly connected from feed to pickup.",
                },
              ].map((feature, index) => (
                <div key={feature.title} className="relative rounded-[1.75rem] border border-border bg-linear-to-br from-white via-white to-muted/30 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-7xl font-black text-foreground/5">0{index + 1}</div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {homeStats.map((stat) => (
              <div key={`footer-${stat.label}`} className="glass-card p-6 text-center space-y-3">
                <stat.icon className={`w-7 h-7 mx-auto ${stat.tone === "primary" ? "text-primary" : stat.tone === "secondary" ? "text-secondary" : "text-accent"}`} />
                <p className={`text-4xl font-black ${stat.tone === "primary" ? "text-primary" : stat.tone === "secondary" ? "text-secondary" : "text-accent"}`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl border border-primary/20 bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 opacity-70" />
            <div className="relative z-10 space-y-5">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Ready to move food faster?
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                The new homepage keeps the same palette, but the structure is cleaner, more deliberate, and easier to scan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/add-food" className="btn-primary text-base px-6 py-3.5">
                  Start sharing
                </Link>
                <Link href="/all-foods" className="btn-secondary text-base px-6 py-3.5">
                  Browse food
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
