import { buildBucketThemeModel, normalizeThemes } from "../scripts/themes.js";

export default function* ({ search }) {
  const activities = search.pages("kind=activity", "title=asc") || [];
  const destinations = search.pages("kind=destination", "title=asc") || [];
  const eats = search.pages("kind=eats", "title=asc") || [];
  const lodging = search.pages("kind=lodging", "title=asc") || [];

  const candidates = [...destinations, ...activities, ...eats, ...lodging]
    .filter((page) => {
      if (page.draft) return false;
      if (page.isBase) return false;
      if (page.redirect_to || page.redirectTo) return false;
      if (String(page.kind || "").toLowerCase() === "collection") return false;
      if (page.bucket_list === true) return true;
      if (page.bucket_list === false) return false;
      return !page.itinerary_slug;
    })
    .map((page) => ({
      ...page,
      themes: normalizeThemes(page.themes, page.tags),
    }));

  const themeModel = buildBucketThemeModel(candidates);

  const byCountry = {};
  for (const page of candidates) {
    const country = page.country || "Uncategorized";
    if (!byCountry[country]) byCountry[country] = [];
    byCountry[country].push(page);
  }

  const countryGroups = Object.entries(byCountry)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([country, items]) => ({
      country,
      countryId: country
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      items: items.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      ),
    }));

  yield {
    url: "/bucket-list/",
    layout: "layouts/bucket-list.vto",
    title: "Bucket List",
    menu: { visible: true, order: 3, title: "Bucket List" },
    activities: candidates.filter((p) =>
      ["activity", "eats"].includes(String(p.kind || "").toLowerCase())
    ),
    destinations: candidates.filter(
      (p) => String(p.kind || "").toLowerCase() === "destination",
    ),
    candidates,
    themeModel,
    groups: countryGroups,
  };
}
