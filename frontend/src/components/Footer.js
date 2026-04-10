import Link from "next/link";
import { Leaf, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-white-500 flex items-center justify-center">
                <Image src="/logo.jpg" alt="Food Rescue Logo" width={80} height={80} className="w-full h-full rounded-xl" />

              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                Food Rescue
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reducing food waste, one share at a time. Join our mission to
              build a more sustainable community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/all-foods"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Food
                </Link>
              </li>
              <li>
                <Link
                  href="/add-food"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Share Food
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Food Map
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Food Rescue connects restaurants, stores, and individuals to share
              surplus food and reduce waste in the community.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Food Rescue. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> By <a href="https://github.com/dev-aditya-lab/foodrescue-arkajain-hackathon" target="_blank" className="text-orange-500 cursor-pointer hover:underline">Team Minion Prince</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
