import { map as createMap, tileLayer, marker } from "https://esm.sh/leaflet@1.9.4";

let _map;
let _markers;

export function initMap(places = []) {
  const el = document.getElementById("map");
  if (!el) return;

  // Create or reuse map
  if (!_map) {
    _map = createMap(el).setView(places[0] ? [places[0].lat, places[0].lng] : [0, 0], places[0] ? 10 : 2);
    tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(_map);
  }

  // Clear old markers
  if (_markers) _map.removeLayer(_markers);
  _markers = L.layerGroup().addTo(_map);

  // Add markers
  places.forEach((p) => {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return;
    const mk = marker([p.lat, p.lng]).addTo(_markers);
    const title = p.title ?? "";
    const url = p.url ? `<br><a href="${p.url}">Open</a>` : "";
    mk.bindPopup(`<strong>${title}</strong>${url}`);
  });

  // Fit to markers
  if (places.length) {
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    _map.fitBounds(bounds, { padding: [20, 20] });
  }
}
