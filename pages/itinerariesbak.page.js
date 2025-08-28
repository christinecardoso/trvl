import { addDays, format } from "npm:date-fns";

export default function* ({ search }) {
  // Get all itinerary container pages
  const itineraries = search.pages("type=itinerary");

  for (const main of itineraries) {
    if (!main.start_date) {
      console.warn(`⚠️ Itinerary "${main.data.title}" missing start_date`);
      continue;
    }

    const start = new Date(main.start_date); // works with YYYY-MM-DD
    const totalDays = main.days || 0;

    // Get related posts using itinerary_slug (or fallback to main slug)
    const slug = main.itinerary_slug || main.slug;
    const relatedPosts = search.pages(`itinerary_slug=${slug}`);

    let days = [];

    for (let i = 0; i < totalDays; i++) {
      const date = addDays(start, i);
      const dayNumber = i + 1;

      // grab posts for this day
      const dayPosts = relatedPosts.filter(
        (p) => p.itinerary_day === dayNumber
      );

      days.push({
        date: format(date, "yyyy-MM-dd"), // matches your format
        displayDate: format(date, "M/d"), // short display for table
        weekday: format(date, "EEEE"),
        posts: dayPosts,
      });
    }

    yield {
      ...main.data,        // front matter from itinerary container
      url: main.url,  // preserve container URL
      itinerary: days,     // attach generated itinerary
    };
  }
}
