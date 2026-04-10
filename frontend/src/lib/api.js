/**
 * API Helper — Centralized backend connectivity layer.
 *
 * Set NEXT_PUBLIC_API_URL in .env.local to point to your backend.
 * Example: NEXT_PUBLIC_API_URL=http://localhost:5000/api
 *
 * All functions return JSON data from the backend.
 * They fall back to mock data when the API is unavailable.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.warn(`[API] Backend unavailable at ${url}. Using mock data.`);
      return null;
    }
    throw error;
  }
}

// ─── Food Items ───

/**
 * Fetch all food items with optional filters
 * @param {Object} filters - { search, distance, expiry, foodType }
 */
export async function fetchFoodItems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.distance) params.set("distance", filters.distance);
  if (filters.expiry && filters.expiry !== "all")
    params.set("expiry", filters.expiry);
  if (filters.foodType) params.set("foodType", filters.foodType);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/food-items${query}`);
}

/**
 * Fetch a single food item by ID
 * @param {string} id
 */
export async function getFoodItemById(id) {
  return apiFetch(`/food-items/${id}`);
}

/**
 * Create a new food item listing
 * @param {Object} data - { name, quantity, expiryTime, location, foodType, description, ... }
 */
export async function createFoodItem(data) {
  return apiFetch("/food/add-food", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Claim a food item
 * @param {string} id
 * @param {Object} claimData - { claimerName, claimerPhone, claimerEmail }
 */
export async function claimFoodItem(id, claimData = {}) {
  return apiFetch(`/claim/create-claim/${id}`, {
    method: "POST",
    body: JSON.stringify(claimData),
  });
}

/**
 * Delete a food item listing
 * @param {string} id
 */
export async function deleteFoodItem(id) {
  return apiFetch(`/food/delete-food/${id}`, {
    method: "DELETE",
  });
}

// ─── Stats ───

/**
 * Fetch platform stats (food shared, meals saved, active users)
 */
export async function fetchStats() {
  return apiFetch("/stats");
}

// ─── Auth (placeholder for future use) ───

/**
 * Login
 * @param {Object} credentials - { email, password }
 */
export async function login(credentials) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Register
 * @param {Object} userData - { name, email, password, phone }
 */
export async function register(userData) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Get current logged-in user from cookie session
 */
export async function getMe() {
  return apiFetch("/auth/get-me", {
    method: "GET",
  });
}

/**
 * Logout current user and clear cookie session
 */
export async function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

/**
 * Receiver: claims created by logged-in receiver
 */
export async function fetchMyClaims() {
  return apiFetch("/claim/my-claims", {
    method: "GET",
  });
}

/**
 * Provider: claims created on provider's food listings
 */
export async function fetchIncomingClaims() {
  return apiFetch("/claim/incoming-claims", {
    method: "GET",
  });
}

/**
 * Provider: update claim status
 */
export async function updateClaimStatus(claimId, status) {
  return apiFetch(`/claim/update-status/${claimId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Provider: get own food listings
 */
export async function fetchMyFoodItems() {
  return apiFetch("/food/my-food", {
    method: "GET",
  });
}
