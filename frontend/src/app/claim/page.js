import Link from "next/link";
import { ArrowLeft, PartyPopper, MapPin, Clock, Phone, Share2 } from "lucide-react";

export default function ClaimPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in">
      <Link
        href="/all-foods"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all-foods
      </Link>

      <div className="glass-card p-8 sm:p-12 text-center space-y-8">
        {/* Celebration Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto animate-float">
          <PartyPopper className="w-12 h-12 text-secondary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Claim Confirmed!
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your food claim has been submitted. Here&apos;s what to do next.
          </p>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-br from-secondary/10 to-primary/5 rounded-2xl p-8 space-y-2 border border-secondary/20">
          <p className="text-3xl font-extrabold text-secondary">
            You saved 5 meals! 🎉
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you for helping reduce food waste in your community.
          </p>
        </div>

        {/* Next Steps */}
        <div className="text-left space-y-4 max-w-sm mx-auto">
          <h3 className="font-bold text-foreground text-center text-sm uppercase tracking-wider">
            Next Steps
          </h3>

          {[
            {
              icon: Phone,
              title: "Contact the provider",
              description: "Call or email to confirm your pickup",
              color: "text-primary bg-primary/10",
            },
            {
              icon: MapPin,
              title: "Head to pickup location",
              description: "Go to the specified location on time",
              color: "text-secondary bg-secondary/10",
            },
            {
              icon: Clock,
              title: "Pick up within the window",
              description: "Arrive during the pickup time slot",
              color: "text-accent bg-accent/10",
            },
            {
              icon: Share2,
              title: "Spread the word",
              description: "Tell others about Food Rescue",
              color: "text-primary bg-primary/10",
            },
          ].map((step, idx) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {idx + 1}. {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/all-foods" className="btn-primary">
            Continue Browsing
          </Link>
          <Link href="/" className="btn-outline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
