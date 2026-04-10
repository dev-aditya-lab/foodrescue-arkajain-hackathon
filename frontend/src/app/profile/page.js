"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 space-y-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Unable to load user profile.</p>
          <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Your account details and allowed actions by role.</p>
      </div>

      <section className="glass-card p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-foreground">Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Name</p>
            <p className="font-semibold text-foreground">{user.name || "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Email</p>
            <p className="font-semibold text-foreground">{user.email || "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Phone</p>
            <p className="font-semibold text-foreground">{user.phone || "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Role</p>
            <p className="font-semibold text-foreground capitalize">{user.role || "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 sm:col-span-2">
            <p className="text-muted-foreground">Location</p>
            <p className="font-semibold text-foreground">{user.location || "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Latitude</p>
            <p className="font-semibold text-foreground">{user.latitude ?? "-"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground">Longitude</p>
            <p className="font-semibold text-foreground">{user.longitude ?? "-"}</p>
          </div>
          {user.organizationName ? (
            <div className="bg-muted/50 rounded-lg p-4 sm:col-span-2">
              <p className="text-muted-foreground">Organization</p>
              <p className="font-semibold text-foreground">{user.organizationName}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="glass-card p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Allowed Actions</h2>
        {role === "provider" ? (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Provider permissions:</p>
            <p>- Can add and manage food listings.</p>
            <p>- Can view and update incoming claims.</p>
            <p>- Cannot claim/order food as receiver.</p>
            <Link href="/add-food" className="btn-primary inline-flex">Add Food Item</Link>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Receiver permissions:</p>
            <p>- Can browse, order, and claim food items.</p>
            <p>- Can view personal claim history.</p>
            <p>- Cannot add food listings.</p>
            <Link href="/all-foods" className="btn-primary inline-flex">Browse Food</Link>
          </div>
        )}
      </section>
    </div>
  );
}
