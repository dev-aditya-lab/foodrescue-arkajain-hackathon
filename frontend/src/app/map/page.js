import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="glass-card overflow-hidden">
        {/* Map Placeholder */}
        <div className="w-full h-[420px] bg-gradient-to-br from-primary/8 via-muted/50 to-secondary/8 flex items-center justify-center relative">
          {/* Decorative dots */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-primary/20 rounded-full animate-pulse-slow"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mx-auto shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Interactive Map View
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Integrate your preferred map provider (Google Maps, Mapbox, etc.)
              to show food locations
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Food Locations Map
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            See all available food items on an interactive map. Click on markers
            to view details, highlight closest and urgent items, and navigate to
            food locations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Interactive map showing food locations",
              "Clickable markers with food details popup",
              "Highlight closest items to you",
              "Urgent items shown with red glow",
              "Real-time location tracking",
              "Directions to pickup location",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5"
              >
                <span className="text-secondary font-bold">✓</span>
                {feature}
              </div>
            ))}
          </div>

          <Link href="/dashboard" className="btn-primary inline-flex">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
