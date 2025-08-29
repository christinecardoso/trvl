// /pages/itineraries.page.js
export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  // ---------- helpers ----------
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const archivePageUrl = (n) => (n === 1 ? "/itineraries/" : `/itineraries/${n}/`);

  function expandDays(p) {
    const out = [];
    if (p.itinerary_day != null) out.push(Number(p.itinerary_day));

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

  const sortPages = (a, b) => {
    const ak = String(a.kind || "").toLowerCase() === "lodging" ? 0 : 1;
    const bk = String(b.kind || "").toLowerCase() === "lodging" ? 0 : 1;
    if (ak !== bk) return ak - bk;
    const an = Number(a.order);
    const bn = Number(b.order);
    const ao = Number.isFinite(an) ? an : 9999;
    const bo = Number.isFinite(bn) ? bn : 9999;
    if (ao !== bo) return ao - bo;
    return String(a.title || "").localeCompare(String(b.title || ""));
  };

  function buildMapPlaces(items) {
    const out = [];
    for (const p of items) {
      const plat = Number(p.lat), plng = Number(p.lng);
      if (Number.isFinite(plat) && Number.isFinite(plng)) {
        out.push({
          title: p.title || "",
          url: p.url || "",
          lat: plat,
          lng: plng,
          category: p.travel_category || p.kind || "activity",
        });
      }
      if (Array.isArray(p.places)) {
        for (const c of p.places) {
          const clat = Number(c.lat), clng = Number(c.lng);
          if (Number.isFinite(clat) && Number.isFinite(clng)) {
            out.push({
              title: c.title || c.name || "",
              url: c.url || p.url || "",
              lat: clat,
              lng: clng,
              category: c.travel_category || p.travel_category || p.kind || "activity",
            });
          }
        }
      }
    }
    return out;
  }

  // ---------- archive index ----------
  const itineraries = search.pages("type=itinerary", "title=asc");
  console.log("Archive sees:", itineraries.length);

  for (const data of paginate(itineraries, { url: archivePageUrl, size: 20 })) {
    if (data.pagination.page === 1) {
      data.menu = { visible: true, order: 0, title: "Itineraries" };
    }
    yield {
      ...data,
      title: "Travel Itineraries",
      archiveType: "itineraries",
    };
  }

  // ---------- JS-side selection (no query string) ----------
  // Pull *all* pages once, then filter here
  const allPages = search.pages() || [];

  for (const it of itineraries) {
    const slug = it.itinerary_slug || slugify(it.title);

    // Children = any page with matching itinerary_slug (exact),
    // sorted the same way your template does.
    const children = allPages
      .filter((p) => p.itinerary_slug === slug)
      .sort(sortPages);

    // Log what we found for this itinerary
    const quickCheck = allPages
      .filter((p) => p.itinerary_slug != null)
      .slice(0, 10)
      .map((p) => ({ title: p.title, itinerary_slug: p.itinerary_slug }));
    console.log("[CHECK] First 10 with itinerary_slug:", quickCheck);
    console.log("[CHILDREN]", slug, "=>", children.length);

    // Derive days
    let daysCount = Number(it.days);
    if (!Number.isFinite(daysCount) || daysCount <= 0) {
      const nums = [];
      for (const p of children) nums.push(...expandDays(p));
      daysCount = nums.length ? Math.max(...nums) : 1;
    }

    // Per-day yields
    for (let day = 1; day <= daysCount; day++) {
      const items = children
        .filter((p) => expandDays(p).includes(day))
        .slice()
        .sort(sortPages);

      console.log("[ITIN]", slug, "day", day, "| children:", children.length, "| items:", items.length);

      yield {
        url: `/itineraries/${slug}/day-${day}/`,
        layout: "layouts/itinerary_day.vto",

        title: `${it.title}: Day ${day}`,
        itinerary_title: it.title,
        itinerary_slug: slug,
        day_num: day,
        days_count: daysCount,

        items,
        pages: {
          all: children,
          today: items,
          mapPlaces: buildMapPlaces(items),
        },

        prev_day_url: day > 1 ? `/itineraries/${slug}/day-${day - 1}/` : null,
        next_day_url: day < daysCount ? `/itineraries/${slug}/day-${day + 1}/` : null,

        start_date: it.start_date,
      };
    }
  }
}
