import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto">
          <span className="text-5xl font-black text-primary/40">404</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Page Not Found
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The page
            might have been moved or no longer exists.
          </p>
        </div>
        <Link href="/" className="btn-primary inline-flex">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
