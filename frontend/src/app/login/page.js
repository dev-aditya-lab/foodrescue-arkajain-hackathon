"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, getMe } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);
      if (!response) {
        throw new Error("Backend unavailable. Please check if backend server is running.");
      }

      const me = await getMe().catch(() => null);
      const user = me?.user || response?.user;
      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-8 w-72 h-72 bg-primary/7 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-4 w-72 h-72 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">Log in to access your Food Rescue account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={4}
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            New user?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
