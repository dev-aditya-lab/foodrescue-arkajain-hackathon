"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PartyPopper, CheckCircle2, XCircle, Clock, RefreshCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyClaims } from "@/lib/api";

function readCheckoutSummary() {
  if (typeof window === "undefined") {
    return { results: [], createdAt: null };
  }

  try {
    const raw = sessionStorage.getItem("lastClaimCheckout");
    if (!raw) return { results: [], createdAt: null };
    const parsed = JSON.parse(raw);
    return {
      results: Array.isArray(parsed?.results) ? parsed.results : [],
      createdAt: parsed?.createdAt || null,
    };
  } catch {
    return { results: [], createdAt: null };
  }
}

export default function ClaimPage() {
  const { role, isLoading } = useAuth();
  const [checkoutSummary, setCheckoutSummary] = useState({ results: [], createdAt: null });
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);

  useEffect(() => {
    setCheckoutSummary(readCheckoutSummary());
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadClaims() {
      setClaimsLoading(true);
      try {
        const response = await fetchMyClaims();
        if (!ignore) {
          setClaims(response?.claims || []);
        }
      } catch {
        if (!ignore) {
          setClaims([]);
        }
      } finally {
        if (!ignore) {
          setClaimsLoading(false);
        }
      }
    }

    if (role === "receiver") {
      loadClaims();
    }

    return () => {
      ignore = true;
    };
  }, [role]);

  const successfulResults = useMemo(
    () => checkoutSummary.results.filter((result) => result.success),
    [checkoutSummary.results]
  );

  const failedResults = useMemo(
    () => checkoutSummary.results.filter((result) => !result.success),
    [checkoutSummary.results]
  );

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16">Loading...</div>;
  }

  if (role !== "receiver") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Receiver Access Only</h1>
          <p className="text-muted-foreground">Only receivers can claim food orders.</p>
          <Link href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to basket
      </Link>

      <div className="glass-card p-8 sm:p-12 text-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto animate-float">
          <PartyPopper className="w-12 h-12 text-secondary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Claim Summary
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your latest claim checkout result with live claim status.
          </p>
        </div>

        <div className="bg-linear-to-br from-secondary/10 to-primary/5 rounded-2xl p-8 space-y-2 border border-secondary/20">
          <p className="text-3xl font-extrabold text-secondary">
            {successfulResults.length} item{successfulResults.length === 1 ? "" : "s"} claimed
          </p>
          <p className="text-sm text-muted-foreground">
            {failedResults.length > 0
              ? `${failedResults.length} item${failedResults.length === 1 ? "" : "s"} failed and need retry.`
              : "All selected items were claimed successfully."}
          </p>
          {checkoutSummary.createdAt ? (
            <p className="text-xs text-muted-foreground pt-1">
              Submitted at {new Date(checkoutSummary.createdAt).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="text-left space-y-3 max-w-xl mx-auto">
          {checkoutSummary.results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No recent checkout data found. Add items to basket and complete pickups.
            </p>
          ) : (
            checkoutSummary.results.map((result) => (
              <div
                key={`${result.itemId}-${result.success ? "ok" : "fail"}`}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
              >
                {result.success ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-secondary mt-0.5" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-destructive mt-0.5" />
                )}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{result.itemName}</p>
                  <p className="text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-left space-y-3 max-w-xl mx-auto w-full">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">My Active Claims</h3>
          {claimsLoading ? (
            <p className="text-sm text-muted-foreground">Loading your claim history...</p>
          ) : claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims yet.</p>
          ) : (
            <div className="space-y-2">
              {claims.slice(0, 6).map((claim) => (
                <div
                  key={claim._id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {claim.food?.title || "Food item"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {claim.food?.organizationName || claim.food?.location || "Provider location"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-primary/10 text-primary capitalize">
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/all-foods" className="btn-primary">
            Continue Browsing
          </Link>
          <Link href="/cart" className="btn-outline inline-flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Back to Basket
          </Link>
        </div>

        <div className="text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Keep an eye on claim status updates from your dashboard.
        </div>
      </div>
    </div>
  );
}
