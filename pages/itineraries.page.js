import {
  slugify,
  expandDays,
  sortPages,
  buildMapPlacesForDay,
  buildDayView,
  buildTimetableDays,
  buildRouteLegs,
  googleMapsDirectionsUrl,
  resolveBlockType,
  normalizeOptions,
  resolveOptionUrls,
  enrichScheduleSlots,
  mapStopId,
  stopHasMap,
  BLOCK_TYPE_LEGEND,
  TIMETABLE_HOURS,
} from "../scripts/itinerary_helpers.js";

function enrichStop(item, allPages) {
  const options = resolveOptionUrls(normalizeOptions(item), allPages);
  const schedule = enrichScheduleSlots(item, allPages);
  const enriched = {
    ...item,
    options,
    option_count: options.length,
    is_flexible: !!item.flexible || options.length > 0,
    schedule,
    schedule_count: schedule.length,
    map_stop_id: mapStopId(item),
    has_map: stopHasMap(item),
  };
  const { type, label } = resolveBlockType(enriched);
  return {
    ...enriched,
    block_type: type,
    block_label: label,
  };
}

export default function* ({ search, paginate }) {
  const archivePageUrl = (n) => (n === 1 ? "/itineraries/" : `/itineraries/${n}/`);

  const itineraries = search.pages("type=itinerary", "title=asc");

  for (const data of paginate(itineraries, { url: archivePageUrl, size: 20 })) {
    if (data.pagination.page === 1) {
      data.menu = { visible: true, order: 0, title: "Itineraries" };
    }
    yield {
      ...data,
      layout: "layouts/itineraries-archive.vto",
      title: "Travel Itineraries",
      archiveType: "itineraries",
    };
  }

  const allPages = search.pages() || [];

  for (const it of itineraries) {
    const slug = it.itinerary_slug || slugify(it.title);

    const children = allPages
      .filter((p) => p.itinerary_slug === slug)
      .sort(sortPages);

    let daysCount = Number(it.days);
    if (!Number.isFinite(daysCount) || daysCount <= 0) {
      const nums = [];
      for (const p of children) nums.push(...expandDays(p));
      daysCount = nums.length ? Math.max(...nums) : 1;
    }

    const countrySlug = it.country ? slugify(it.country) : null;
    const enrichedChildren = children.map((p) => enrichStop(p, allPages));

    const timetableDays = buildTimetableDays(
      { ...it, itinerary_slug: slug },
      enrichedChildren,
      daysCount,
    );

    // Full calendar / timetable view
    yield {
      url: `/itineraries/${slug}/timetable/`,
      layout: "layouts/itinerary_timetable.vto",
      title: `${it.title}: Timetable`,
      itinerary_title: it.title,
      itinerary_url: it.url,
      itinerary_slug: slug,
      days_count: daysCount,
      start_date: it.start_date,
      country: it.country,
      country_url: countrySlug ? `/countries/${countrySlug}/` : null,
      timetable_days: timetableDays,
      timetable_blocks: Object.fromEntries(
        timetableDays.flatMap((d) => d.blocks.map((b) => [b.id, b])),
      ),
      block_type_legend: BLOCK_TYPE_LEGEND,
      hour_labels: TIMETABLE_HOURS.map((h) => ({
        hour: h,
        label: new Date(Date.UTC(2000, 0, 1, h)).toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour: "numeric",
        }),
        topPct: ((h - TIMETABLE_HOURS[0]) / (TIMETABLE_HOURS.length)) * 100,
      })),
    };

    for (let day = 1; day <= daysCount; day++) {
      const items = children
        .filter((p) => expandDays(p).includes(day))
        .slice()
        .sort(sortPages)
        .map((p) => enrichStop(p, allPages));

      const dayView = buildDayView(items);
      const mapPlaces = buildMapPlacesForDay(items, dayView);
      const routeLegs = buildRouteLegs(mapPlaces);
      const gmapsUrl = googleMapsDirectionsUrl(mapPlaces);
      const legByFrom = Object.fromEntries(
        routeLegs.map((leg) => [leg.fromStopId, leg]),
      );
      const todayWithLegs = items.map((p) => ({
        ...p,
        route_leg_after: legByFrom[p.map_stop_id] || null,
      }));

      yield {
        url: `/itineraries/${slug}/day-${day}/`,
        layout: "layouts/itinerary_day.vto",

        title: `${it.title}: Day ${day}`,
        itinerary_title: it.title,
        itinerary_url: it.url,
        itinerary_slug: slug,
        day_num: day,
        days_count: daysCount,
        country: it.country,
        country_url: countrySlug ? `/countries/${countrySlug}/` : null,

        items,
        day_view: dayView,
        route_legs: routeLegs,
        gmaps_url: gmapsUrl,
        pages: {
          all: enrichedChildren,
          today: todayWithLegs,
          mapPlaces,
        },

        prev_day_url: day > 1 ? `/itineraries/${slug}/day-${day - 1}/` : null,
        next_day_url: day < daysCount ? `/itineraries/${slug}/day-${day + 1}/` : null,
        timetable_url: `/itineraries/${slug}/timetable/`,

        start_date: it.start_date,
      };
    }
  }
}
