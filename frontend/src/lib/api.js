/**
 * API Helper — Centralized backend connectivity layer.
 *
 * Set NEXT_PUBLIC_API_URL in .env.local to point to your backend.
 * Example: NEXT_PUBLIC_API_URL=http://localhost:5000/api
 *
 * All functions return JSON data from the backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function uploadWithProgress(endpoint, formData, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${endpoint}`);
    xhr.withCredentials = true;

    if (typeof onUploadProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onUploadProgress(percent);
      };
    }

    xhr.onerror = () => {
      reject(new Error(`Backend unavailable at ${API_BASE_URL}. Start backend server and retry.`));
    };

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader("Content-Type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? JSON.parse(xhr.responseText || "{}") : {};

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(
        new Error(data.message || `API error: ${xhr.status} ${xhr.statusText}`)
      );
    };

    xhr.send(formData);
  });
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const config = {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
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
      throw new Error(`Backend unavailable at ${API_BASE_URL}. Start backend server and retry.`);
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
  if (filters.foodType) params.set("foodType", filters.foodType);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/food/list${query}`);
}

/**
 * Fetch a single food item by ID
 * @param {string} id
 */
export async function getFoodItemById(id) {
  return apiFetch(`/food/${id}`);
}

/**
 * Create a new food item listing
 * @param {Object} data - { name, quantity, expiryTime, location, foodType, description, ... }
 */
export async function createFoodItem(data, options = {}) {
  if (data instanceof FormData) {
    if (typeof options.onUploadProgress === "function") {
      return uploadWithProgress("/food/add-food", data, options.onUploadProgress);
    }

    return apiFetch("/food/add-food", {
      method: "POST",
      body: data,
    });
  }

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

/**
 * Provider: edit a food item
 */
export async function editFoodItem(id, data) {
  return apiFetch(`/food/edit-food/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Provider: soft remove (expire) a food item
 */
export async function removeFoodItem(id) {
  return apiFetch(`/food/remove-food/${id}`, {
    method: "PATCH",
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

/**
 * Provider: AI suggestion for title/description from minimal details
 */
export async function suggestFoodContent(payload) {
  return apiFetch("/food/ai-suggest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
