/**
 * Day-of-week schedules for hub “what’s on today” recommendations.
 *
 * Frontmatter:
 * weekly:
 *   - days: [mon, wed]
 *     time: "7:30 PM – 9:30 PM"
 *     title: Salsa & bachata   # optional; defaults to page title
 *     cadence: weekly|monthly  # optional; default weekly
 *     notes: Confirm which Friday
 */

const DAY_ALIASES = {
  mon: "mon",
  monday: "mon",
  tue: "tue",
  tues: "tue",
  tuesday: "tue",
  wed: "wed",
  wednesday: "wed",
  thu: "thu",
  thur: "thu",
  thurs: "thu",
  thursday: "thu",
  fri: "fri",
  friday: "fri",
  sat: "sat",
  saturday: "sat",
  sun: "sun",
  sunday: "sun",
  // JS getDay()
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function normalizeWeekday(raw) {
  if (raw == null) return null;
  if (typeof raw === "number") return DAY_ALIASES[raw] || null;
  const key = String(raw).trim().toLowerCase();
  return DAY_ALIASES[key] || null;
}

export function normalizeWeekly(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];

  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const days = (Array.isArray(entry.days) ? entry.days : [entry.day || entry.days])
      .map(normalizeWeekday)
      .filter(Boolean);
    if (!days.length) continue;

    const cadence = String(entry.cadence || "weekly").toLowerCase() === "monthly"
      ? "monthly"
      : "weekly";

    out.push({
      days: [...new Set(days)],
      dayLabels: [...new Set(days)].map((d) => WEEKDAY_LABELS[d]),
      time: entry.time ? String(entry.time).trim() : "",
      title: entry.title ? String(entry.title).trim() : "",
      notes: entry.notes ? String(entry.notes).trim() : "",
      cadence,
    });
  }

  return out;
}

/** Flatten page weekly slots into recommendation cards. */
export function weeklyCardsForPage(page) {
  const slots = normalizeWeekly(page?.weekly);
  if (!slots.length) return [];

  return slots.flatMap((slot) =>
    slot.days.map((day) => ({
      day,
      dayLabel: WEEKDAY_LABELS[day],
      title: slot.title || page.title || "Open",
      time: slot.time,
      notes: slot.notes,
      cadence: slot.cadence,
      url: page.url || "",
      stopTitle: page.title || "",
      kind: page.kind || "activity",
      travel_category: page.travel_category || "",
      themes: page.themes || [],
    }))
  );
}

/**
 * Build hub weekly index: all recommendation cards + by-day buckets.
 */
export function buildHubWeekly(relatedStops = []) {
  const cards = [];
  for (const p of relatedStops) {
    if (p.draft || p.redirect_to || p.redirectTo) continue;
    cards.push(...weeklyCardsForPage(p));
  }

  const byDay = {};
  for (const d of WEEKDAY_ORDER) byDay[d] = [];
  for (const card of cards) {
    byDay[card.day].push(card);
  }
  for (const d of WEEKDAY_ORDER) {
    byDay[d].sort((a, b) =>
      String(a.time || "").localeCompare(String(b.time || "")) ||
      String(a.title || "").localeCompare(String(b.title || ""))
    );
  }

  return {
    cards,
    byDay,
    dayLabels: WEEKDAY_LABELS,
    dayOrder: WEEKDAY_ORDER,
    count: cards.length,
  };
}
