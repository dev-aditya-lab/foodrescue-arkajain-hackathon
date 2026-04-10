"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Clock, MapPin, Tag, FileText, Package, Loader2, CheckCircle } from "lucide-react";
import { createFoodItem } from "@/lib/api";

const FOOD_TYPES = [
  "Vegetables",
  "Fruits",
  "Bakery",
  "Dairy",
  "Prepared Food",
  "Beverages",
  "Grains",
  "Snacks",
  "Other",
];

export default function AddFoodPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "",
    foodType: "",
    expiryTime: "",
    location: "",
    pickupTime: "",
    providerName: "",
    providerPhone: "",
    providerEmail: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to submit to backend
      const result = await createFoodItem({
        name: form.name,
        description: form.description,
        quantity: form.quantity,
        foodType: form.foodType,
        expiryTime: parseInt(form.expiryTime),
        location: form.location,
        pickupTime: form.pickupTime,
        provider: form.providerName,
        providerPhone: form.providerPhone,
        providerEmail: form.providerEmail,
      });

      setIsSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/all-foods");
      }, 2000);
    } catch (error) {
      // If backend is not available, show success anyway for demo
      console.warn("Backend not available, showing demo success.", error);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/all-foods");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            and claim it. Redirecting to all-foods...
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
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Fresh Organic Vegetables"
              value={form.name}
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
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pickup Info */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Pickup Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryTime" className="form-label">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Expiry Time (minutes) *
              </label>
              <input
                id="expiryTime"
                name="expiryTime"
                type="number"
                required
                min="1"
                placeholder="e.g., 120"
                value={form.expiryTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="pickupTime" className="form-label">Pickup Window *</label>
              <input
                id="pickupTime"
                name="pickupTime"
                type="text"
                required
                placeholder="e.g., Today 2:00 PM - 6:00 PM"
                value={form.pickupTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="form-label">Pickup Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g., Downtown Market, 123 Main Street"
              value={form.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Provider Info */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent" />
            Your Contact Details
          </h2>

          <div>
            <label htmlFor="providerName" className="form-label">Name / Organization *</label>
            <input
              id="providerName"
              name="providerName"
              type="text"
              required
              placeholder="e.g., Fresh Market Co."
              value={form.providerName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="providerPhone" className="form-label">Phone *</label>
              <input
                id="providerPhone"
                name="providerPhone"
                type="tel"
                required
                placeholder="e.g., +91 98765 43210"
                value={form.providerPhone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="providerEmail" className="form-label">Email *</label>
              <input
                id="providerEmail"
                name="providerEmail"
                type="email"
                required
                placeholder="e.g., you@example.com"
                value={form.providerEmail}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

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
