import { slugify } from "../scripts/itinerary_helpers.js";

const CATEGORY_ORDER = [
  "In city",
  "Walkable",
  "Nearby",
  "Day Trip",
  "Overnight Trip",
  "Fly-In Destination",
];

export default function* ({ search }) {
  const activities = (search.pages("kind=activity", "title=asc") || []).filter(
    (p) => !p.draft && !p.redirect_to && !p.redirectTo,
  );
  const eats = (search.pages("kind=eats", "title=asc") || []).filter(
    (p) => !p.draft && !p.redirect_to,
  );
  const results = [...activities, ...eats].sort((a, b) =>
    String(a.title || "").localeCompare(String(b.title || "")),
  );

  const catCounts = new Map();
  for (const page of results) {
    const key = page.travel_category || "More";
    catCounts.set(key, (catCounts.get(key) || 0) + 1);
  }

  const categories = [];
  for (const key of CATEGORY_ORDER) {
    if (!catCounts.has(key)) continue;
    categories.push({ key, label: key, count: catCounts.get(key) });
    catCounts.delete(key);
  }
  for (const [key, count] of [...catCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    categories.push({ key, label: key, count });
  }

  const destPages = (search.pages("kind=destination isBase=true", "title=asc") || [])
    .filter((p) => !p.draft)
    .map((p) => ({
      slug: p.slug || p.base || slugify(p.title),
      title: p.title,
    }));

  yield {
    url: "/activities/",
    layout: "layouts/activities-archive.vto",
    title: "Things to Do",
    archiveType: "activity",
    menu: { visible: true, order: 4, title: "Things to Do" },
    results,
    categories,
    destinations: destPages,
  };
}
