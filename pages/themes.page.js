import { listThemePages, legacyThemePageUrl } from "../scripts/themes.js";

export default function* ({ search }) {
  const all = search.pages() || [];
  const seen = new Set();

  for (const themePage of listThemePages(all)) {
    const url = themePage.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);

    yield {
      url,
      layout: "layouts/theme.vto",
      title: themePage.title,
      description:
        `${themePage.count} ${themePage.label.toLowerCase()} stops near ${themePage.hubTitle}. Plan day trips and bucket-list picks from this base.`,
      hub_slug: themePage.hubSlug,
      hub_title: themePage.hubTitle,
      hub_url: themePage.hubUrl,
      theme: themePage.theme,
      theme_slug: themePage.seoSlug,
      theme_label: themePage.label,
      theme_groups: themePage.groups,
      collection: themePage.collection,
      items: themePage.items,
      mapPlaces: themePage.mapPlaces,
      filterCats: themePage.filterCats,
      filterKinds: themePage.filterKinds,
      count: themePage.count,
    };

    // Keep old /themes/{key}/ paths working
    const legacy = themePage.legacyUrl ||
      legacyThemePageUrl(themePage.hubSlug, themePage.theme);
    if (legacy && legacy !== url && !seen.has(legacy)) {
      seen.add(legacy);
      yield {
        url: legacy,
        layout: "layouts/redirect.vto",
        redirectTo: url,
        title: "Redirecting…",
        extra_head: [
          `<meta http-equiv="refresh" content="0; url=${url}">`,
          `<link rel="canonical" href="${url}">`,
        ],
      };
    }
  }
}
