"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  deleteFoodItem,
  editFoodItem,
  fetchIncomingClaims,
  fetchMyClaims,
  fetchMyFoodItems,
  removeFoodItem,
  updateClaimStatus,
} from "@/lib/api";

export default function DashboardPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [myFoodItems, setMyFoodItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    quantity: "",
    foodType: "",
    offerType: "donation",
    discountedPrice: "",
    expiryDate: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      if (authLoading) return;
      setLoading(true);
      setError("");

      try {
        if (role === "provider") {
          const [claimsRes, foodRes] = await Promise.all([
            fetchIncomingClaims(),
            fetchMyFoodItems(),
          ]);

          if (!ignore) {
            setIncomingClaims(claimsRes?.claims || []);
            setMyFoodItems(foodRes?.foodItems || []);
          }
        } else {
          const claimsRes = await fetchMyClaims();
          if (!ignore) {
            setMyClaims(claimsRes?.claims || []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      ignore = true;
    };
  }, [authLoading, role]);

  const providerStats = useMemo(() => {
    const totalFood = myFoodItems.length;
    const availableFood = myFoodItems.filter((item) => item.status === "available").length;
    const pendingClaims = incomingClaims.filter((claim) => claim.status === "pending").length;
    return { totalFood, availableFood, pendingClaims };
  }, [incomingClaims, myFoodItems]);

  const receiverStats = useMemo(() => {
    const totalClaims = myClaims.length;
    const activeClaims = myClaims.filter((claim) => ["pending", "accepted"].includes(claim.status)).length;
    const completedClaims = myClaims.filter((claim) => claim.status === "completed").length;
    return { totalClaims, activeClaims, completedClaims };
  }, [myClaims]);

  const handleClaimStatusUpdate = async (claimId, status) => {
    try {
      await updateClaimStatus(claimId, status);
      setIncomingClaims((prev) => prev.map((claim) => (claim._id === claimId ? { ...claim, status } : claim)));
    } catch (err) {
      setError(err.message || "Unable to update claim status.");
    }
  };

  const startEdit = (item) => {
    setEditingItemId(item._id);
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      quantity: item.quantity || "",
      foodType: item.foodType || "",
      offerType: item.offerType || "donation",
      discountedPrice:
        item.discountedPrice === null || item.discountedPrice === undefined
          ? ""
          : String(item.discountedPrice),
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString().slice(0, 16)
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditForm({
      title: "",
      description: "",
      quantity: "",
      foodType: "",
      offerType: "donation",
      discountedPrice: "",
      expiryDate: "",
    });
  };

  const handleSaveEdit = async (itemId) => {
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        quantity: editForm.quantity,
        foodType: editForm.foodType,
        offerType: editForm.offerType,
        discountedPrice:
          editForm.offerType === "discounted-sale"
            ? editForm.discountedPrice
            : null,
        expiryDate: editForm.expiryDate || undefined,
      };

      const result = await editFoodItem(itemId, payload);
      const updated = result?.foodItem;

      setMyFoodItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, ...updated } : item))
      );
      cancelEdit();
    } catch (err) {
      setError(err.message || "Unable to update food item.");
    }
  };

  const handleRemoveFood = async (itemId) => {
    try {
      const result = await removeFoodItem(itemId);
      const updated = result?.foodItem;
      setMyFoodItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, ...updated } : item))
      );
    } catch (err) {
      setError(err.message || "Unable to remove food item.");
    }
  };

  const handleDeleteFood = async (itemId) => {
    try {
      await deleteFoodItem(itemId);
      setMyFoodItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      setError(err.message || "Unable to delete food item.");
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 space-y-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">No active user session found.</p>
          <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{role === "provider" ? "Provider Dashboard" : "Receiver Dashboard"}</h1>
        <p className="text-muted-foreground mt-2">Welcome {user.name}. Role-specific details and actions are shown below.</p>
      </div>

      {error ? (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(role === "provider"
          ? [
              { label: "My Food Items", value: providerStats.totalFood },
              { label: "Available Food", value: providerStats.availableFood },
              { label: "Pending Claims", value: providerStats.pendingClaims },
            ]
          : [
              { label: "Total Claims", value: receiverStats.totalClaims },
              { label: "Active Claims", value: receiverStats.activeClaims },
              { label: "Completed", value: receiverStats.completedClaims },
            ]).map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {role === "provider" ? (
        <>
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">My Food Listings</h2>
              <Link href="/add-food" className="btn-primary">Add Food</Link>
            </div>

            {myFoodItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No food listings yet.</p>
            ) : (
              <div className="space-y-3">
                {myFoodItems.slice(0, 8).map((item) => (
                  <div key={item._id} className="border border-border rounded-lg p-4 space-y-3">
                    {editingItemId === item._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="form-input"
                          placeholder="Title"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="form-input resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                            className="form-input"
                            placeholder="Quantity"
                          />
                          <select
                            value={editForm.foodType}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, foodType: e.target.value }))}
                            className="form-select"
                          >
                            <option value="veg">veg</option>
                            <option value="non-veg">non-veg</option>
                            <option value="mixed">mixed</option>
                          </select>
                          <input
                            type="datetime-local"
                            value={editForm.expiryDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={editForm.offerType}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, offerType: e.target.value }))}
                            className="form-select"
                          >
                            <option value="donation">Donation</option>
                            <option value="community-redistribution">Community Redistribution</option>
                            <option value="discounted-sale">Discounted Sale</option>
                          </select>

                          {editForm.offerType === "discounted-sale" ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editForm.discountedPrice}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, discountedPrice: e.target.value }))}
                              className="form-input"
                              placeholder="Discounted price"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleSaveEdit(item._id)} className="btn-primary" type="button">Save</button>
                          <button onClick={cancelEdit} className="btn-outline" type="button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} • Type: {item.foodType}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Offer: {String(item.offerType || "donation").replace(/-/g, " ")}
                            {item.offerType === "discounted-sale" && Number.isFinite(Number(item.discountedPrice))
                              ? ` (₹${Number(item.discountedPrice).toFixed(2)})`
                              : ""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-foreground capitalize">{item.status}</span>
                      </div>
                    )}

                    {editingItemId !== item._id ? (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => startEdit(item)} className="btn-outline" type="button">Edit</button>
                        {item.status === "available" ? (
                          <button onClick={() => handleRemoveFood(item._id)} className="btn-outline" type="button">Mark Expired</button>
                        ) : null}
                        <button
                          onClick={() => handleDeleteFood(item._id)}
                          className="px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-destructive hover:bg-red-50"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-bold">Incoming Claims</h2>
            {incomingClaims.length === 0 ? (
              <p className="text-muted-foreground text-sm">No incoming claims.</p>
            ) : (
              <div className="space-y-3">
                {incomingClaims.slice(0, 10).map((claim) => (
                  <div key={claim._id} className="border border-border rounded-lg p-4 space-y-2">
                    <p className="font-semibold">{claim.food?.title || "Food Item"}</p>
                    <p className="text-sm text-muted-foreground">Receiver: {claim.receiver?.name || "Unknown"} ({claim.receiver?.phone || "No phone"})</p>
                    <p className="text-xs text-muted-foreground capitalize">Status: {claim.status}</p>
                    {claim.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleClaimStatusUpdate(claim._id, "accepted")} className="btn-primary">Accept</button>
                        <button onClick={() => handleClaimStatusUpdate(claim._id, "rejected")} className="btn-outline">Reject</button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">My Claims</h2>
            <Link href="/all-foods" className="btn-primary">Browse Food</Link>
          </div>

          {myClaims.length === 0 ? (
            <p className="text-muted-foreground text-sm">You have not claimed any items yet.</p>
          ) : (
            <div className="space-y-3">
              {myClaims.slice(0, 12).map((claim) => (
                <div key={claim._id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{claim.food?.title || "Food Item"}</p>
                    <p className="text-sm text-muted-foreground">Location: {claim.food?.location || "Unknown"}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-foreground capitalize">{claim.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
