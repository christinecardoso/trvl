/**
 * Controlled theme leaves + groups for destination listicles and bucket list.
 * Stops carry leaf themes only; groups are derived from this map.
 */

export const THEME_LEAVES = {
  hiking: { label: "Hiking", slug: "hiking-trails" },
  waterfalls: { label: "Waterfalls", slug: "waterfalls" },
  volcano: { label: "Volcanoes", slug: "volcanoes" },
  ziplining: { label: "Ziplining", slug: "ziplining" },
  wildlife: { label: "Wildlife", slug: "wildlife" },
  horses: { label: "Horses", slug: "horseback-riding" },
  birdwatching: { label: "Birdwatching", slug: "birdwatching" },
  canopy: { label: "Canopy & cloud forest", slug: "cloud-forest" },
  "hot-springs": { label: "Hot springs", slug: "hot-springs" },
  wellness: { label: "Wellness", slug: "wellness" },
  markets: { label: "Markets", slug: "markets" },
  historic: { label: "Historic sites", slug: "historic-sites" },
  architecture: { label: "Architecture", slug: "architecture" },
  crafts: { label: "Crafts & workshops", slug: "crafts-workshops" },
  "art-classes": { label: "Art classes", slug: "art-classes" },
  jewelry: { label: "Jewelry making", slug: "jewelry-making" },
  dance: { label: "Dance", slug: "dance-classes" },
  jazz: { label: "Jazz & live music", slug: "jazz-live-music" },
  nightlife: { label: "Nightlife", slug: "nightlife" },
  food: { label: "Food & dining", slug: "food-dining" },
  burgers: { label: "Burgers", slug: "burger-nights" },
  wine: { label: "Wine country", slug: "wine-country" },
  photo: { label: "Photo spots", slug: "photo-spots" },
  lake: { label: "Lakes", slug: "lakes" },
};

/** Parent groups → leaf theme keys (config-only; not stored on posts). */
export const THEME_GROUPS = {
  adventure: {
    label: "Adventure",
    themes: [
      "hiking",
      "waterfalls",
      "volcano",
      "ziplining",
      "wildlife",
      "horses",
      "birdwatching",
      "canopy",
    ],
  },
  wellness: {
    label: "Wellness",
    themes: ["hot-springs", "wellness"],
  },
  culture: {
    label: "Culture",
    themes: ["markets", "historic", "architecture", "crafts"],
  },
  creative: {
    label: "Creative",
    themes: ["art-classes", "jewelry", "dance", "jazz"],
  },
  food: {
    label: "Food",
    themes: ["food", "burgers", "wine"],
  },
  nightlife: {
    label: "Nightlife",
    themes: ["nightlife", "dance", "jazz"],
  },
  nature: {
    label: "Nature",
    themes: ["lake", "canopy", "wildlife", "birdwatching"],
  },
  photo: {
    label: "Photography",
    themes: ["photo"],
  },
};

/** Map legacy freeform tags → leaf themes. */
const TAG_TO_THEME = {
  hiking: "hiking",
  waterfalls: "waterfalls",
  waterfall: "waterfalls",
  volcano: "volcano",
  volcanoes: "volcano",
  ziplining: "ziplining",
  wildlife: "wildlife",
  horses: "horses",
  birdwatching: "birdwatching",
  "hot-springs": "hot-springs",
  hotsprings: "hot-springs",
  wellness: "wellness",
  relaxation: "wellness",
  culture: "historic",
  architecture: "architecture",
  shopping: "markets",
  landmark: "historic",
  lake: "lake",
  "eco-lodge": "canopy",
  forest: "canopy",
  photography: "photo",
  wine: "wine",
  vineyard: "wine",
  wineries: "wine",
  malbec: "wine",
  jazz: "jazz",
  music: "jazz",
  nightlife: "nightlife",
  club: "nightlife",
  salsa: "dance",
  flamenco: "dance",
  adventure: null,
  nature: null,
};

function leafKey(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function themeLabel(theme) {
  const key = leafKey(theme);
  return THEME_LEAVES[key]?.label ||
    key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Public path segment for theme listicles (SEO-friendly). */
export function themeSeoSlug(theme) {
  const key = leafKey(theme);
  return THEME_LEAVES[key]?.slug || key;
}

/**
 * Canonical theme listicle URL:
 * /destinations/{hub}/{seo-slug}/  e.g. /destinations/quito/waterfalls/
 */
export function themePageUrl(hubSlug, theme) {
  const hub = leafKey(hubSlug);
  const slug = themeSeoSlug(theme);
  if (!hub || !slug) return "";
  return `/destinations/${hub}/${slug}/`;
}

/** Pre-SEO path kept for redirects: /destinations/{hub}/themes/{theme-key}/ */
export function legacyThemePageUrl(hubSlug, theme) {
  const hub = leafKey(hubSlug);
  const t = leafKey(theme);
  if (!hub || !t) return "";
  return `/destinations/${hub}/themes/${t}/`;
}

export function themePageTitle(theme, hubTitle) {
  const label = themeLabel(theme);
  const place = String(hubTitle || "").trim();
  if (!place) return label;
  return `${label} near ${place}`;
}

export function groupsForTheme(theme) {
  const key = leafKey(theme);
  return Object.entries(THEME_GROUPS)
    .filter(([, g]) => g.themes.includes(key))
    .map(([id, g]) => ({ id, label: g.label, themes: g.themes }));
}

export function inferThemesFromTags(tags = []) {
  const out = new Set();
  for (const tag of tags || []) {
    const mapped = TAG_TO_THEME[leafKey(tag)];
    if (mapped && THEME_LEAVES[mapped]) out.add(mapped);
  }
  return [...out];
}

/** Normalize frontmatter themes; merge tag inference. */
export function normalizeThemes(raw, tags = []) {
  const fromFm = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map(leafKey)
    .filter((k) => k && THEME_LEAVES[k]);
  const inferred = inferThemesFromTags(tags);
  return [...new Set([...fromFm, ...inferred])];
}

export function excerptPlain(content, max = 160) {
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

/** theme_excerpts[theme] → excerpt → body preview → "" */
export function resolveThemeExcerpt(page, theme, max = 160) {
  const key = leafKey(theme);
  const map = page?.theme_excerpts || page?.themeExcerpts || {};
  const specific = map[key] || map[theme];
  if (specific) return String(specific).trim();
  if (page?.excerpt) return excerptPlain(page.excerpt, max);
  return excerptPlain(page?.content, max);
}

function stopEligible(page) {
  if (!page || page.draft || page.redirect_to || page.redirectTo) return false;
  if (page.isBase) return false;
  if (String(page.type || "").toLowerCase() === "itinerary") return false;
  if (String(page.layout || "").includes("redirect")) return false;
  const kind = String(page.kind || "activity").toLowerCase();
  return ["activity", "eats", "lodging", "destination", "media"].includes(kind);
}

function hubSlugOf(page) {
  return page?.slug || page?.base || page?.hub || page?.destination_slug || "";
}

function pageHubSlug(page) {
  return page?.destination_slug || page?.hub || page?.base || "";
}

/** Theme chips for a destination hub. */
export function buildHubThemes(hub, allPages = []) {
  const hubSlug = hubSlugOf(hub);
  if (!hubSlug) return { groups: [], flat: [], totalThemes: 0 };

  const counts = new Map();
  for (const p of allPages) {
    if (!stopEligible(p)) continue;
    if (pageHubSlug(p) !== hubSlug) continue;
    for (const t of normalizeThemes(p.themes, p.tags)) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }

  const byGroup = [];
  const seen = new Set();
  for (const [groupId, group] of Object.entries(THEME_GROUPS)) {
    const items = [];
    for (const t of group.themes) {
      if (!counts.has(t)) continue;
      const chip = {
        theme: t,
        label: themeLabel(t),
        count: counts.get(t),
        url: themePageUrl(hubSlug, t),
        group: groupId,
        groupLabel: group.label,
      };
      items.push(chip);
      seen.add(t);
    }
    if (items.length) {
      byGroup.push({
        id: groupId,
        label: group.label,
        count: items.reduce((n, i) => n + i.count, 0),
        themes: items,
      });
    }
  }

  const orphan = [...counts.keys()]
    .filter((t) => !seen.has(t))
    .map((t) => ({
      theme: t,
      label: themeLabel(t),
      count: counts.get(t),
      url: themePageUrl(hubSlug, t),
      group: "more",
      groupLabel: "More",
    }));
  if (orphan.length) {
    byGroup.push({
      id: "more",
      label: "More",
      count: orphan.reduce((n, i) => n + i.count, 0),
      themes: orphan,
    });
  }

  return {
    groups: byGroup,
    flat: uniqueThemes(byGroup),
    totalThemes: counts.size,
  };
}

function uniqueThemes(byGroup) {
  const seen = new Set();
  const out = [];
  for (const g of byGroup) {
    for (const t of g.themes) {
      if (seen.has(t.theme)) continue;
      seen.add(t.theme);
      out.push(t);
    }
  }
  return out;
}

/** Full data for one destination × theme listicle page. */
export function buildThemePage(hub, theme, allPages = []) {
  const hubSlug = hubSlugOf(hub);
  const themeKey = leafKey(theme);
  if (!hubSlug || !themeKey) return null;

  const stops = allPages
    .filter((p) => {
      if (!stopEligible(p)) return false;
      if (pageHubSlug(p) !== hubSlug) return false;
      return normalizeThemes(p.themes, p.tags).includes(themeKey);
    })
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

  const collection = allPages.find(
    (p) =>
      !p.draft &&
      String(p.kind || "").toLowerCase() === "collection" &&
      (p.hub === hubSlug || p.destination_slug === hubSlug) &&
      leafKey(p.theme || (Array.isArray(p.themes) ? p.themes[0] : p.themes)) ===
        themeKey,
  );

  function stopHasCoords(p) {
    const plat = Number(p.lat);
    const plng = Number(p.lng);
    if (Number.isFinite(plat) && Number.isFinite(plng)) return true;
    for (const c of p.places || []) {
      if (Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng))) {
        return true;
      }
    }
    return false;
  }

  const mappedStops = stops.filter(stopHasCoords);
  const numberByStop = new Map(
    mappedStops.map((p, i) => [leafKey(p.title), i + 1]),
  );

  const items = stops.map((p) => {
    const stopId = leafKey(p.title);
    const hasMap = stopHasCoords(p);
    return {
      title: p.title,
      url: p.url,
      kind: p.kind,
      travel_category: p.travel_category || "",
      visit_time: p.visit_time || "",
      bucket_list: !!p.bucket_list,
      excerpt: resolveThemeExcerpt(p, themeKey),
      themes: normalizeThemes(p.themes, p.tags),
      map_stop_id: stopId,
      has_map: hasMap,
      map_number: hasMap ? numberByStop.get(stopId) : null,
    };
  });

  // Mapped stops first (numbered), then unmapped
  items.sort((a, b) => {
    if (a.has_map !== b.has_map) return a.has_map ? -1 : 1;
    if (a.map_number != null && b.map_number != null) {
      return a.map_number - b.map_number;
    }
    return String(a.title || "").localeCompare(String(b.title || ""));
  });

  const mapPlaces = [];
  for (const p of mappedStops) {
    const stopId = leafKey(p.title);
    const number = numberByStop.get(stopId);
    const markerType = String(p.kind || "").toLowerCase() === "lodging"
      ? "stay"
      : "activity";
    const plat = Number(p.lat);
    const plng = Number(p.lng);
    if (Number.isFinite(plat) && Number.isFinite(plng)) {
      mapPlaces.push({
        id: `${stopId}-main`,
        stopId,
        number,
        title: p.title || "",
        url: p.url || "",
        lat: plat,
        lng: plng,
        category: themeKey,
        markerType,
      });
      continue;
    }
    // One pin per stop — use first nested place if the stop has no coords
    for (const c of p.places || []) {
      const lat = Number(c.lat);
      const lng = Number(c.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      mapPlaces.push({
        id: `${stopId}-main`,
        stopId,
        number,
        title: p.title || c.name || "",
        url: p.url || c.url || "",
        lat,
        lng,
        category: themeKey,
        markerType,
      });
      break;
    }
  }

  const filterCats = [
    ...new Set(
      items.map((i) => i.travel_category).filter(Boolean),
    ),
  ].sort();
  const filterKinds = [
    ...new Set(items.map((i) => i.kind).filter(Boolean)),
  ].sort();

  return {
    hubSlug,
    hubTitle: hub.title || hubSlug,
    hubUrl: hub.url || `/destinations/${hubSlug}/`,
    theme: themeKey,
    seoSlug: themeSeoSlug(themeKey),
    label: themeLabel(themeKey),
    title: themePageTitle(themeKey, hub.title || hubSlug),
    url: themePageUrl(hubSlug, themeKey),
    legacyUrl: legacyThemePageUrl(hubSlug, themeKey),
    groups: groupsForTheme(themeKey),
    collection: collection
      ? {
        title: collection.title,
        url: collection.url,
        excerpt: excerptPlain(collection.excerpt || collection.content, 280),
        content: collection.content,
      }
      : null,
    items,
    mapPlaces,
    filterCats,
    filterKinds,
    count: items.length,
  };
}

/** All hub×theme pairs that have at least one stop. */
export function listThemePages(allPages = []) {
  const hubs = allPages.filter(
    (p) =>
      !p.draft &&
      p.isBase &&
      String(p.kind || "").toLowerCase() === "destination",
  );
  const out = [];
  for (const hub of hubs) {
    const index = buildHubThemes(hub, allPages);
    for (const t of index.flat) {
      const data = buildThemePage(hub, t.theme, allPages);
      if (data?.count) out.push(data);
    }
  }
  return out;
}

/** Bucket-list grouping by theme group → leaf. */
export function buildBucketThemeModel(candidates = []) {
  const withThemes = candidates.map((p) => ({
    ...p,
    themes: normalizeThemes(p.themes, p.tags),
  }));

  const groupMap = new Map();
  const unthemed = [];

  for (const p of withThemes) {
    if (!p.themes.length) {
      unthemed.push(p);
      continue;
    }
    const groupIds = new Set();
    for (const t of p.themes) {
      const gs = groupsForTheme(t);
      if (gs.length) gs.forEach((g) => groupIds.add(g.id));
      else groupIds.add("more");
    }
    for (const gid of groupIds) {
      if (!groupMap.has(gid)) {
        const meta = THEME_GROUPS[gid] || { label: "More", themes: [] };
        groupMap.set(gid, {
          id: gid,
          label: meta.label,
          themes: new Map(),
          items: [],
        });
      }
      const g = groupMap.get(gid);
      g.items.push(p);
      for (const t of p.themes) {
        if (gid !== "more" && !THEME_GROUPS[gid]?.themes.includes(t)) continue;
        if (!g.themes.has(t)) g.themes.set(t, []);
        g.themes.get(t).push(p);
      }
    }
  }

  const groups = [...groupMap.values()]
    .map((g) => ({
      id: g.id,
      label: g.label,
      count: g.items.length,
      themes: [...g.themes.entries()]
        .map(([theme, items]) => ({
          theme,
          label: themeLabel(theme),
          count: items.length,
          items: uniqByUrl(items),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      items: uniqByUrl(g.items),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const leafChips = new Map();
  for (const p of withThemes) {
    for (const t of p.themes) {
      if (!leafChips.has(t)) {
        leafChips.set(t, { theme: t, label: themeLabel(t), count: 0 });
      }
      leafChips.get(t).count++;
    }
  }

  return {
    groups,
    leaves: [...leafChips.values()].sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
    groupChips: groups.map((g) => ({
      id: g.id,
      label: g.label,
      count: g.count,
    })),
    unthemed: uniqByUrl(unthemed),
  };
}

function uniqByUrl(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const k = item.url || item.title;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
