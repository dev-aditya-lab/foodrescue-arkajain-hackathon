"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Clock, MapPin, Tag, FileText, Package, Loader2, CheckCircle } from "lucide-react";
import { createFoodItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const FOOD_TYPES = [
  { label: "Veg", value: "veg" },
  { label: "Non-Veg", value: "non-veg" },
  { label: "Mixed", value: "mixed" },
];

export default function AddFoodPage() {
  const router = useRouter();
  const { role, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: "",
    foodType: "",
    expiryDate: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("quantity", String(Number(form.quantity)));
      payload.append("foodType", form.foodType);
      payload.append("expiryDate", form.expiryDate);
      if (imageFile) {
        payload.append("image", imageFile);
      }

      await createFoodItem(payload);

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to add food item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-12">Loading...</div>;
  }

  if (role !== "provider") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass-card p-8 space-y-4">
          <h1 className="text-2xl font-bold">Provider Access Only</h1>
          <p className="text-muted-foreground">Only providers can add food items.</p>
          <Link href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <div className="space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-secondary/15 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Food Listed Successfully!
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your surplus food has been listed. People nearby will be able to find
            and claim it. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
          Add Surplus Food
        </h1>
        <p className="text-muted-foreground">
          List your excess food to help reduce waste and feed the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Food Details */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Food Details
          </h2>

          <div>
            <label htmlFor="name" className="form-label">Food Name *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Fresh Organic Vegetables"
              value={form.title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe the food, its condition, and any other details..."
              value={form.description}
              onChange={handleChange}
              className="form-input resize-none"
            />
          </div>

          <div>
            <label htmlFor="image" className="form-label">Food Image (one image)</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="form-input"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Optional, max 5MB. Supported types: JPG, PNG, WEBP, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="form-label">
                <Package className="w-3.5 h-3.5 inline mr-1" />
                Quantity *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="text"
                required
                placeholder="e.g., 5 kg, 10 servings"
                value={form.quantity}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="foodType" className="form-label">
                <Tag className="w-3.5 h-3.5 inline mr-1" />
                Food Type *
              </label>
              <select
                id="foodType"
                name="foodType"
                required
                value={form.foodType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select type...</option>
                {FOOD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Item Timing
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="expiryDate" className="form-label">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Expiry Date & Time *
              </label>
              <input
                id="expiryDate"
                name="expiryDate"
                type="datetime-local"
                required
                value={form.expiryDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              List Food Item
            </>
          )}
        </button>
      </form>
    </div>
  );
}
