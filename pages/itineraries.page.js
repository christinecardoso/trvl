// itineraries.page.js
export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  // ----- helpers -----
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const getKeys = (p) => {
    const out = [];
    const a = p.itinerary_days;
    const b = p.itinerary_day;
    if (Array.isArray(a)) a.forEach((x) => out.push(String(x)));
    else if (a != null) out.push(String(a));
    if (b != null) out.push(String(b));
    return out;
  };

  const sortPages = (a, b) => {
    // Lodging first
    const ak = String(a.kind || "").toLowerCase() === "lodging" ? 0 : 1;
    const bk = String(b.kind || "").toLowerCase() === "lodging" ? 0 : 1;
    if (ak !== bk) return ak - bk;

    // Then numeric 'order' (coerce strings to numbers)
    const an = Number(a.order);
    const bn = Number(b.order);
    const ao = Number.isFinite(an) ? an : 9999;
    const bo = Number.isFinite(bn) ? bn : 9999;
    if (ao !== bo) return ao - bo;

    // Then title
    return String(a.title || "").localeCompare(String(b.title || ""));
  };

  const matchDay = (p, dayNum) => {
    const keys = getKeys(p);
    if (!keys.length) return false;
    return keys.some((k) => {
      const m = String(k).match(/\d+/);
      return m && Number(m[0]) === dayNum;
    });
  };

  // ----- query itineraries (masters) -----
  const itineraries = search.pages("type=itinerary", "title=asc");

  // ----- 1) Yield the archive pages (unchanged) -----
  for (const data of paginate(itineraries, { url, size: 20 })) {
    if (data.pagination.page === 1) {
      data.menu = { visible: true, order: 0, title: "Itineraries" };
    }

    yield {
      ...data,
      title: "Travel Itineraries",
      archiveType: "itineraries",
    };
  }

  // ----- 2) Yield per-day pages for each itinerary -----
  for (const it of itineraries) {
    const slug = it.itinerary_slug || slugify(it.title);

    // Load children; include both legacy/new day fields and useful sort fields
    const byDay  = search.pages(`itinerary_slug=${slug}`, "itinerary_day", "order", "kind", "title")  || [];
    const byDays = search.pages(`itinerary_slug=${slug}`, "itinerary_days", "order", "kind", "title") || [];

    // De-dupe by URL (fallback to src.path)
    const seen = new Set();
    const children = [...byDay, ...byDays].filter((p) => {
      const k = p.url || (p.src && p.src.path) || cryptoKey(p);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Derive day count: prefer front matter "days"; else max numeric day from children
    let daysCount = Number(it.days);
    if (!Number.isFinite(daysCount) || daysCount <= 0) {
      const nums = [];
      for (const p of children) {
        for (const k of getKeys(p)) {
          const m = String(k).match(/\d+/);
          if (m) nums.push(Number(m[0]));
        }
      }
      daysCount = nums.length ? Math.max(...nums) : 0;
    }

    // Generate one page per day
    for (let day = 1; day <= daysCount; day++) {
      const items = children.filter((p) => matchDay(p, day)).slice().sort(sortPages);

      yield {
        // per-day URL like /itineraries/ecuador-itinerary/day-1/
        url: `/itineraries/${slug}/day-${day}/`,

        // use a dedicated layout for day pages
        layout: "layouts/itinerary_day.vto",

        // data available to the layout
        title: `${it.title}: Day ${day}`,
        itinerary_title: it.title,
        itinerary_slug: slug,
        day_num: day,
        days_count: daysCount,
        items,

        // Optional: prev/next links
        prev_day_url: day > 1 ? `/itineraries/${slug}/day-${day - 1}/` : null,
        next_day_url: day < daysCount ? `/itineraries/${slug}/day-${day + 1}/` : null,

        // You can also pass start_date if you want date calc in the layout
        start_date: it.start_date,
      };
    }
  }
}

// fallback unique key for dedupe if no url/src.path (rare)
function cryptoKey(p) {
  return JSON.stringify([p.title, p.date, p.src && p.src.path]);
}

function url(n) {
  if (n === 1) return "/itineraries/";
  return `/itineraries/${n}/`;
}
