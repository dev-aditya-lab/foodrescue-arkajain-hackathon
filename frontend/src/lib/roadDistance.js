function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toCoord(value) {
  return Number(value);
}

const DISTANCE_CACHE_TTL_MS = 5 * 60 * 1000;
const OSRM_TIMEOUT_MS = 1500;
const distanceCache = new Map();

function coordKey(lat, lng) {
  return `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;
}

function cacheKey(userLat, userLng, providerLat, providerLng) {
  return `${coordKey(userLat, userLng)}->${coordKey(providerLat, providerLng)}`;
}

function getCachedDistance(key) {
  const hit = distanceCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.timestamp > DISTANCE_CACHE_TTL_MS) {
    distanceCache.delete(key);
    return null;
  }
  return hit.distance;
}

function setCachedDistance(key, distance) {
  distanceCache.set(key, { distance, timestamp: Date.now() });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function attachRoadDistances(items, user) {
  const userLat = user?.latitude;
  const userLng = user?.longitude;

  if (!isFiniteNumber(userLat) || !isFiniteNumber(userLng) || !Array.isArray(items)) {
    return items;
  }

  const source = `${toCoord(userLng)},${toCoord(userLat)}`;
  const validItems = items.filter(
    (item) => isFiniteNumber(item.providerLatitude) && isFiniteNumber(item.providerLongitude)
  );

  const cachedDistances = new Map();
  const missingItems = [];

  validItems.forEach((item) => {
    const key = cacheKey(userLat, userLng, item.providerLatitude, item.providerLongitude);
    const cached = getCachedDistance(key);
    if (cached !== null) {
      cachedDistances.set(item.id, cached);
    } else {
      missingItems.push(item);
    }
  });

  if (validItems.length === 0) {
    return items;
  }

  if (missingItems.length === 0) {
    return items.map((item) => ({
      ...item,
      distance: cachedDistances.has(item.id) ? cachedDistances.get(item.id) : item.distance,
    }));
  }

  try {
    const destinations = missingItems
      .map((item) => `${toCoord(item.providerLongitude)},${toCoord(item.providerLatitude)}`)
      .join(";");

    const url = `https://router.project-osrm.org/table/v1/driving/${source};${destinations}?sources=0&annotations=distance`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      throw new Error("Road distance API failed");
    }

    const data = await response.json();
    const distances = data?.distances?.[0] || [];

    const distanceById = new Map();
    missingItems.forEach((item, idx) => {
      const meters = distances[idx + 1];
      if (Number.isFinite(meters)) {
        const km = Number((meters / 1000).toFixed(1));
        const key = cacheKey(userLat, userLng, item.providerLatitude, item.providerLongitude);
        setCachedDistance(key, km);
        distanceById.set(item.id, km);
      }
    });

    cachedDistances.forEach((km, itemId) => {
      distanceById.set(itemId, km);
    });

    return items.map((item) => ({
      ...item,
      distance: distanceById.has(item.id) ? distanceById.get(item.id) : item.distance,
    }));
  } catch {
    const fallbackById = new Map();

    missingItems.forEach((item) => {
      if (!isFiniteNumber(item.providerLatitude) || !isFiniteNumber(item.providerLongitude)) {
        return;
      }

      const km = haversineKm(
        toCoord(userLat),
        toCoord(userLng),
        toCoord(item.providerLatitude),
        toCoord(item.providerLongitude)
      );

      const roundedKm = Number(km.toFixed(1));
      const key = cacheKey(userLat, userLng, item.providerLatitude, item.providerLongitude);
      setCachedDistance(key, roundedKm);
      fallbackById.set(item.id, roundedKm);
    });

    cachedDistances.forEach((km, itemId) => {
      fallbackById.set(itemId, km);
    });

    return items.map((item) => ({
      ...item,
      distance: fallbackById.has(item.id) ? fallbackById.get(item.id) : item.distance,
    }));
  }
}
