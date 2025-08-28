import { map as createMap, tileLayer, marker } from "https://esm.sh/leaflet@1.9.4";

export function initMap() {
  const container = document.getElementById("map");
  if (!container || !window.places) return;

  // Start map centered on first place or default
  const start = window.places[0] || { lat: 0, lng: 0 };
  const m = createMap("map").setView([start.lat, start.lng], 9);

  tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(m);

  // Just use regular marker for all places
  window.places.forEach((p) => {
    marker([p.lat, p.lng])
      .addTo(m)
      .bindPopup(`<a href="${p.url}">${p.title}</a>`);
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", initMap);
