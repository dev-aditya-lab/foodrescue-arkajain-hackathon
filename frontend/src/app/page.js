"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Users, Zap, TrendingUp, Heart, Utensils } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { mockFoodItems } from "@/lib/mockData";
import { useEffect, useRef, useState } from "react";

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
  const featuredItems = mockFoodItems.slice(0, 4);

  return (
    <div className="space-y-0 pb-20">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="w-3.5 h-3.5 fill-primary" />
                Fighting food waste together
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Save Food.
                <br />
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Share Care.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Connect restaurants, stores, and individuals sharing surplus food
                with people in need. Fight food waste while building community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/add-food" className="btn-primary text-base">
                  Add Surplus Food
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/all-foods" className="btn-outline text-base">
                  Find Food Nearby
                </Link>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative h-[420px] rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50">
                {/* Floating elements */}
                <div className="absolute w-48 h-48 bg-primary/8 rounded-full -top-10 -right-10 blur-2xl animate-float" />
                <div className="absolute w-36 h-36 bg-secondary/8 rounded-full -bottom-6 -left-6 blur-2xl animate-float" style={{ animationDelay: "2s" }} />

                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-xl">
                    <Leaf className="w-14 h-14 text-white animate-pulse-slow" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-foreground text-lg">
                      Reduce Waste
                    </p>
                    <p className="text-sm text-muted-foreground max-w-48">
                      Every meal shared is a step toward zero food waste
                    </p>
                  </div>

                  {/* Mini stat cards */}
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm">
                      <p className="text-xs text-muted-foreground">Saved</p>
                      <p className="font-bold text-primary">2,000+</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-border/50 shadow-sm">
                      <p className="text-xs text-muted-foreground">Users</p>
                      <p className="font-bold text-secondary">1,200+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Items ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Available Food Items
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse items available in your area right now. Fresh, sustainable,
              and ready to claim!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <FoodCard key={item.id} {...item} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/all-foods" className="btn-secondary text-base">
              View All Items
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, intuitive, and effective. Get started in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Share Surplus",
                description: "List excess food from your restaurant, store, or home. Include details like quantity, expiry time, and location.",
                gradient: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
                borderHover: "hover:border-primary/30",
                step: "01",
              },
              {
                icon: Users,
                title: "Find Food",
                description: "Browse nearby available food items. Filter by distance, expiry time, and food type to find what you need.",
                gradient: "from-secondary/10 to-secondary/5",
                iconBg: "bg-secondary/15",
                iconColor: "text-secondary",
                borderHover: "hover:border-secondary/30",
                step: "02",
              },
              {
                icon: Zap,
                title: "Claim Instantly",
                description: "Claim food items and get pickup instructions. Fast, simple, and designed to reduce food waste.",
                gradient: "from-accent/10 to-accent/5",
                iconBg: "bg-accent/15",
                iconColor: "text-accent",
                borderHover: "hover:border-accent/30",
                step: "03",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border ${feature.borderHover} transition-all duration-300 group`}
              >
                <div className="absolute top-6 right-6 text-5xl font-black text-foreground/5 group-hover:text-foreground/10 transition-colors">
                  {feature.step}
                </div>
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: "500", suffix: "+", label: "Food Items Shared", color: "text-primary", icon: Utensils },
              { value: "2000", suffix: "+", label: "Meals Saved", color: "text-secondary", icon: Heart },
              { value: "1200", suffix: "+", label: "Active Users", color: "text-accent", icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-8 text-center space-y-2">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className={`text-4xl sm:text-5xl font-extrabold ${stat.color}`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl border border-primary/20 p-10 sm:p-16 text-center space-y-6 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Ready to Make an Impact?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
                Join thousands of people fighting food waste. Start sharing
                surplus food or finding meals today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/add-food" className="btn-primary text-base">
                  Share Food Now
                </Link>
                <Link href="/all-foods" className="btn-secondary text-base">
                  Browse Available Food
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
