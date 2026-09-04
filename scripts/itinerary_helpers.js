/** Shared itinerary helpers for archive / day / timetable pages */

import {
  buildHubThemes,
  normalizeThemes,
  themePageUrl,
  themeLabel,
} from "./themes.js";
import { buildHubWeekly, normalizeWeekly } from "./weekly.js";
import {
  buildRouteLegs,
  googleMapsDirectionsUrl,
  uniqueWaypoints,
} from "./geo.js";

export { buildRouteLegs, googleMapsDirectionsUrl, uniqueWaypoints };

export function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function expandDays(p) {
  const out = [];
  if (p.itinerary_day != null) {
    if (Array.isArray(p.itinerary_day)) {
      for (const d of p.itinerary_day) out.push(Number(d));
    } else {
      out.push(Number(p.itinerary_day));
    }
  }

  const multi = p.itinerary_days;
  if (Array.isArray(multi)) {
    for (const d of multi) out.push(Number(d));
  } else if (multi != null) {
    const s = String(multi).trim();
    for (const token of s.split(/[, ]+/).filter(Boolean)) {
      const m = token.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (m) {
        const a = Number(m[1]), b = Number(m[2]);
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i);
      } else {
        out.push(Number(token));
      }
    }
  }
  return [...new Set(out.filter((n) => Number.isFinite(n)))];
}

export function sortPages(a, b) {
  const ak = String(a.kind || "").toLowerCase() === "lodging" ? 0 : 1;
  const bk = String(b.kind || "").toLowerCase() === "lodging" ? 0 : 1;
  if (ak !== bk) return ak - bk;
  const an = Number(a.order);
  const bn = Number(b.order);
  const ao = Number.isFinite(an) ? an : 9999;
  const bo = Number.isFinite(bn) ? bn : 9999;
  if (ao !== bo) return ao - bo;
  return String(a.title || "").localeCompare(String(b.title || ""));
}

/** Stable id linking a list item to its map marker(s). */
export function mapStopId(item) {
  if (item?.map_stop_id) return item.map_stop_id;
  return item?.slug || slugify(item?.title) || slugify(item?.url || "stop");
}

/** Map pin style — lodging uses a distinct stay marker. */
export function mapMarkerType(item) {
  const kind = String(item?.kind || "").toLowerCase();
  if (kind === "lodging") return "stay";
  const block = String(item?.block_type || "").toLowerCase();
  if (block === "stay") return "stay";
  return "activity";
}

export function stopHasMap(item) {
  const plat = Number(item?.lat);
  const plng = Number(item?.lng);
  if (Number.isFinite(plat) && Number.isFinite(plng)) return true;

  for (const c of normalizePlaces(item?.places)) {
    if (c.lat != null && c.lng != null) return true;
  }
  for (const c of normalizeOptions(item)) {
    if (c.lat != null && c.lng != null) return true;
  }
  return false;
}

export function buildMapPlaces(items) {
  const out = [];
  for (const p of items) {
    const stopId = mapStopId(p);
    const markerType = mapMarkerType(p);
    const plat = Number(p.lat), plng = Number(p.lng);
    if (Number.isFinite(plat) && Number.isFinite(plng)) {
      out.push({
        id: `${stopId}-main`,
        stopId,
        title: p.title || "",
        url: p.url || "",
        lat: plat,
        lng: plng,
        category: markerType === "stay" ? "Stay" : (p.travel_category || p.kind || "activity"),
        markerType,
      });
    }
    for (const c of normalizePlaces(p.places)) {
      if (c.lat != null && c.lng != null) {
        const placeKey = slugify(c.name || c.title || "place");
        out.push({
          id: `${stopId}-${placeKey}`,
          stopId,
          title: c.name || c.title || "",
          url: c.url || p.url || "",
          lat: c.lat,
          lng: c.lng,
          category: markerType === "stay" ? "Stay" : (c.type || p.travel_category || p.kind || "activity"),
          markerType,
        });
      }
    }
    for (const c of normalizeOptions(p)) {
      if (c.lat != null && c.lng != null) {
        const placeKey = slugify(c.title || c.name || "option");
        out.push({
          id: `${stopId}-${placeKey}`,
          stopId,
          title: c.title || c.name || "",
          url: c.url || p.url || "",
          lat: c.lat,
          lng: c.lng,
          category: markerType === "stay" ? "Stay" : (c.type || p.travel_category || p.kind || "activity"),
          markerType,
        });
      }
    }
  }
  return out;
}

/** Canonical public URL for a base destination hub. */
export function destinationHubUrl(page) {
  const slug = page?.slug || page?.base || slugify(page?.title);
  if (!slug) return page?.url || "";
  return `/destinations/${slug}/`;
}

/** Canonical public URL for an itinerary overview. */
export function itineraryOverviewUrl(page) {
  const slug = page?.itinerary_slug || page?.slug || slugify(page?.title);
  if (!slug) return page?.url || "";
  return `/itineraries/${slug}/`;
}

/** Legacy file-path URL before canonical overrides (for redirects). */
export function legacyUrlFromSrc(srcPath, title) {
  if (!srcPath) return null;
  const parts = String(srcPath).replace(/\\/g, "/").split("/");
  const idx = parts.indexOf("posts");
  if (idx === -1) return null;
  const segments = parts.slice(idx + 1);
  let file = segments.pop() || "";
  if (!file.endsWith(".md")) {
    // Lume preprocess src.path may omit the extension
    file = `${file}.md`;
  }
  const baseName = file.slice(0, -3);
  const slug = slugify(baseName === "index" ? title : baseName);
  if (!slug) return null;
  return `/${segments.join("/")}/${slug}/`.replace(/\/+/g, "/");
}

const HUB_CATEGORY_ORDER = [
  { key: "In city", label: "In the city" },
  { key: "Walkable", label: "Walkable" },
  { key: "Nearby", label: "Nearby" },
  { key: "Day Trip", label: "Day trips" },
  { key: "Overnight Trip", label: "Overnight trips" },
  { key: "Fly-In Destination", label: "Fly-in" },
];

const REFERENCE_SECTION_ORDER = [
  { key: "food", label: "Food to try" },
  { key: "highlights", label: "Must-see highlights" },
  { key: "unique", label: "Unique experiences" },
  { key: "book-ahead", label: "Book ahead" },
  { key: "tips", label: "Insider tips" },
  { key: "when-to-go", label: "When to go" },
];

function hubSlugOf(page) {
  return page?.slug || page?.base || page?.hub || page?.destination_slug || "";
}

function pageBelongsToHub(page, hub) {
  if (!page || page.draft || page.redirect_to || page.redirectTo) return false;
  if (page.isBase) return false;
  const hubSlug = hubSlugOf(hub);
  if (!hubSlug) return false;
  const dest = page.destination_slug || page.hub || page.base;
  return dest === hubSlug;
}

function excerptPlain(content, max = 160) {
  const raw = String(content || "")
    .split(/<!--\s*more\s*-->/i)[0]
    .replace(/^#+\s.*$/gm, "")
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trim()}…`;
}

/**
 * Assemble destination hub panels from related stops + reference posts.
 * Replaces broken travelCategories relation and duplicated hub lists.
 */
export function buildDestinationHub(hub, allPages = []) {
  const hubSlug = hubSlugOf(hub);
  const related = allPages.filter((p) => pageBelongsToHub(p, hub));

  const stopKinds = new Set(["activity", "eats", "lodging", "destination", "media"]);
  const stops = related.filter((p) => {
    if (String(p.type || "").toLowerCase() === "itinerary") return false;
    if (String(p.layout || "").includes("redirect")) return false;
    return stopKinds.has(String(p.kind || "activity").toLowerCase());
  });

  const byCategory = new Map();
  for (const stop of stops) {
    if (String(stop.kind || "").toLowerCase() === "media") continue;
    const key = String(stop.travel_category || "").trim() || "More";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(stop);
  }

  const categoryGroups = [];
  const seenKeys = new Set();
  for (const { key, label } of HUB_CATEGORY_ORDER) {
    const items = byCategory.get(key);
    if (!items?.length) continue;
    seenKeys.add(key);
    categoryGroups.push({
      key: slugify(key),
      label,
      travel_category: key,
      count: items.length,
      items: items
        .slice()
        .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")))
        .map((p) => ({
          title: p.title,
          url: p.url,
          kind: p.kind,
          visit_time: p.visit_time || "",
          travel_time: p.travel_time || "",
          bucket_list: !!p.bucket_list,
        })),
    });
  }
  for (const [key, items] of byCategory) {
    if (seenKeys.has(key) || !items.length) continue;
    categoryGroups.push({
      key: slugify(key),
      label: key,
      travel_category: key,
      count: items.length,
      items: items
        .slice()
        .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")))
        .map((p) => ({
          title: p.title,
          url: p.url,
          kind: p.kind,
          visit_time: p.visit_time || "",
          travel_time: p.travel_time || "",
          bucket_list: !!p.bucket_list,
        })),
    });
  }

  const references = related
    .filter((p) => String(p.kind || "").toLowerCase() === "reference")
    .map((p) => {
      const section = String(p.section || p.hub_section || "more").toLowerCase();
      const meta = REFERENCE_SECTION_ORDER.find((s) => s.key === section);
      return {
        section,
        label: meta?.label || p.title,
        title: p.title,
        url: p.url,
        order: Number.isFinite(Number(p.order))
          ? Number(p.order)
          : (meta ? REFERENCE_SECTION_ORDER.indexOf(meta) : 99),
        excerpt: excerptPlain(p.excerpt || p.content),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const media = related.filter((p) =>
    String(p.kind || "").toLowerCase() === "media"
  );

  const mappableStops = stops
    .filter((p) => String(p.kind || "").toLowerCase() !== "media")
    .filter(stopHasMap)
    .slice()
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

  const numberByStop = new Map(
    mappableStops.map((p, i) => [mapStopId(p), i + 1]),
  );

  const mapStops = mappableStops.map((p) => {
    const stopId = mapStopId(p);
    return {
      title: p.title,
      url: p.url,
      kind: p.kind,
      travel_category: p.travel_category || "",
      visit_time: p.visit_time || "",
      travel_time: p.travel_time || "",
      bucket_list: !!p.bucket_list,
      excerpt: excerptPlain(p.excerpt || p.content, 140),
      map_stop_id: stopId,
      has_map: true,
      map_number: numberByStop.get(stopId),
    };
  });

  const mapPlaces = [];
  for (const p of mappableStops) {
    const plat = Number(p.lat);
    const plng = Number(p.lng);
    const stopId = mapStopId(p);
    const number = numberByStop.get(stopId);
    const markerType = mapMarkerType(p);
    if (Number.isFinite(plat) && Number.isFinite(plng)) {
      mapPlaces.push({
        id: `${stopId}-main`,
        stopId,
        number,
        title: p.title || "",
        url: p.url || "",
        lat: plat,
        lng: plng,
        category: p.travel_category || p.kind || "activity",
        markerType,
      });
      continue;
    }
    for (const c of normalizePlaces(p.places)) {
      if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue;
      mapPlaces.push({
        id: `${stopId}-main`,
        stopId,
        number,
        title: p.title || c.name || "",
        url: p.url || c.url || "",
        lat: c.lat,
        lng: c.lng,
        category: p.travel_category || p.kind || "activity",
        markerType,
      });
      break;
    }
  }

  const mapFilterCats = [
    ...new Set(mapStops.map((i) => i.travel_category).filter(Boolean)),
  ].sort();
  const mapFilterKinds = [
    ...new Set(mapStops.map((i) => i.kind).filter(Boolean)),
  ].sort();

  const itineraries = allPages.filter(
    (p) =>
      p.type === "itinerary" &&
      !p.draft &&
      ((hub.country && p.country === hub.country) ||
        p.destination_slug === hubSlug),
  );

  const themes = buildHubThemes(hub, allPages);
  const weekly = buildHubWeekly(related);

  return {
    slug: hubSlug,
    stopCount: stops.filter((p) => String(p.kind).toLowerCase() !== "media").length,
    categoryGroups,
    references,
    media,
    mapPlaces,
    mapStops,
    mapFilterCats,
    mapFilterKinds,
    itineraries,
    themes,
    weekly,
    dayTripCount:
      (byCategory.get("Day Trip")?.length || 0) +
      (byCategory.get("Overnight Trip")?.length || 0) +
      (byCategory.get("Nearby")?.length || 0),
    inCityCount:
      (byCategory.get("In city")?.length || 0) +
      (byCategory.get("Walkable")?.length || 0),
  };
}

/** Links back to itineraries, country hubs, and collection pages this post belongs to. */
export function buildPostMemberships(page, allPages = []) {
  const groups = [];
  const kind = String(page?.kind || "").toLowerCase();
  const pageType = String(page?.type || "").toLowerCase();
  let country = page?.country;
  let destinationSlug = page?.destination_slug || page?.hub;

  if (page?.itinerary_slug && pageType !== "itinerary") {
    const slug = page.itinerary_slug;
    const itin =
      allPages.find(
        (p) =>
          p.type === "itinerary" &&
          (p.itinerary_slug === slug || p.slug === slug),
      ) ||
      allPages.find(
        (p) =>
          p.itinerary_slug === slug &&
          (p.days != null || p.layout === "layouts/itinerary.vto"),
      );
    const days = expandDays(page).sort((a, b) => a - b);
    const links = [];

    if (itin?.url || itin?.title) {
      links.push({
        title: itin.title || slug,
        url: itin.url || itineraryOverviewUrl({ itinerary_slug: slug, title: itin?.title }),
        meta: "Overview",
      });
    }
    for (const d of days) {
      links.push({
        title: `Day ${d}`,
        url: `/itineraries/${slug}/day-${d}/`,
        meta: "Day view",
      });
    }
    if (itin || days.length) {
      links.push({
        title: "Timetable",
        url: `/itineraries/${slug}/timetable/`,
        meta: "Calendar",
      });
    }
    if (links.length) groups.push({ title: "Itinerary", links });

    if (!country && itin?.country) country = itin.country;
    if (!destinationSlug && itin?.destination_slug) {
      destinationSlug = itin.destination_slug;
    }
  }

  if (country) {
    groups.push({
      title: "Country",
      links: [
        {
          title: country,
          url: `/countries/${slugify(country)}/`,
          meta: "Country hub",
        },
      ],
    });
  }

  if (destinationSlug && !(kind === "destination" && page?.isBase)) {
    const dest =
      allPages.find(
        (p) =>
          String(p.kind || "").toLowerCase() === "destination" &&
          p.isBase &&
          (p.slug === destinationSlug || p.base === destinationSlug),
      ) ||
      allPages.find(
        (p) =>
          String(p.kind || "").toLowerCase() === "destination" &&
          (p.slug === destinationSlug || p.base === destinationSlug),
      );
    const destUrl = dest?.isBase
      ? (dest.url || destinationHubUrl(dest))
      : dest?.url;
    if (destUrl) {
      groups.push({
        title: "Destination",
        links: [{ title: dest.title || destinationSlug, url: destUrl }],
      });
    }
  }

  const pageThemes = normalizeThemes(page?.themes, page?.tags);
  if (pageThemes.length && destinationSlug) {
    groups.push({
      title: "Themes",
      links: pageThemes.map((t) => ({
        title: themeLabel(t),
        url: themePageUrl(destinationSlug, t),
      })),
    });
  }

  if (pageType === "itinerary") {
    groups.push({
      title: "Browse",
      links: [{ title: "All Itineraries", url: "/itineraries/", meta: "Archive" }],
    });
  } else if (kind === "activity" || kind === "eats") {
    groups.push({
      title: "Browse",
      links: [
        { title: "Things to Do", url: "/activities/", meta: "All experiences" },
        { title: "Bucket List", url: "/bucket-list/", meta: "Wish list" },
      ],
    });
  } else if (kind === "reference") {
    groups.push({
      title: "Browse",
      links: [
        { title: "Destinations", url: "/destinations/", meta: "Base cities" },
        { title: "Bucket List", url: "/bucket-list/", meta: "Wish list" },
      ],
    });
  } else if (kind === "destination") {
    const baseSlug = page.slug || page.base;
    const itins = allPages.filter(
      (p) =>
        p.type === "itinerary" &&
        (p.destination_slug === baseSlug ||
          (page.country && p.country === page.country)),
    );
    if (itins.length) {
      groups.push({
        title: "Itineraries",
        links: itins
          .map((i) => ({
            title: i.title,
            url: i.url,
            meta: i.days ? `${i.days} days` : "",
          }))
          .filter((l) => l.url),
      });
    }
    groups.push({
      title: "Browse",
      links: [
        { title: "Destinations", url: "/destinations/", meta: "Base cities" },
        { title: "Bucket List", url: "/bucket-list/", meta: "Wish list" },
      ],
    });
  } else if (kind === "lodging") {
    groups.push({
      title: "Browse",
      links: [{ title: "Bucket List", url: "/bucket-list/", meta: "Wish list" }],
    });
  }

  return groups.filter((g) => g.links?.length);
}

/** Parse visit_time strings like "2–2.5 hrs", "30 min", "Full Day" into hours. */
export function parseDurationHours(visitTime) {
  if (!visitTime) return 1;
  const s = String(visitTime).toLowerCase().replace(/,/g, "");
  if (s.includes("full day")) return 8;
  if (s.includes("overnight")) return 10;
  const rangeH = s.match(/(\d+(?:\.\d+)?)\s*[–\-to]+\s*(\d+(?:\.\d+)?)\s*h/);
  if (rangeH) return Math.max(Number(rangeH[1]), Number(rangeH[2]));
  const hrs = s.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hrs) return Number(hrs[1]);
  const mins = s.match(/(\d+(?:\.\d+)?)\s*m/);
  if (mins) return Number(mins[1]) / 60;
  return 1;
}

export function formatHour(h) {
  const hour = Math.floor(h);
  const mins = Math.round((h - hour) * 60);
  const d = new Date(Date.UTC(2000, 0, 1, hour, mins));
  return d.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: mins ? "2-digit" : undefined,
  });
}

const DAY_START = 6; // 6am — early departures
const DAY_END = 22; // 10pm
const DAY_SPAN = DAY_END - DAY_START;

/** Parse "6:30 AM" / "12:30 PM" into decimal hours. */
export function parseClockToHours(clock) {
  const s = String(clock || "").trim().toUpperCase();
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const mins = m[2] ? Number(m[2]) : 0;
  const ampm = m[3];
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h + mins / 60;
}

/** Parse "6:30 AM – 8:30 AM" into { start, end } decimal hours. */
export function parseTimeRange(timeStr) {
  const parts = String(timeStr || "").split(/\s*[–\-—]\s*/);
  if (parts.length !== 2) return null;
  const start = parseClockToHours(parts[0]);
  const end = parseClockToHours(parts[1]);
  if (start == null || end == null) return null;
  return { start, end: end < start ? end + 24 : end };
}

/** Timed slots inside a full-day stop (replaces manual ## Schedule tables). */
export function normalizeSchedule(item) {
  const raw = item?.schedule ?? item?.day_plan ?? item?.timeline;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((slot, i) => {
      if (!slot || typeof slot !== "object") return null;
      const time = slot.time || slot.timeslot || "";
      const range = parseTimeRange(time);
      const title = slot.title || slot.activity || "";
      if (!title && !time) return null;
      const slotOptions = normalizeOptions({
        options: slot.options ?? slot.alternatives,
      });
      return {
        time,
        title,
        allow: slot.allow || slot.visit_time || "",
        notes: slot.notes || slot.note || "",
        places: Array.isArray(slot.places)
          ? slot.places.map(String)
          : slot.place
            ? [String(slot.place)]
            : [],
        options: slotOptions,
        block_type: slot.block_type || "",
        startHour: range?.start ?? null,
        endHour: range?.end ?? null,
        order: Number.isFinite(Number(slot.order)) ? Number(slot.order) : i + 1,
      };
    })
    .filter(Boolean);
}

function matchPlaceByName(name, places) {
  const key = String(name || "").toLowerCase();
  if (!key) return null;
  return (
    places.find(
      (p) =>
        p.name.toLowerCase() === key ||
        p.name.toLowerCase().includes(key) ||
        key.includes(p.name.toLowerCase()),
    ) || null
  );
}

function matchPlaceByNameExact(name, places) {
  const key = String(name || "").toLowerCase().trim();
  if (!key) return null;
  return places.find((p) => p.name.toLowerCase() === key) || null;
}

/** Match schedule place names to the stop's places[] for map links and notes. */
export function resolveSchedulePlaceRefs(schedule, places) {
  const normalized = normalizePlaces(places);
  return schedule.map((slot) => ({
    ...slot,
    placeRefs: slot.places.map((ref) => {
      return matchPlaceByName(ref, normalized) || { name: String(ref) };
    }),
  }));
}

/** Normalize + link schedule slots (places, options, map ids) for day and post views. */
export function enrichScheduleSlots(item, allPages = []) {
  const places = normalizePlaces(item?.places);
  let schedule = resolveSchedulePlaceRefs(normalizeSchedule(item), item?.places);

  schedule = schedule.map((slot, i) => {
    const slotId = `${mapStopId(item)}-slot-${i}`;
    let options = resolveOptionUrls(
      normalizeOptions({ options: slot.options }),
      allPages,
    );
    const topOptions = normalizeOptions(item);
    options = options.map((opt) => {
      const title = opt.title || opt.name || "";
      const matchedPlace = matchPlaceByNameExact(title, places);
      const matchedOpt = topOptions.find(
        (o) => slugify(o.title) === slugify(title),
      );
      const matched = matchedPlace || matchedOpt;
      if (!matched) return opt;
      return {
        ...opt,
        ...matched,
        title,
        name: title,
        notes: opt.notes || matched.notes || "",
        lat: opt.lat ?? matched.lat ?? null,
        lng: opt.lng ?? matched.lng ?? null,
        url: opt.url || matched.url || "",
      };
    });

    const slotBlock = resolveBlockType({
      ...item,
      schedule: [],
      places: slot.places,
      block_type: slot.block_type,
      options: slot.options,
      flexible: options.length > 0,
    });

    const hasMap =
      (slot.placeRefs || []).some((p) => p.lat != null && p.lng != null) ||
      options.some((o) => o.lat != null && o.lng != null);

    return {
      ...slot,
      options,
      slotId,
      block_type: slotBlock.type,
      block_label: slotBlock.label,
      has_map: hasMap,
    };
  });

  return schedule;
}

/** Text before <!--more--> — used as the day-page tagline. */
export function extractDayIntro(content) {
  return String(content || "")
    .split(/<!--\s*more\s*-->/i)[0]
    .replace(/^#+\s.*$/m, "")
    .trim();
}

/**
 * Day page layout mode.
 * timeline — one day-plan post owns the day; slots are top-level (not nested in a stop card).
 * stops — classic list of distinct stops (lodging, circuits, etc.).
 */
export function buildDayView(items) {
  const lodging = items.filter((i) => resolveBlockType(i).type === "stay");
  const nonLodging = items.filter((i) => resolveBlockType(i).type !== "stay");
  const withSchedule = nonLodging.filter((i) => (i.schedule?.length || 0) > 0);

  if (withSchedule.length === 1 && nonLodging.length === 1) {
    const primary = withSchedule[0];
    return {
      mode: "timeline",
      primary,
      timeline: primary.schedule,
      lodging,
      intro: extractDayIntro(primary.content),
      guideUrl: primary.url || "",
      guideTitle: primary.title || "",
    };
  }

  return { mode: "stops", stops: items, lodging: [] };
}

/** Map pins for timeline days — one marker group per schedule slot. */
export function buildMapPlacesForDay(items, dayView) {
  let out;
  if (dayView?.mode === "timeline") {
    out = [];
    for (const slot of dayView.timeline || []) {
      for (const place of slot.placeRefs || []) {
        if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
        const placeKey = slugify(place.name || "place");
        out.push({
          id: `${slot.slotId}-${placeKey}`,
          stopId: slot.slotId,
          title: place.name || "",
          url: place.url || dayView.guideUrl || "",
          lat: place.lat,
          lng: place.lng,
          category: place.type || "activity",
          markerType: "activity",
        });
      }
      for (const opt of slot.options || []) {
        if (!Number.isFinite(opt.lat) || !Number.isFinite(opt.lng)) continue;
        const placeKey = slugify(opt.title || opt.name || "option");
        out.push({
          id: `${slot.slotId}-${placeKey}`,
          stopId: slot.slotId,
          title: opt.title || opt.name || "",
          url: opt.url || dayView.guideUrl || "",
          lat: opt.lat,
          lng: opt.lng,
          category: opt.type || "activity",
          markerType: "activity",
        });
      }
    }
    for (const p of dayView.lodging || []) {
      out.push(...buildMapPlaces([p]));
    }
  } else {
    // One pin per stop keeps day routes readable (Wanderlog-style)
    out = [];
    for (const p of items || []) {
      const pins = buildMapPlaces([p]);
      const main = pins.find((x) => String(x.id || "").endsWith("-main")) ||
        pins[0];
      if (main) out.push(main);
    }
  }

  // Number pins in encounter order (Wanderlog-style sequence)
  const order = [];
  for (const p of out) {
    if (!order.includes(p.stopId)) order.push(p.stopId);
  }
  const numberByStop = new Map(order.map((id, i) => [id, i + 1]));
  return out.map((p) => ({
    ...p,
    number: numberByStop.get(p.stopId) ?? null,
  }));
}

/** Whole-trip map pins across all days (overview). */
export function buildTripMapPlaces(childrenByDay = []) {
  const out = [];
  const seen = new Set();
  for (const { day, places } of childrenByDay) {
    for (const p of places || []) {
      const key = `${p.lat},${p.lng}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        ...p,
        day,
        category: p.category || `Day ${day}`,
      });
    }
  }
  return out;
}

function buildScheduleBlock(item, slot) {
  const slotItem = {
    ...item,
    title: slot.title,
    visit_style: slot.block_type === "eat" ? "Lunch" : item.visit_style,
    kind: slot.block_type === "eat" ? "eats" : item.kind,
    options: slot.options,
    block_type: slot.block_type,
    flexible: slot.options.length > 0,
  };
  const { type: blockType, label } = resolveBlockType(slotItem);
  const start = slot.startHour ?? DAY_START + 1;
  const end = slot.endHour ??
    Math.min(DAY_END, start + Math.max(parseDurationHours(slot.allow), 0.5));

  const top = ((start - DAY_START) / DAY_SPAN) * 100;
  const height = Math.max(((end - start) / DAY_SPAN) * 100, 4.5);
  const isOptions = blockType === "options";

  return {
    title: slot.title || item.title || "Untitled",
    url: item.url || "",
    parentTitle: item.title || "",
    parentUrl: item.url || "",
    kind: String(item.kind || "activity").toLowerCase(),
    blockType,
    label,
    visit_time: slot.allow || slot.time || "",
    travel_time: "",
    travel_category: item.travel_category || "",
    excerpt: slot.notes || "",
    places: slot.placeRefs || [],
    placeCount: (slot.placeRefs || []).length,
    options: slot.options,
    optionCount: slot.options.length,
    isFlexible: isOptions,
    isOptions,
    isCollection: false,
    isScheduleSlot: true,
    scheduleTime: slot.time || "",
    startHour: start,
    endHour: end,
    startLabel: formatHour(start),
    endLabel: formatHour(end),
    topPct: top,
    heightPct: height,
    isLodging: false,
  };
}

/**
 * Build absolute-positioned calendar blocks for one day.
 * Lodging is pinned as an overnight bar; activities stack from 8am by order + visit_time.
 * Stops with schedule[] expand into timed sub-blocks.
 */
export function buildDayBlocks(items) {
  let cursor = 8;
  const blocks = [];

  for (const item of items) {
    const schedule = Array.isArray(item.schedule)
      ? item.schedule
      : normalizeSchedule(item);

    if (schedule.length > 0) {
      for (const slot of schedule) {
        blocks.push(buildScheduleBlock(item, slot));
      }
      continue;
    }

    const { type: blockType, label } = resolveBlockType(item);
    const kind = String(item.kind || "activity").toLowerCase();
    const isLodging = blockType === "stay";
    const hours = isLodging ? 1 : parseDurationHours(item.visit_time);
    const start = isLodging ? DAY_START : cursor;
    const end = isLodging
      ? DAY_START + 1
      : Math.min(DAY_END, cursor + Math.max(hours, 0.5));

    if (!isLodging) cursor = Math.min(DAY_END, end + 0.25);

    const top = ((start - DAY_START) / DAY_SPAN) * 100;
    const height = Math.max(((end - start) / DAY_SPAN) * 100, 4.5);

    const nestedPlaces = normalizePlaces(item.places);
    const blockOptions = Array.isArray(item.options)
      ? item.options
      : normalizeOptions(item);
    const isCollection = blockType === "circuit";
    const isOptions = blockType === "options";

    blocks.push({
      title: item.title || "Untitled",
      url: item.url || "",
      kind,
      blockType,
      label,
      visit_time: item.visit_time || "",
      travel_time: item.travel_time || "",
      travel_category: item.travel_category || "",
      excerpt: excerptForBlock(item),
      places: nestedPlaces,
      placeCount: nestedPlaces.length,
      options: blockOptions,
      optionCount: blockOptions.length,
      isFlexible: !!item.flexible || isOptions,
      isOptions,
      isCollection,
      startHour: start,
      endHour: end,
      startLabel: formatHour(start),
      endLabel: formatHour(end),
      topPct: top,
      heightPct: height,
      isLodging,
    });
  }

  return blocks;
}

/** Normalize nested place lists used on circuit / collection stops. */
export function normalizePlaces(places) {
  if (!Array.isArray(places)) return [];
  return places
    .map((p, i) => {
      if (!p || typeof p !== "object") return null;
      const name = p.name || p.title || "";
      if (!name) return null;
      const latRaw = p.lat;
      const lngRaw = p.lng;
      const lat = latRaw != null && latRaw !== "" ? Number(latRaw) : NaN;
      const lng = lngRaw != null && lngRaw !== "" ? Number(lngRaw) : NaN;
      return {
        name,
        type: p.type || p.kind || "",
        notes: p.notes || p.note || "",
        url: p.url || "",
        slug: p.slug || "",
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        order: Number.isFinite(Number(p.order)) ? Number(p.order) : i + 1,
      };
    })
    .filter(Boolean);
}

/** Alternatives for the same time window — pick one, not a fixed route. */
export function normalizeOptions(item) {
  const raw = item?.options ?? item?.alternatives ?? item?.choices;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((opt, i) => {
      if (!opt) return null;
      if (typeof opt === "string") {
        const title = opt.trim();
        if (!title) return null;
        return { title, name: title, order: i + 1 };
      }
      if (typeof opt !== "object") return null;
      const title = opt.title || opt.name || "";
      if (!title) return null;
      const latRaw = opt.lat;
      const lngRaw = opt.lng;
      const lat = latRaw != null && latRaw !== "" ? Number(latRaw) : NaN;
      const lng = lngRaw != null && lngRaw !== "" ? Number(lngRaw) : NaN;
      return {
        title,
        name: title,
        type: opt.type || opt.kind || "",
        notes: opt.notes || opt.note || "",
        url: opt.url || "",
        slug: opt.slug || "",
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        order: Number.isFinite(Number(opt.order)) ? Number(opt.order) : i + 1,
      };
    })
    .filter(Boolean);
}

/** Link option slugs to built pages when possible; copy lat/lng from the match. */
export function resolveOptionUrls(options, allPages = []) {
  if (!options.length || !allPages.length) return options;
  return options.map((opt) => {
    const slug = opt.slug ? slugify(opt.slug) : slugify(opt.title);
    const found = slug
      ? allPages.find((p) => {
        const pageSlug = slugify(p.slug || "");
        const titleSlug = slugify(p.title);
        return pageSlug === slug || titleSlug === slug;
      })
      : null;

    if (!found && opt.url && opt.lat != null && opt.lng != null) return opt;
    if (!found) return opt;

    const lat = Number(found.lat);
    const lng = Number(found.lng);
    return {
      ...opt,
      url: opt.url || found.url || "",
      lat: opt.lat != null ? opt.lat : (Number.isFinite(lat) ? lat : null),
      lng: opt.lng != null ? opt.lng : (Number.isFinite(lng) ? lng : null),
    };
  });
}

function isEatKind(item) {
  const kind = String(item?.kind || "activity").toLowerCase();
  const style = String(item?.visit_style || "").toLowerCase();
  const category = String(item?.travel_category || "").toLowerCase();
  return (
    kind === "eats" ||
    kind === "eat" ||
    /\b(meal|dinner|lunch|breakfast|brunch|snack|food)\b/.test(style) ||
    /\b(food|dining|restaurant|eats)\b/.test(category)
  );
}

/**
 * Classify a stop for timetable / day views.
 * Override anytime with block_type: stay | eat | explore | circuit | options
 */
export function resolveBlockType(item) {
  const explicit = String(item.block_type || "").toLowerCase();
  if (["stay", "eat", "explore", "circuit", "options", "dayplan", "travel"].includes(explicit)) {
    return {
      type: explicit,
      label: blockLabel(explicit, item),
    };
  }

  const kind = String(item.kind || "activity").toLowerCase();
  const style = String(item.visit_style || "").toLowerCase();
  const category = String(item.travel_category || "").toLowerCase();
  const nestedPlaces = normalizePlaces(item.places);
  const blockOptions = Array.isArray(item.options)
    ? item.options
    : normalizeOptions(item);

  if (kind === "lodging") return { type: "stay", label: "Stay" };

  if (blockOptions.length > 0 || item.flexible) {
    return {
      type: "options",
      label: isEatKind(item) ? "Pick one · Eat" : "Pick one",
    };
  }

  const daySchedule = normalizeSchedule(item);
  if (daySchedule.length > 0) {
    return { type: "dayplan", label: "Day plan" };
  }

  if (
    kind === "eats" ||
    kind === "eat" ||
    /\b(meal|dinner|lunch|breakfast|brunch|snack|food)\b/.test(style) ||
    /\b(food|dining|restaurant|eats)\b/.test(category)
  ) {
    return { type: "eat", label: "Eat" };
  }

  if (nestedPlaces.length > 0 || style === "circuit") {
    return { type: "circuit", label: "Explore" };
  }

  return { type: "explore", label: "Explore" };
}

function blockLabel(type, item) {
  switch (type) {
    case "stay":
      return "Stay";
    case "eat":
      return "Eat";
    case "circuit":
      return "Explore";
    case "options":
      return isEatKind(item) ? "Pick one · Eat" : "Pick one";
    case "dayplan":
      return "Day plan";
    case "travel":
      return "Travel";
    default:
      return "Explore";
  }
}

export const BLOCK_TYPE_LEGEND = [
  { type: "explore", label: "Explore", hint: "Single sight or activity" },
  { type: "circuit", label: "Explore · circuit", hint: "Several places in one block" },
  { type: "options", label: "Pick one", hint: "Same time window — choose one option" },
  { type: "dayplan", label: "Day plan", hint: "Full-day stop with timed slots inside" },
  { type: "eat", label: "Eat", hint: "Meals, markets, and food stops" },
  { type: "stay", label: "Stay", hint: "Lodging" },
];

/** Short plain-text preview for the timetable detail panel. */
function excerptForBlock(item) {
  const schedule = normalizeSchedule(item);
  if (schedule.length) {
    return schedule
      .map((s) => `${s.time ? `${s.time}: ` : ""}${s.title}`)
      .join(" · ")
      .slice(0, 220);
  }
  const raw = String(item.content || "");
  if (!raw.trim()) return "";
  const afterSchedule = raw.split("## Schedule");
  let text = afterSchedule.length > 1 ? afterSchedule[1] : raw.split(/<!--\s*more\s*-->/i)[0];
  text = text
    .replace(/\|[^\n]*\|/g, " ")
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 220) return text;
  return `${text.slice(0, 217).trim()}…`;
}

export function buildTimetableDays(it, children, daysCount) {
  const hasStart = !!it.start_date;
  const baseY = hasStart ? it.start_date.getUTCFullYear() : null;
  const baseM = hasStart ? it.start_date.getUTCMonth() : null;
  const baseD = hasStart ? it.start_date.getUTCDate() : null;
  const slug = it.itinerary_slug || slugify(it.title);

  const days = [];
  for (let day = 1; day <= daysCount; day++) {
    const items = children
      .filter((p) => expandDays(p).includes(day))
      .slice()
      .sort(sortPages);

    let niceDate = "";
    if (hasStart) {
      const thisDate = new Date(Date.UTC(baseY, baseM, baseD + (day - 1)));
      niceDate = thisDate.toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const dayUrl = `/itineraries/${slug}/day-${day}/`;
    const blocks = buildDayBlocks(items).map((b, i) => ({
      ...b,
      id: `d${day}-b${i}`,
      day,
      niceDate,
      dayUrl,
    }));

    days.push({
      day,
      niceDate,
      url: dayUrl,
      items,
      blocks,
    });
  }
  return days;
}

export const TIMETABLE_HOURS = Array.from(
  { length: DAY_END - DAY_START },
  (_, i) => DAY_START + i,
);
