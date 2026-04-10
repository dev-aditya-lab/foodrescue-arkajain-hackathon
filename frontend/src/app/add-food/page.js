"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Clock, MapPin, Tag, FileText, Package, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { createFoodItem, suggestFoodContent } from "@/lib/api";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: "",
    foodType: "",
    expiryDate: "",
    estimatedMeals: "",
    estimatedWeightKg: "",
  });
  const [aiDetails, setAiDetails] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("quantity", form.quantity);
      payload.append("foodType", form.foodType);
      payload.append("expiryDate", form.expiryDate);
      payload.append("estimatedMeals", form.estimatedMeals);
      payload.append("estimatedWeightKg", form.estimatedWeightKg);
      if (imageFile) {
        payload.append("image", imageFile);
      }

      await createFoodItem(payload, {
        onUploadProgress: (percent) => setUploadProgress(percent),
      });

      setUploadProgress(100);

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to add food item.");
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    setAiError("");
    setIsGenerating(true);

    try {
      const result = await suggestFoodContent({
        details: aiDetails,
        quantity: form.quantity,
        foodType: form.foodType,
      });

      setSuggestion(result?.suggestion || null);
    } catch (err) {
      setAiError(err.message || "Failed to generate AI suggestion.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestion = () => {
    if (!suggestion) return;
    setForm((prev) => ({
      ...prev,
      title: suggestion.title || prev.title,
      description: suggestion.description || prev.description,
    }));
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
        <div className="glass-card p-6 space-y-5 border border-primary/20">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Assist
            </h2>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Add a few details and AI will suggest a better title and description.
            You can accept or reject it.
          </p>

          <div>
            <label htmlFor="aiDetails" className="form-label">Quick Details for AI</label>
            <textarea
              id="aiDetails"
              name="aiDetails"
              rows={3}
              value={aiDetails}
              onChange={(e) => setAiDetails(e.target.value)}
              placeholder="Example: 1 packet approx 100-120 grams, fresh, packed today, suitable for 2 people"
              className="form-input resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateSuggestion}
              disabled={isGenerating || (!aiDetails && !form.quantity && !form.foodType)}
              className="btn-outline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Title + Description"}
            </button>

            {suggestion ? (
              <button
                type="button"
                onClick={handleUseSuggestion}
                className="btn-primary"
              >
                Use Suggestion
              </button>
            ) : null}

            {suggestion ? (
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground/75 hover:text-foreground hover:bg-muted"
              >
                Deny Suggestion
              </button>
            ) : null}
          </div>

          {aiError ? (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {aiError}
            </p>
          ) : null}

          {suggestion ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Suggestion</p>
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-semibold text-foreground">{suggestion.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm text-foreground/90">{suggestion.description}</p>
              </div>
            </div>
          ) : null}
        </div>

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
                placeholder="e.g., 1 packet (approx. 100-120 grams)"
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

            <div>
              <label htmlFor="estimatedMeals" className="form-label">Estimated Meals (manual)</label>
              <input
                id="estimatedMeals"
                name="estimatedMeals"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 20"
                value={form.estimatedMeals}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="estimatedWeightKg" className="form-label">Estimated Weight in KG (manual)</label>
              <input
                id="estimatedWeightKg"
                name="estimatedWeightKg"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 5.0"
                value={form.estimatedWeightKg}
                onChange={handleChange}
                className="form-input"
              />
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

        {isSubmitting && uploadProgress !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {uploadProgress < 100 ? "Uploading image and details..." : "Upload complete, finalizing..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-orange-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
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
