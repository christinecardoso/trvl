import { slugify } from "../scripts/itinerary_helpers.js";

export default function* ({ search }) {
  const all = search.pages() || [];

  const byCountry = new Map();

  for (const page of all) {
    const country = page.country;
    if (!country || typeof country !== "string") continue;

    const key = slugify(country);
    if (!key) continue;

    if (!byCountry.has(key)) {
      byCountry.set(key, {
        country,
        slug: key,
        destinations: [],
        itineraries: [],
        activities: [],
        lodging: [],
      });
    }

    const bucket = byCountry.get(key);
    const kind = String(page.kind || page.type || "").toLowerCase();

    if (page.type === "itinerary") {
      bucket.itineraries.push(page);
    } else if (kind === "destination" && page.isBase) {
      bucket.destinations.push(page);
    } else if (kind === "lodging") {
      bucket.lodging.push(page);
    } else if (
      kind === "activity" ||
      kind === "eats" ||
      kind === "eat" ||
      kind === "destination"
    ) {
      bucket.activities.push(page);
    }
  }

  // Also attach itineraries that only have destination_slug matching a base dest in-country
  const itineraries = all.filter((p) => p.type === "itinerary");
  for (const it of itineraries) {
    if (it.country) continue;
    if (!it.destination_slug) continue;
    for (const [, bucket] of byCountry) {
      const match = bucket.destinations.some(
        (d) => d.slug === it.destination_slug || d.base === it.destination_slug,
      );
      if (match && !bucket.itineraries.some((x) => x.url === it.url)) {
        bucket.itineraries.push(it);
      }
    }
  }

  const countries = [...byCountry.values()]
    .map((c) => ({
      ...c,
      destinations: uniqByUrl(c.destinations).sort(byTitle),
      itineraries: uniqByUrl(c.itineraries).sort(byTitle),
      activities: uniqByUrl(c.activities).sort(byTitle),
      lodging: uniqByUrl(c.lodging).sort(byTitle),
      counts: {
        destinations: uniqByUrl(c.destinations).length,
        itineraries: uniqByUrl(c.itineraries).length,
        activities: uniqByUrl(c.activities).length,
      },
    }))
    .sort((a, b) => a.country.localeCompare(b.country));

  // Archive index
  yield {
    url: "/countries/",
    layout: "layouts/countries-archive.vto",
    title: "Countries",
    menu: { visible: true, order: 1, title: "Countries" },
    countries,
  };

  // Per-country hubs
  for (const c of countries) {
    yield {
      url: `/countries/${c.slug}/`,
      layout: "layouts/country.vto",
      title: c.country,
      country: c.country,
      country_slug: c.slug,
      destinations: c.destinations,
      itineraries: c.itineraries,
      activities: c.activities,
      lodging: c.lodging,
      counts: c.counts,
    };
  }
}

function byTitle(a, b) {
  return String(a.title || "").localeCompare(String(b.title || ""));
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
