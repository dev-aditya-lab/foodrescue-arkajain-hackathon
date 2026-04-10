export function mapFoodFromApi(item) {
  if (!item) return null;

  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const now = Date.now();
  const expiryMs = expiryDate ? expiryDate.getTime() - now : 0;
  const expiryMinutes = Math.max(0, Math.floor(expiryMs / 60000));

  const providerName =
    item.organizationName || item.provider?.organizationName || item.provider?.name || "Provider";

  const pickupTime = expiryDate
    ? `Pickup before ${expiryDate.toLocaleString()}`
    : "Pickup window not set";

  return {
    id: item._id,
    name: item.title,
    quantity: item.quantity,
    distance: null,
    expiryTime: expiryMinutes,
    location: item.location || "Location not provided",
    foodType: item.foodType,
    provider: providerName,
    providerPhone: item.provider?.phone || "-",
    providerEmail: item.provider?.email || "-",
    pickupTime,
    description: item.description,
    image: item.imageUrl || null,
    status: item.status,
  };
}
