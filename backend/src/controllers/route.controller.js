import foodModel from '../model/food.model.js';

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatOsrmRoute(data) {
  const route = data?.routes?.[0];
  if (!route) return null;

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
    geometry: route.geometry,
    legs: route.legs || [],
  };
}

export async function getPickupRouteForFood(req, res) {
  try {
    const { foodId } = req.params;
    const foodItem = await foodModel
      .findById(foodId)
      .populate('provider', 'latitude longitude name organizationName');

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const providerLat = toNumber(foodItem?.provider?.latitude);
    const providerLng = toNumber(foodItem?.provider?.longitude);
    if (providerLat === null || providerLng === null) {
      return res.status(400).json({ message: 'Provider location is not available for routing' });
    }

    const queryUserLat = toNumber(req.query.userLat);
    const queryUserLng = toNumber(req.query.userLng);
    const userLat = queryUserLat ?? toNumber(req.user?.latitude);
    const userLng = queryUserLng ?? toNumber(req.user?.longitude);

    if (userLat === null || userLng === null) {
      return res.status(400).json({ message: 'User location is required to calculate route' });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${providerLng},${providerLat}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(osrmUrl);

    if (!response.ok) {
      return res.status(502).json({ message: 'Route service is temporarily unavailable' });
    }

    const data = await response.json();
    const route = formatOsrmRoute(data);

    if (!route) {
      return res.status(404).json({ message: 'No route found for this pickup' });
    }

    return res.status(200).json({
      message: 'Pickup route generated successfully',
      route,
      points: {
        user: { latitude: userLat, longitude: userLng },
        provider: {
          latitude: providerLat,
          longitude: providerLng,
          name: foodItem?.provider?.organizationName || foodItem?.provider?.name || 'Provider',
        },
      },
      food: {
        id: String(foodItem._id),
        title: foodItem.title,
        status: foodItem.status,
      },
    });
  } catch (error) {
    console.error('Error generating pickup route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
