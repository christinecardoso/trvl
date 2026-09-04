/** Geo helpers for route legs and Google Maps export (Wanderlog-style). */

const EARTH_KM = 6371;

export function haversineKm(a, b) {
  const lat1 = Number(a?.lat);
  const lng1 = Number(a?.lng);
  const lat2 = Number(b?.lat);
  const lng2 = Number(b?.lng);
  if (
    !Number.isFinite(lat1) || !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) || !Number.isFinite(lng2)
  ) {
    return null;
  }
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rough drive-time estimate (~30 km/h city / mountain average). */
export function estimateMinutes(km) {
  if (!Number.isFinite(km) || km <= 0) return null;
  return Math.max(1, Math.round((km / 30) * 60));
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatDuration(mins) {
  if (!Number.isFinite(mins)) return "";
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}

/**
 * One ordered waypoint per stopId (first lat/lng seen).
 * mapPlaces should already be in day order.
 */
export function uniqueWaypoints(mapPlaces = []) {
  const seen = new Set();
  const out = [];
  for (const p of mapPlaces) {
    const lat = Number(p.lat);
    const lng = Number(p.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const key = p.stopId || p.id || `${lat},${lng}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...p,
      lat,
      lng,
      stopId: key,
      number: p.number ?? out.length + 1,
    });
  }
  return out;
}

/** Legs between consecutive waypoints with distance + rough ETA. */
export function buildRouteLegs(mapPlaces = []) {
  const points = uniqueWaypoints(mapPlaces);
  const legs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const km = haversineKm(from, to);
    const mins = estimateMinutes(km);
    legs.push({
      fromStopId: from.stopId,
      toStopId: to.stopId,
      fromTitle: from.title || "",
      toTitle: to.title || "",
      fromNumber: from.number,
      toNumber: to.number,
      km,
      miles: Number.isFinite(km) ? km * 0.621371 : null,
      minutes: mins,
      distanceLabel: formatDistance(km),
      durationLabel: formatDuration(mins),
      label: [formatDistance(km), formatDuration(mins)].filter(Boolean).join(" · "),
    });
  }
  return legs;
}

/** Google Maps directions for ordered waypoints (max ~10 in free URL). */
export function googleMapsDirectionsUrl(mapPlaces = []) {
  const points = uniqueWaypoints(mapPlaces).slice(0, 10);
  if (points.length < 2) {
    if (points.length === 1) {
      const p = points[0];
      return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    }
    return "";
  }
  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const waypoints = points
    .slice(1, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");
  let url =
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  if (waypoints) {
    url += `&waypoints=${encodeURIComponent(waypoints)}`;
  }
  return url;
}

/** Multi-pin list view in Google Maps (no routing). */
export function googleMapsSearchUrl(mapPlaces = []) {
  const points = uniqueWaypoints(mapPlaces);
  if (!points.length) return "";
  if (points.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${points[0].lat},${points[0].lng}`;
  }
  return googleMapsDirectionsUrl(points);
}
