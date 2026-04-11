export function buildGoogleMapsLink(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
