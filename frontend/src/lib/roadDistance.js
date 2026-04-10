function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toCoord(value) {
  return Number(value);
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

  if (validItems.length === 0) {
    return items;
  }

  try {
    const destinations = validItems
      .map((item) => `${toCoord(item.providerLongitude)},${toCoord(item.providerLatitude)}`)
      .join(";");

    const url = `https://router.project-osrm.org/table/v1/driving/${source};${destinations}?sources=0&annotations=distance`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Road distance API failed");
    }

    const data = await response.json();
    const distances = data?.distances?.[0] || [];

    const distanceById = new Map();
    validItems.forEach((item, idx) => {
      const meters = distances[idx + 1];
      if (Number.isFinite(meters)) {
        distanceById.set(item.id, Number((meters / 1000).toFixed(1)));
      }
    });

    return items.map((item) => ({
      ...item,
      distance: distanceById.has(item.id) ? distanceById.get(item.id) : item.distance,
    }));
  } catch {
    return items.map((item) => {
      if (!isFiniteNumber(item.providerLatitude) || !isFiniteNumber(item.providerLongitude)) {
        return item;
      }

      const km = haversineKm(
        toCoord(userLat),
        toCoord(userLng),
        toCoord(item.providerLatitude),
        toCoord(item.providerLongitude)
      );

      return {
        ...item,
        distance: Number(km.toFixed(1)),
      };
    });
  }
}
