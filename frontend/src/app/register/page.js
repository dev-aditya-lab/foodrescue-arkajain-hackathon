"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, getMe } from "@/lib/api";

const providerOptions = [
  { value: "restaurant", label: "Restaurant" },
  { value: "individual", label: "Individual" },
  { value: "grocery_store", label: "Grocery Store" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Other" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "provider",
    providerType: "restaurant",
    location: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isProvider = useMemo(() => formData.role === "provider", [formData.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...formData,
      providerType: isProvider ? formData.providerType : undefined,
      organizationName: formData.organizationName || undefined,
    };

    try {
      const response = await register(payload);
      if (!response) {
        throw new Error("Backend unavailable. Please check if backend server is running.");
      }

      const me = await getMe().catch(() => null);
      const user = me?.user || response?.user;
      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      }

      router.push("/all-foods");
      router.refresh();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-8 right-6 w-72 h-72 bg-primary/7 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground">Register with the same fields expected by backend auth.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" name="name" required value={formData.name} onChange={handleChange} className="form-input" placeholder="Your name" />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">Phone</label>
              <input id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="form-input" placeholder="9876543210" />
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="form-input" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" name="password" type="password" required minLength={4} value={formData.password} onChange={handleChange} className="form-input" placeholder="Create password" />
            </div>

            <div>
              <label htmlFor="role" className="form-label">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="form-select">
                <option value="provider">Provider</option>
                <option value="receiver">Receiver</option>
              </select>
            </div>

            {isProvider ? (
              <div>
                <label htmlFor="providerType" className="form-label">Provider Type</label>
                <select id="providerType" name="providerType" value={formData.providerType} onChange={handleChange} className="form-select">
                  {providerOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={isProvider ? "" : "sm:col-span-2"}>
              <label htmlFor="organizationName" className="form-label">Organization Name (optional)</label>
              <input id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} className="form-input" placeholder="Optional organization" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className="form-label">Location (required by backend)</label>
              <input id="location" name="location" required value={formData.location} onChange={handleChange} className="form-input" placeholder="Address or map link" />
            </div>

            {error ? (
              <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
