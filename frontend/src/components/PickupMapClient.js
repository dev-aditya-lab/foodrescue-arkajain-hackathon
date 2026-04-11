"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import { fetchFoodItems, fetchPickupRoute } from "@/lib/api";
import { mapFoodFromApi } from "@/lib/foodAdapter";
import { useAuth } from "@/context/AuthContext";

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const providerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function toMapLatLng(point) {
  if (!point || !Array.isArray(point) || point.length < 2) return null;
  return [point[1], point[0]];
}

export default function PickupMapClient({ initialFoodId = null }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState(initialFoodId);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState("");

  const selectableItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === "available" &&
          Number.isFinite(item.providerLatitude) &&
          Number.isFinite(item.providerLongitude)
      ),
    [items]
  );

  useEffect(() => {
    let ignore = false;

    async function loadItems() {
      setError("");
      try {
        const response = await fetchFoodItems();
        const mapped = (response?.foodItems || []).map(mapFoodFromApi).filter(Boolean);
        if (!ignore) {
          setItems(mapped);
          if (!selectedFoodId && mapped.length > 0) {
            setSelectedFoodId(mapped[0].id);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load food items for map");
        }
      }
    }

    loadItems();
    return () => {
      ignore = true;
    };
  }, [selectedFoodId]);

  useEffect(() => {
    let ignore = false;

    async function loadRoute() {
      if (!selectedFoodId) {
        setRouteData(null);
        return;
      }

      setIsLoadingRoute(true);
      setError("");
      try {
        const response = await fetchPickupRoute(selectedFoodId, {
          userLat: user?.latitude,
          userLng: user?.longitude,
        });
        if (!ignore) {
          setRouteData(response);
        }
      } catch (err) {
        if (!ignore) {
          setRouteData(null);
          setError(err.message || "Could not calculate route for this food item");
        }
      } finally {
        if (!ignore) {
          setIsLoadingRoute(false);
        }
      }
    }

    loadRoute();
    return () => {
      ignore = true;
    };
  }, [selectedFoodId, user?.latitude, user?.longitude]);

  const routePoints =
    routeData?.route?.geometry?.coordinates?.map(toMapLatLng).filter(Boolean) || [];

  const selectedItem = selectableItems.find((item) => item.id === selectedFoodId) || null;

  const mapCenter =
    (Number.isFinite(user?.latitude) && Number.isFinite(user?.longitude)
      ? [Number(user.latitude), Number(user.longitude)]
      : selectedItem && Number.isFinite(selectedItem.providerLatitude) && Number.isFinite(selectedItem.providerLongitude)
        ? [selectedItem.providerLatitude, selectedItem.providerLongitude]
        : [20.5937, 78.9629]);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5 space-y-3">
        <label className="text-sm font-semibold text-foreground block">Select food for pickup route</label>
        <select
          value={selectedFoodId || ""}
          onChange={(e) => setSelectedFoodId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        >
          {selectableItems.length === 0 ? <option value="">No mappable food items available</option> : null}
          {selectableItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.provider}
            </option>
          ))}
        </select>

        {isLoadingRoute ? <p className="text-sm text-muted-foreground">Calculating shortest route...</p> : null}
        {routeData?.route ? (
          <p className="text-sm text-muted-foreground">
            Route: <span className="font-semibold text-foreground">{routeData.route.distanceKm} km</span> | ETA: <span className="font-semibold text-foreground">{routeData.route.durationMinutes} min</span>
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="h-[500px] w-full">
          <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {Number.isFinite(user?.latitude) && Number.isFinite(user?.longitude) ? (
              <Marker position={[Number(user.latitude), Number(user.longitude)]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            ) : null}

            {selectableItems.map((item) => (
              <Marker
                key={item.id}
                position={[item.providerLatitude, item.providerLongitude]}
                icon={providerIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs">Provider: {item.provider}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${Number(item.providerLatitude)},${Number(item.providerLongitude)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 underline"
                    >
                      Open in Google Maps
                    </a>
                    <p className="text-[11px] text-muted-foreground">
                      {Number(item.providerLatitude).toFixed(5)}, {Number(item.providerLongitude).toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {routePoints.length > 1 ? <Polyline positions={routePoints} pathOptions={{ color: "#f97316", weight: 5 }} /> : null}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
