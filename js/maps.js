import {
  map as createMap,
  tileLayer,
  marker,
  divIcon,
  layerGroup,
  polyline,
  latLngBounds,
} from "https://esm.sh/leaflet@1.9.4";

const DESKTOP_MQ = "(min-width: 900px)";

const STAY_ICON = `<span class="map-marker map-marker-stay" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg></span>`;

const ACTIVITY_ICON = `<span class="map-marker map-marker-activity" aria-hidden="true"></span>`;

let _map;
let _markersLayer;
let _routeLayer = null;
let _markersByStopId = new Map();
let _markersByPlaceId = new Map();
let _activeStopId = null;
let _activePlaceId = null;
let _linkBound = false;
let _options = {};
let _lastPlaces = [];

function isDesktop() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function markerIcon(markerType) {
  const isStay = markerType === "stay";
  return divIcon({
    className: "",
    html: isStay ? STAY_ICON : ACTIVITY_ICON,
    iconSize: isStay ? [30, 30] : [28, 36],
    iconAnchor: isStay ? [15, 15] : [14, 34],
    popupAnchor: [0, isStay ? -16 : -30],
  });
}

function numberedIcon(n) {
  return divIcon({
    className: "map-number-icon",
    html: `<span class="map-marker map-marker-number" aria-hidden="true">${n}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function popupHtml(p) {
  const title = p.title ?? "";
  const url = p.url ? `<br><a href="${p.url}">Open</a>` : "";
  const kind = p.category ? `<br><em>${p.category}</em>` : "";
  return `<strong>${title}</strong>${kind}${url}`;
}

function setMarkerActive(mk, active, { openPopup = false } = {}) {
  const el = mk.getElement?.();
  if (el) {
    el.classList.toggle("map-marker-active", active);
    el.querySelector(".map-marker")?.classList.toggle("is-active", active);
  }
  mk.setZIndexOffset(active ? 1000 : 0);
  if (openPopup) mk.openPopup();
  else if (!active) mk.closePopup();
}

function clearMapHighlight() {
  for (const mk of _markersByPlaceId.values()) {
    setMarkerActive(mk, false);
  }
  for (const el of document.querySelectorAll(".is-map-active")) {
    el.classList.remove("is-map-active");
  }
  _activeStopId = null;
  _activePlaceId = null;
}

function centerOnMarkers(markers) {
  if (!markers.length || !_map) return;

  if (markers.length === 1) {
    const targetZoom = Math.max(_map.getZoom(), 14);
    _map.setView(markers[0].getLatLng(), targetZoom, { animate: true });
    return;
  }

  const bounds = latLngBounds(markers.map((m) => m.getLatLng()));
  _map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15, animate: true });
}

function scrollListToStop(stopId) {
  if (!_options.scrollList || !stopId) return;
  const el = document.querySelector(
    `[data-map-stop-id="${CSS.escape(stopId)}"]`,
  );
  el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function focusPlace(placeId, { scroll = false } = {}) {
  const mk = _markersByPlaceId.get(placeId);
  if (!mk) return;

  clearMapHighlight();
  _activePlaceId = placeId;
  _activeStopId = mk._placeData?.stopId ?? null;

  setMarkerActive(mk, true, { openPopup: true });
  _map.setView(mk.getLatLng(), Math.max(_map.getZoom(), 14), { animate: true });

  if (_activeStopId) {
    document
      .querySelector(`[data-map-stop-id="${CSS.escape(_activeStopId)}"]`)
      ?.classList.add("is-map-active");
  }
  document
    .querySelector(`[data-map-place-id="${CSS.escape(placeId)}"]`)
    ?.classList.add("is-map-active");

  if (scroll) scrollListToStop(_activeStopId);
}

function focusStop(stopId, { scroll = false, openPopup = true } = {}) {
  const markers = _markersByStopId.get(stopId);
  if (!markers?.length) return;

  clearMapHighlight();
  _activeStopId = stopId;

  markers.forEach((mk, i) => {
    setMarkerActive(mk, true, { openPopup: openPopup && i === 0 });
  });

  document
    .querySelector(`[data-map-stop-id="${CSS.escape(stopId)}"]`)
    ?.classList.add("is-map-active");

  centerOnMarkers(markers);
  if (scroll) scrollListToStop(stopId);
}

function assignNumbers(places) {
  const order = [];
  for (const p of places) {
    const stopId = p.stopId || p.id || p.url || "stop";
    if (!order.includes(stopId)) order.push(stopId);
  }
  const byStop = new Map(order.map((id, i) => [id, i + 1]));
  return places.map((p) => {
    const stopId = p.stopId || p.id || p.url || "stop";
    return {
      ...p,
      number: p.number ?? byStop.get(stopId) ?? null,
    };
  });
}

/** Ordered unique waypoints for route line / export. */
export function uniqueWaypoints(places = []) {
  const seen = new Set();
  const out = [];
  for (const p of places) {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") continue;
    const key = p.stopId || p.id || `${p.lat},${p.lng}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function googleMapsDirectionsUrl(places = []) {
  const points = uniqueWaypoints(places).slice(0, 10);
  if (!points.length) return "";
  if (points.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${points[0].lat},${points[0].lng}`;
  }
  const origin = `${points[0].lat},${points[0].lng}`;
  const destination =
    `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const mid = points.slice(1, -1).map((p) => `${p.lat},${p.lng}`).join("|");
  let url =
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  if (mid) url += `&waypoints=${encodeURIComponent(mid)}`;
  return url;
}

function drawRoute(places) {
  if (_routeLayer) {
    _map.removeLayer(_routeLayer);
    _routeLayer = null;
  }
  const points = uniqueWaypoints(places);
  if (points.length < 2 || !_map) return;
  _routeLayer = polyline(
    points.map((p) => [p.lat, p.lng]),
    {
      color: getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim() || "#2f5d50",
      weight: 3.5,
      opacity: 0.72,
      dashArray: "8 10",
      lineJoin: "round",
    },
  ).addTo(_map);
}

function bindListMapLink({
  listSelector = "[data-map-stop-id]",
  placeSelector = "[data-map-place-id]",
} = {}) {
  if (_linkBound) return;
  _linkBound = true;

  const mapEl = document.getElementById("map");

  for (const el of document.querySelectorAll(placeSelector)) {
    const placeId = el.dataset.mapPlaceId;
    if (!placeId) continue;

    el.addEventListener("mouseenter", () => {
      if (isDesktop()) focusPlace(placeId);
    });
    el.addEventListener("mouseleave", (e) => {
      if (!isDesktop()) return;
      if (e.relatedTarget?.closest?.(placeSelector)) return;
      if (e.relatedTarget?.closest?.(listSelector)) return;
      if (mapEl?.contains(e.relatedTarget)) return;
      clearMapHighlight();
    });
    el.addEventListener("click", (e) => {
      if (e.target.closest?.("a")) return;
      focusPlace(placeId, { scroll: false });
    });
  }

  for (const el of document.querySelectorAll(listSelector)) {
    const stopId = el.dataset.mapStopId;
    if (!stopId) continue;

    el.addEventListener("mouseenter", () => {
      if (isDesktop()) focusStop(stopId, { openPopup: true });
    });
    el.addEventListener("mouseleave", (e) => {
      if (!isDesktop()) return;
      if (e.relatedTarget?.closest?.(placeSelector)) return;
      if (e.relatedTarget?.closest?.(listSelector)) return;
      if (mapEl?.contains(e.relatedTarget)) return;
      clearMapHighlight();
    });
    el.addEventListener("click", (e) => {
      if (e.target.closest?.("a")) return;
      focusStop(stopId, { openPopup: true });
    });
  }

  for (const mk of _markersByPlaceId.values()) {
    mk.on("mouseover", () => {
      if (!isDesktop()) return;
      const placeId = mk._placeData?.id;
      if (placeId) focusPlace(placeId);
    });
    mk.on("mouseout", () => {
      if (!isDesktop()) return;
      clearMapHighlight();
    });
    mk.on("click", () => {
      const stopId = mk._placeData?.stopId;
      const placeId = mk._placeData?.id;
      if (placeId) focusPlace(placeId, { scroll: !!_options.scrollList });
      else if (stopId) focusStop(stopId, { scroll: !!_options.scrollList });
    });
  }
}

function fitVisibleMarkers() {
  if (!_map) return;
  const visible = [..._markersByPlaceId.values()].filter((mk) =>
    _markersLayer?.hasLayer(mk)
  );
  if (visible.length === 1) {
    _map.setView(visible[0].getLatLng(), Math.max(_map.getZoom(), 12));
  } else if (visible.length > 1) {
    const bounds = latLngBounds(visible.map((m) => m.getLatLng()));
    _map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }
}

/** Show only markers whose stopId is in stopIds. Pass null to show all. */
export function setVisibleStopIds(stopIds) {
  if (!_markersLayer) return;
  const set = stopIds == null ? null : new Set(stopIds);

  for (const mk of _markersByPlaceId.values()) {
    const stopId = mk._placeData?.stopId;
    const visible = set == null || (stopId && set.has(stopId));
    if (visible) {
      if (!_markersLayer.hasLayer(mk)) mk.addTo(_markersLayer);
    } else if (_markersLayer.hasLayer(mk)) {
      _markersLayer.removeLayer(mk);
    }
  }

  clearMapHighlight();
  fitVisibleMarkers();
}

export function invalidateMapSize() {
  _map?.invalidateSize?.();
}

export function initMap(places = [], options = {}) {
  const el = document.getElementById("map");
  if (!el) return;

  _options = options;
  let valid = places.filter(
    (p) => typeof p.lat === "number" && typeof p.lng === "number",
  );
  if (options.numbered) valid = assignNumbers(valid);
  _lastPlaces = valid;

  if (!_map) {
    const center = valid[0] ? [valid[0].lat, valid[0].lng] : [0, 0];
    const zoom = valid[0] ? 10 : 2;
    _map = createMap(el).setView(center, zoom);
    tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(_map);
  }

  if (_routeLayer) {
    _map.removeLayer(_routeLayer);
    _routeLayer = null;
  }
  if (_markersLayer) _map.removeLayer(_markersLayer);
  _markersLayer = layerGroup().addTo(_map);
  _markersByStopId = new Map();
  _markersByPlaceId = new Map();
  _activeStopId = null;
  _activePlaceId = null;
  _linkBound = false;

  for (const p of valid) {
    const markerType = p.markerType === "stay" ? "stay" : "activity";
    const numberStay = options.numberStay !== false;
    const useNumber = options.numbered && p.number != null &&
      (markerType !== "stay" || numberStay);
    const icon = useNumber ? numberedIcon(p.number) : markerIcon(markerType);
    const mk = marker([p.lat, p.lng], { icon }).addTo(_markersLayer);
    mk.bindPopup(popupHtml(p));
    mk._placeData = p;

    const stopId = p.stopId || p.id || p.url || "stop";
    const placeId = p.id || `${stopId}-main`;

    if (!_markersByStopId.has(stopId)) _markersByStopId.set(stopId, []);
    _markersByStopId.get(stopId).push(mk);
    _markersByPlaceId.set(placeId, mk);
  }

  if (options.route) drawRoute(valid);

  if (valid.length === 1) {
    _map.setView([valid[0].lat, valid[0].lng], 12);
  } else if (valid.length > 1) {
    const bounds = latLngBounds(valid.map((p) => [p.lat, p.lng]));
    _map.fitBounds(bounds, { padding: [24, 24] });
  }

  if (options.linkList) {
    bindListMapLink(options);
  }

  // Wire export links if present
  for (const a of document.querySelectorAll("[data-gmaps-export]")) {
    const href = googleMapsDirectionsUrl(valid);
    if (href) {
      a.href = href;
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  }

  requestAnimationFrame(() => _map?.invalidateSize?.());
}

/** Wire List/Map toggle + filter chips for an `.eater-map` root. */
export function initEaterMapChrome(root, places = [], options = {}) {
  if (!root) return;

  initMap(places, {
    linkList: true,
    numbered: true,
    scrollList: true,
    ...options,
  });

  const toggle = root.querySelector("[data-eater-view-toggle]");
  toggle?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    const view = btn.getAttribute("data-view");
    root.classList.toggle("is-map-mode", view === "map");
    root.classList.toggle("is-list-mode", view === "list");
    for (const b of toggle.querySelectorAll("[data-view]")) {
      const on = b.getAttribute("data-view") === view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (view === "map") {
      requestAnimationFrame(() => {
        invalidateMapSize();
        fitVisibleMarkers();
      });
    }
  });

  const filters = root.querySelector("[data-eater-filters]");
  if (!filters) return;

  const rows = [...root.querySelectorAll("[data-eater-item]")];

  function applyFilters() {
    const cat = filters.querySelector("[data-filter-cat].is-active")
      ?.getAttribute("data-filter-cat") || "all";
    const kind = filters.querySelector("[data-filter-kind].is-active")
      ?.getAttribute("data-filter-kind") || "all";

    const visibleStopIds = [];
    for (const row of rows) {
      const rowCat = row.getAttribute("data-travel-category") || "";
      const rowKind = row.getAttribute("data-kind") || "";
      const matchCat = cat === "all" || rowCat === cat;
      const matchKind = kind === "all" || rowKind === kind;
      const show = matchCat && matchKind;
      row.hidden = !show;
      const stopId = row.getAttribute("data-map-stop-id");
      if (show && stopId) visibleStopIds.push(stopId);
    }

    setVisibleStopIds(visibleStopIds);
  }

  filters.addEventListener("click", (e) => {
    const catBtn = e.target.closest("[data-filter-cat]");
    const kindBtn = e.target.closest("[data-filter-kind]");
    if (catBtn) {
      for (const b of filters.querySelectorAll("[data-filter-cat]")) {
        b.classList.toggle("is-active", b === catBtn);
      }
      applyFilters();
    }
    if (kindBtn) {
      for (const b of filters.querySelectorAll("[data-filter-kind]")) {
        b.classList.toggle("is-active", b === kindBtn);
      }
      applyFilters();
    }
  });
}
