import { map, tileLayer, marker, icon, divIcon } from "https://esm.sh/leaflet@1.9.4";

export function initMap() {
  const container = document.getElementById("map");
  if (!container || !window.places) return;

  // Start map centered on first place or default
  const start = window.places[0] || { lat: 0, lng: 0 };
  const map = L.map("map").setView([start.lat, start.lng], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  const icons = {
    activity: L.divIcon({ className: "icon-activity" }),
    day_trip: L.divIcon({ className: "icon-daytrip" }),
    lodging: L.divIcon({ className: "icon-lodging" }),
    destination: L.divIcon({ className: "icon-destination" }),
  };

  window.places.forEach((p) => {
    const icon = icons[p.category] || icons.activity;
    L.marker([p.lat, p.lng], { icon })
      .addTo(map)
      .bindPopup(`<a href="${p.url}">${p.title}</a>`);
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", initMap);
