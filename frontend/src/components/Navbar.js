"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Leaf, Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Foods", path: "/all-foods" },
  { label: "Add Food", path: "/add-food" },
  { label: "Map", path: "/map" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:inline">
              Food Rescue
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-foreground/65 hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-foreground hover:bg-muted transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse-slow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/65 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className={`px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  isActive("/cart")
                    ? "text-primary bg-primary/10"
                    : "text-foreground/65 hover:text-foreground hover:bg-muted"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
