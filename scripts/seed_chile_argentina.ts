/**
 * Seed Chile + Argentina itinerary content (run once).
 * deno run -A scripts/seed_chile_argentina.ts
 */
const ROOT = new URL("../posts/places/chile-argentina/", import.meta.url).pathname;
const ESS = new URL("../posts/places/essentials/", import.meta.url).pathname;

async function write(path: string, body: string) {
  await Deno.mkdir(path.replace(/\/[^/]+$/, ""), { recursive: true });
  await Deno.writeTextFile(path, body.trimStart());
  console.log("wrote", path.replace(/.*\/posts\//, "posts/"));
}

const SLUG = "chile-argentina-wine-andes";

await write(`${ESS}Chile Argentina Wine Andes Itinerary.md`, `---
title: "Chile + Argentina: Wine, Hot Springs, Beef & Andes"
type: itinerary
days: 13
layout: layouts/itinerary.vto
itinerary_slug: ${SLUG}
country: Argentina
destination_slug: mendoza
tags:
  - Wine
  - Food
  - Adventure
---
A **12–14 day** route for eating locally, drinking exceptional wine, getting into the mountains, soaking in thermal springs, and a few genuinely adventurous days — not a city-hopping vacation.

**Route:** Santiago → Colchagua → Mendoza / Luján de Cuyo → Cacheuta / Potrerillos → High Andes / Aconcagua → Valle de Uco → Buenos Aires.

With **14+ days**, add **San Rafael + Cañón del Atuel** between Uco and Buenos Aires.

Open **Day by day** or the **Timetable** for the live stop list. Spend upgrades on the **Uco Valley stay**, private wine days, exceptional lunches, horseback, and spa — not identical luxury hotels every night.

<!--more-->

## Ideal rhythm

| Days | Sleep | Focus |
| --- | --- | --- |
| 1–2 | Santiago | Chilean food, markets, city views |
| 3–4 | Colchagua / Santa Cruz | Clos Apalta, horses/bikes, Carménère |
| 5–6 | Mendoza / Chacras | Parrilla + Malbec, Luján wineries |
| 7 | Mendoza | Potrerillos adventure + Cacheuta hot springs |
| 8 | Mendoza | **Aconcagua + High Andes** (do-not-skip) |
| 9–10 | Valle de Uco | Vineyard hotel, cabalgata, high-altitude wine |
| 11–13 | Buenos Aires | Palermo, San Telmo, tango, bodegón |

## When to go

**March** first — harvest energy in the wine regions, warm days, cooler evenings. Late March into early April if you want slightly easier hiking weather than peak summer.

## Spend philosophy

Mix **Santiago boutique → Colchagua vineyard → Chacras de Coria → gorgeous Uco property → stylish BA hotel**. Put money where it changes the trip: Uco lodging, wine days, lunches, horses, and spa.
`);

// Destinations
await write(`${ROOT}Santiago.md`, `---
title: Santiago
slug: santiago
base: santiago
isBase: true
kind: destination
region: Central Chile
country: Chile
season: March harvest season
lat: -33.4489
lng: -70.6693
tags:
  - Food
  - Short-Getaways
layout: layouts/destination.vto
---
Gateway to Chilean wine country — two nights for food, markets, and Andes views before Colchagua.

Keep Santiago light: Lastarria / Providencia / Barrio Italia as a base, then head south for vineyards.

<!--more-->

## How to use these days

- **Night 1:** Arrive soft — Chilean dinner and a Carménère.
- **Day 2:** Market + barrio wander + seafood before Argentina's meat-heavy stretch.
- **Next:** Drive ~2–2½ hrs to Santa Cruz / Apalta.
`);

await write(`${ROOT}Mendoza.md`, `---
title: Mendoza
slug: mendoza
base: mendoza
isBase: true
kind: destination
region: Cuyo
country: Argentina
season: March Vendimia / harvest
lat: -32.8895
lng: -68.8458
tags:
  - Wine
  - Food
  - Adventure
layout: layouts/destination.vto
---
The trip's centerpiece — Malbec country, Andean day trips, hot springs, and the road to Aconcagua.

Base in **Chacras de Coria** for part of the stay, then sleep among the vines in **Valle de Uco**.

<!--more-->

## How to think about Mendoza time

- **Luján de Cuyo:** two wineries max + a long fire lunch.
- **Potrerillos + Cacheuta:** adventure morning, thermal afternoon.
- **Aconcagua day:** Ruta 7 → Uspallata → Puente del Inca → Laguna de Horcones.
- **Valle de Uco:** wake up to vines and snow peaks — don't day-trip it.
`);

await write(`${ROOT}Buenos Aires.md`, `---
title: Buenos Aires
slug: buenos-aires
base: buenos-aires
isBase: true
kind: destination
region: Pampas / Río de la Plata
country: Argentina
season: Year-round
lat: -34.6037
lng: -58.3816
tags:
  - Food
  - Culture
layout: layouts/destination.vto
---
City finale — Palermo and Recoleta energy, late dinners, tango, and a proper bodegón day.

Intentionally less scheduled than wine country. BA rewards wandering, eating, and staying out late (dinner at **9:30–10:30 PM** is normal).

<!--more-->

## Three nights well spent

- **Palermo:** walk, vermouth, empanadas, cocktails, late dinner.
- **Historic loop:** Recoleta → Plaza de Mayo → San Telmo Market + choripán.
- **One night:** intimate tango + family-style parrilla beef night.
- **Last day:** bodegón (milanesa, ñoquis, flan) — skip Michelin theater.
`);

await write(`${ROOT}stay/_data.yml`, `kind: lodging
`);

await write(`${ROOT}eat/_data.yml`, `kind: eats
`);

await write(`${ROOT}activity/_data.yml`, `kind: activity
`);

// Lodging
const stays = [
  {
    file: "Santiago Boutique Base.md",
    title: "Santiago boutique base (Lastarria / Providencia)",
    days: ["1", "2"],
    dest: "santiago",
    lat: -33.4405,
    lng: -70.6402,
    cat: "In city",
    body: "Stay in **Lastarria, Providencia, or Barrio Italia** — walkable food and culture without stealing time from wine country.",
  },
  {
    file: "Colchagua Vineyard Stay.md",
    title: "Colchagua / Santa Cruz vineyard stay",
    days: ["3", "4"],
    dest: "santiago",
    lat: -34.6394,
    lng: -71.3672,
    cat: "Day Trip",
    body: "Base around **Santa Cruz / Apalta** for Clos Apalta, Viu Manent, and Montes — your introduction to South American wine country.",
  },
  {
    file: "Chacras de Coria Stay.md",
    title: "Chacras de Coria stay",
    days: ["5", "6", "7", "8"],
    dest: "mendoza",
    lat: -32.984,
    lng: -68.873,
    cat: "Nearby",
    body: "Charming base outside downtown Mendoza for parrilla nights, Luján days, Cacheuta, and the Aconcagua road trip.",
  },
  {
    file: "Valle de Uco Vineyard Hotel.md",
    title: "Valle de Uco vineyard hotel",
    days: ["9", "10"],
    dest: "mendoza",
    lat: -33.57,
    lng: -69.02,
    cat: "Overnight Trip",
    body: "Sleep among the vines with Andes behind them — the upgrade that actually changes the trip. Wake-up wine country, not a day trip.",
  },
  {
    file: "Buenos Aires Palermo Recoleta.md",
    title: "Buenos Aires — Palermo or Recoleta",
    days: ["11", "12", "13"],
    dest: "buenos-aires",
    lat: -34.5875,
    lng: -58.425,
    cat: "In city",
    body: "Stylish city hotel for late dinners, walking, tango, and bodegón culture.",
  },
];

for (const s of stays) {
  await write(
    `${ROOT}stay/${s.file}`,
    `---
title: ${JSON.stringify(s.title)}
kind: lodging
itinerary_slug: ${SLUG}
itinerary_days:
${s.days.map((d) => `  - "${d}"`).join("\n")}
destination_slug: ${s.dest}
travel_category: ${s.cat}
lat: ${s.lat}
lng: ${s.lng}
bucket_list: true
---
${s.body}
`,
  );
}

// Day plans with schedules
const days = [
  {
    n: 1,
    title: "Arrive Santiago + Chilean dinner",
    dest: "santiago",
    lat: -33.4405,
    lng: -70.6402,
    themes: ["food"],
    excerpt: "Soft landing — Lastarria walk and a proper Chilean dinner with Carménère.",
    schedule: [
      { time: "Afternoon", title: "Arrive + settle", notes: "Keep the first afternoon relaxed." },
      {
        time: "Late afternoon",
        title: "Lastarria → Cerro Santa Lucía → Plaza de Armas",
        places: ["Lastarria", "Cerro Santa Lucía", "Plaza de Armas"],
      },
      {
        time: "Dinner",
        title: "Chilean dinner + Carménère",
        notes: "Pastel de choclo, empanada de pino, machas, completo, pisco sour — start Carménère.",
      },
    ],
  },
  {
    n: 2,
    title: "Santiago market + seafood",
    dest: "santiago",
    lat: -33.4378,
    lng: -70.6505,
    themes: ["food", "markets"],
    excerpt: "Produce market for cooks, Barrio Italia/Providencia, Andes views, seafood night.",
    schedule: [
      { time: "Morning", title: "Produce / food market", notes: "Markets over museums — ingredients, peppers, corn, olive oil." },
      { time: "Afternoon", title: "Barrio Italia / Providencia", places: ["Barrio Italia"] },
      { time: "Sunset", title: "Elevated Andes viewpoint", notes: "Somewhere with a clear mountain view." },
      { time: "Dinner", title: "Seafood night", notes: "Concentrate Pacific seafood here before Argentina turns meat-heavy." },
    ],
  },
  {
    n: 3,
    title: "Colchagua — Clos Apalta",
    dest: "santiago",
    lat: -34.608,
    lng: -71.25,
    themes: ["wine"],
    excerpt: "Drive Santiago → Santa Cruz; Clos Apalta as the centerpiece + long vineyard lunch.",
    schedule: [
      { time: "Morning", title: "Drive Santiago → Santa Cruz / Apalta", notes: "~2–2½ hours after breakfast." },
      { time: "Midday", title: "Clos Apalta", notes: "Architecture + underground cellar — don't rush." },
      { time: "Afternoon", title: "Long vineyard lunch", notes: "One great lunch beats four rushed tastings." },
    ],
  },
  {
    n: 4,
    title: "Colchagua — horses or bikes + wineries",
    dest: "santiago",
    lat: -34.65,
    lng: -71.3,
    themes: ["wine", "horses"],
    excerpt: "Viu Manent active wine day, then Viña Montes tasting and fire lunch.",
    schedule: [
      { time: "Morning", title: "Viu Manent — horses, carriage, or cycling", notes: "Avoid generic van-and-tasting-room only." },
      { time: "Afternoon", title: "Viña Montes + fire-focused lunch", notes: "Carménère, Cabernet, Syrah, Cinsault, País." },
    ],
  },
  {
    n: 5,
    title: "Mendoza begins — Chacras + parrilla",
    dest: "mendoza",
    lat: -32.984,
    lng: -68.873,
    themes: ["food", "wine"],
    excerpt: "Fly SCL → MDZ. Chacras de Coria wander, then parrilla + Malbec and Argentine cuts.",
    schedule: [
      { time: "Morning", title: "Fly Santiago → Mendoza", notes: "Prefer flight over long land transfer." },
      { time: "Afternoon", title: "Check in + wander Chacras de Coria" },
      {
        time: "Dinner",
        title: "Parrilla + Malbec",
        notes: "Ojo de bife, bife de chorizo, entraña, vacío, asado de tira, mollejas, chorizo, provoleta.",
      },
    ],
  },
  {
    n: 6,
    title: "Luján de Cuyo — two wineries + fire lunch",
    dest: "mendoza",
    lat: -33.05,
    lng: -68.88,
    themes: ["wine", "food"],
    excerpt: "Only two wineries. Morning tasting, 2–3 hr vineyard lunch (Lagarde/Fogón or Finca Decero).",
    schedule: [
      { time: "Morning", title: "Winery tasting #1" },
      { time: "Lunch", title: "Lagarde / Fogón fire lunch", notes: "Wine + beef + local food combination." },
      { time: "Afternoon", title: "One more tasting", notes: "Then return to Chacras — don't overpack the day." },
    ],
  },
  {
    n: 7,
    title: "Potrerillos adventure + Cacheuta hot springs",
    dest: "mendoza",
    lat: -33.02,
    lng: -69.12,
    themes: ["hot-springs", "wellness"],
    excerpt: "Rafting or kayaking at Potrerillos, then Termas de Cacheuta thermal circuit.",
    schedule: [
      { time: "Morning", title: "Potrerillos — rafting OR kayaking", notes: "Excitement vs scenic reservoir calm." },
      { time: "Lunch", title: "Mountain-view lunch" },
      {
        time: "Afternoon",
        title: "Termas de Cacheuta",
        notes: "35–50°C pools — thermal circuit → hydrotherapy → grotto/steam → massage → outdoor soak.",
      },
    ],
  },
  {
    n: 8,
    title: "High Andes + Aconcagua",
    dest: "mendoza",
    lat: -32.81,
    lng: -69.95,
    themes: ["hiking", "volcano", "photo"],
    excerpt: "Do-not-skip. Ruta 7 → Uspallata → Puente del Inca → Laguna de Horcones hike.",
    schedule: [
      { time: "Full day", title: "Ruta Nacional 7 toward Chile", notes: "Mendoza → Potrerillos → Uspallata → Puente del Inca → Aconcagua Provincial Park." },
      { time: "Hike", title: "Laguna de Horcones", notes: "Moderate hike; huge views of 6,962 m Aconcagua — no mountaineering required." },
      { time: "Stop", title: "Puente del Inca", notes: "Natural mineral bridge formations." },
    ],
  },
  {
    n: 9,
    title: "Valle de Uco — vineyard hotel day",
    dest: "mendoza",
    lat: -33.57,
    lng: -69.02,
    themes: ["wine"],
    excerpt: "Check into vineyard property. One winery → tasting → leisurely lunch → sunset wine.",
    schedule: [
      { time: "Morning", title: "Check into vineyard hotel" },
      { time: "Day", title: "One winery + enormous vineyard lunch" },
      { time: "Evening", title: "Hotel + sunset wine", notes: "No need to do anything else." },
    ],
  },
  {
    n: 10,
    title: "Uco cabalgata + wine",
    dest: "mendoza",
    lat: -33.58,
    lng: -69.03,
    themes: ["horses", "wine", "food"],
    excerpt: "Morning Argentine horseback ride through vines/foothills; afternoon winery. Seek Cabernet Franc.",
    schedule: [
      { time: "Morning", title: "Cabalgata (horseback)", notes: "Ideally ends with a traditional outdoor meal." },
      { time: "Afternoon", title: "Winery tasting", notes: "Malbec, Cabernet Franc, Bonarda, Torrontés, high-altitude blends." },
    ],
  },
  {
    n: 11,
    title: "Buenos Aires — Palermo",
    dest: "buenos-aires",
    lat: -34.5875,
    lng: -58.425,
    themes: ["food"],
    excerpt: "Fly MDZ → EZE/AEP. Walk Palermo, vermouth, empanadas, cocktails, late dinner.",
    schedule: [
      { time: "Morning", title: "Fly Mendoza → Buenos Aires" },
      { time: "Afternoon", title: "Walk Palermo", notes: "Wine/vermouth, empanadas, cocktails." },
      { time: "Dinner", title: "Late dinner", notes: "9:30–10:30 PM is completely normal." },
    ],
  },
  {
    n: 12,
    title: "Historic BA + tango + steak night",
    dest: "buenos-aires",
    lat: -34.621,
    lng: -58.373,
    themes: ["food", "historic", "dance"],
    excerpt: "Recoleta → Plaza de Mayo → San Telmo Market. Evening: intimate tango + family-style parrilla.",
    schedule: [
      { time: "Day", title: "Recoleta → Plaza de Mayo → San Telmo", places: ["Recoleta", "Plaza de Mayo", "San Telmo Market"] },
      { time: "Lunch", title: "Choripán + casual lunch" },
      { time: "Evening", title: "Milonga or intimate tango show" },
      {
        time: "Late dinner",
        title: "Argentine beef night (family style)",
        notes: "Provoleta → chorizo → mollejas → entraña → ojo de bife → asado de tira → Malbec → dulce de leche.",
      },
    ],
  },
  {
    n: 13,
    title: "Bodegón + local Buenos Aires",
    dest: "buenos-aires",
    lat: -34.595,
    lng: -58.393,
    themes: ["food"],
    excerpt: "Skip Michelin theater. Bodegón lunch, gelato, Recoleta/Palermo stroll, final late dinner.",
    schedule: [
      { time: "Lunch", title: "Bodegón", notes: "Milanesa napolitana, ravioli, ñoquis, tortilla, flan con dulce de leche." },
      { time: "Afternoon", title: "Café + artisanal gelato + walk Recoleta or Palermo" },
      { time: "Evening", title: "Cocktails + final late dinner" },
    ],
  },
];

function yamlList(items: string[]) {
  return items.map((i) => `  - ${JSON.stringify(i)}`).join("\n");
}

function scheduleYaml(slots: { time: string; title: string; notes?: string; places?: string[] }[]) {
  return slots
    .map((s) => {
      let block = `  - time: ${JSON.stringify(s.time)}\n    title: ${JSON.stringify(s.title)}`;
      if (s.notes) block += `\n    notes: ${JSON.stringify(s.notes)}`;
      if (s.places?.length) {
        block += `\n    places:\n${s.places.map((p) => `      - ${JSON.stringify(p)}`).join("\n")}`;
      }
      return block;
    })
    .join("\n");
}

for (const d of days) {
  await write(
    `${ROOT}activity/plans/Day ${d.n} ${d.title}.md`,
    `---
title: ${JSON.stringify(`Day ${d.n} — ${d.title}`)}
kind: activity
itinerary_slug: ${SLUG}
itinerary_day: ${d.n}
order: ${d.n}
destination_slug: ${d.dest}
travel_category: ${d.dest === "santiago" && d.n >= 3 ? "Day Trip" : "In city"}
visit_style: Circuit
lat: ${d.lat}
lng: ${d.lng}
themes:
${yamlList(d.themes)}
theme_excerpts:
  ${d.themes[0]}: ${JSON.stringify(d.excerpt)}
bucket_list: true
schedule:
${scheduleYaml(d.schedule)}
---
${d.excerpt}

<!--more-->

## Notes

Part of the **Chile + Argentina wine & Andes** itinerary. See the overview for route logic, food checklists, and when to go.
`,
  );
}

// Highlight stops
const highlights = [
  {
    file: "Clos Apalta.md",
    title: "Clos Apalta",
    dest: "santiago",
    lat: -34.608,
    lng: -71.25,
    themes: ["wine", "architecture"],
    cat: "Day Trip",
    excerpt: "Apalta showpiece — architecture and underground cellar; make it the Colchagua centerpiece.",
    body: "The architecture and underground cellar alone make Clos Apalta memorable. Pair with a long vineyard lunch rather than rushing multiple estates.",
  },
  {
    file: "Viu Manent.md",
    title: "Viu Manent",
    dest: "santiago",
    lat: -34.65,
    lng: -71.32,
    themes: ["wine", "horses"],
    cat: "Day Trip",
    excerpt: "Wine with horseback, carriage, or cycling — active Colchagua day.",
    body: "Skip the generic van tasting circuit. Combine wine with horses, carriages, or bikes.",
  },
  {
    file: "Vina Montes.md",
    title: "Viña Montes",
    dest: "santiago",
    lat: -34.67,
    lng: -71.28,
    themes: ["wine", "food"],
    cat: "Day Trip",
    excerpt: "Colchagua tasting plus fire-focused lunch — Carménère and bold reds.",
    body: "Strong second Colchagua stop after an active morning elsewhere.",
  },
  {
    file: "Lagarde Fogon.md",
    title: "Lagarde / Fogón",
    dest: "mendoza",
    lat: -33.05,
    lng: -68.88,
    themes: ["wine", "food"],
    cat: "Nearby",
    excerpt: "Luján fire-driven lunch — wine, beef, and local cooking in one sitting.",
    body: "Do only two wineries the day you come here. Morning tasting, then a 2–3 hour Fogón lunch.",
  },
  {
    file: "Termas de Cacheuta.md",
    title: "Termas de Cacheuta",
    dest: "mendoza",
    lat: -33.02,
    lng: -69.12,
    themes: ["hot-springs", "wellness"],
    cat: "Day Trip",
    excerpt: "Andean thermal pools ~35–50°C — full spa circuit after Potrerillos adventure.",
    body: "Outdoor thermal pools with mountain scenery. Do the proper circuit: thermal → hydrotherapy → grotto/steam → massage → soak.",
  },
  {
    file: "Potrerillos Adventure.md",
    title: "Potrerillos rafting or kayaking",
    dest: "mendoza",
    lat: -32.95,
    lng: -69.2,
    themes: ["lake"],
    cat: "Day Trip",
    excerpt: "Morning adventure at the reservoir — rafting for excitement or kayaking for calm scenery.",
    body: "Choose rafting or kayaking, then lunch overlooking the mountains before Cacheuta.",
  },
  {
    file: "Aconcagua Laguna de Horcones.md",
    title: "Aconcagua — Laguna de Horcones",
    dest: "mendoza",
    lat: -32.811,
    lng: -69.942,
    themes: ["hiking", "volcano", "photo"],
    cat: "Day Trip",
    excerpt: "Highest peak outside Asia (6,962 m) — moderate Horcones hike, not a summit attempt.",
    body: "Follow Ruta 7 via Uspallata and Puente del Inca. Hike Laguna de Horcones for huge views without mountaineering.",
  },
  {
    file: "Puente del Inca.md",
    title: "Puente del Inca",
    dest: "mendoza",
    lat: -32.826,
    lng: -69.911,
    themes: ["photo", "historic"],
    cat: "Day Trip",
    excerpt: "Natural mineral bridge on the High Andes day — pair with Aconcagua.",
    body: "Strange mineral formations on the road toward Chile; stop on the Aconcagua day.",
  },
  {
    file: "Valle de Uco Cabalgata.md",
    title: "Valle de Uco cabalgata",
    dest: "mendoza",
    lat: -33.58,
    lng: -69.03,
    themes: ["horses", "wine"],
    cat: "Overnight Trip",
    excerpt: "Argentine horseback through vineyards or foothills — ideally ending with an outdoor meal.",
    body: "Morning ride, afternoon winery. Look for Cabernet Franc alongside Malbec.",
  },
  {
    file: "San Telmo Market.md",
    title: "San Telmo Market",
    dest: "buenos-aires",
    lat: -34.6211,
    lng: -58.373,
    themes: ["markets", "food", "historic"],
    cat: "In city",
    excerpt: "Historic BA market day — choripán, wandering, then rest before tango night.",
    body: "Casual lunch energy. Save appetite for the evening beef night.",
  },
  {
    file: "Argentine Beef Night.md",
    title: "Argentine beef night (parrilla)",
    dest: "buenos-aires",
    lat: -34.59,
    lng: -58.42,
    themes: ["food"],
    cat: "In city",
    excerpt: "Family-style parrilla with visible grill — the trip's dedicated beef night.",
    body: `Order family style:

1. Provoleta  
2. Chorizo  
3. Mollejas  
4. Entraña  
5. Ojo de bife  
6. Asado de tira  
7. Simple salad / potatoes  
8. Malbec  
9. Dulce de leche dessert  

More fun than everyone ordering an individual filet.`,
  },
  {
    file: "Buenos Aires Bodegon.md",
    title: "Buenos Aires bodegón",
    dest: "buenos-aires",
    lat: -34.595,
    lng: -58.393,
    themes: ["food"],
    cat: "In city",
    excerpt: "Neighborhood Spanish/Italian immigrant food culture — milanesa, ñoquis, flan.",
    body: "Deliberately avoid Michelin-type restaurants this day. Bodegones are the local institutions.",
  },
  {
    file: "San Rafael Canon del Atuel.md",
    title: "San Rafael + Cañón del Atuel (optional)",
    dest: "mendoza",
    lat: -34.6177,
    lng: -68.3301,
    themes: ["hiking", "ziplining", "wine"],
    cat: "Overnight Trip",
    excerpt: "Optional days 14–15 — canyon walls, turquoise water, rafting, zipline, wineries.",
    body: "Don't squeeze into a 10–12 day trip. For **14–15 days**, add two nights between Uco and Buenos Aires.",
  },
];

for (const h of highlights) {
  await write(
    `${ROOT}activity/${h.file}`,
    `---
title: ${JSON.stringify(h.title)}
kind: activity
destination_slug: ${h.dest}
travel_category: ${h.cat}
lat: ${h.lat}
lng: ${h.lng}
themes:
${yamlList(h.themes)}
theme_excerpts:
  ${h.themes[0]}: ${JSON.stringify(h.excerpt)}
bucket_list: true
visit_time: half day–full day
---
${h.excerpt}

<!--more-->

${h.body}
`,
  );
}

// Reference guides
await write(`${ESS}Chile Things You Have to Eat.md`, `---
title: Chile — things you have to eat
kind: reference
hub: santiago
destination_slug: santiago
country: Chile
section: food
order: 1
---
Foods to work through in Santiago and Colchagua before the trip turns Argentine and meat-heavy.

## Checklist

- **Pastel de choclo** — baked corn, beef, chicken, olives, egg
- **Empanada de pino** — beef, onion, egg, olive
- **Cazuela** — rustic meat-and-vegetable soup
- **Charquicán** — traditional meat/vegetable stew
- **Humitas** — Chilean corn parcels
- **Machas a la parmesana** — razor clams baked with Parmesan
- **Congrio** — conger eel
- Chilean ceviche
- **Completo** — Chilean loaded hot dog
- Chilean olive oil
- Chilean **pisco sour**
- Fresh Pacific seafood (prioritize before Mendoza)

## Drink

Start **Carménère**, then Cabernet Sauvignon, Syrah, Cinsault, and País in Colchagua.
`);

await write(`${ESS}Argentina Things You Have to Eat.md`, `---
title: Argentina — things you have to eat
kind: reference
hub: mendoza
destination_slug: mendoza
country: Argentina
section: food
order: 1
---
Mendoza through Buenos Aires — cuts, asado culture, and sweets.

## Mendoza & asado

- Empanadas mendocinas
- **Chivito** (local goat)
- Asado
- **Provoleta**
- Choripán
- Milanesa

### Cuts to learn (not just “steak”)

| Cut | What it is |
| --- | --- |
| **Ojo de bife** | Ribeye |
| **Bife de chorizo** | Thick strip / sirloin |
| **Entraña** | Skirt steak |
| **Vacío** | Flank / bavette-like |
| **Asado de tira** | Cross-cut short ribs |
| **Mollejas** | Sweetbreads |
| **Chorizo** | Argentine sausage |

## Buenos Aires

- Bodegón classics: milanesa napolitana, ravioli, ñoquis, tortilla española
- Alfajores, dulce de leche, flan, artisanal gelato

Because you cook: try to work in a **market** and an **asado / cooking experience**, not only restaurants.
`);

await write(`${ESS}Chile Argentina Wine Checklist.md`, `---
title: Chile + Argentina wine checklist
kind: reference
hub: mendoza
destination_slug: mendoza
country: Argentina
section: more
order: 2
---
## Chile (Colchagua)

Don't exclusively drink Cabernet.

- Carménère
- Cabernet Sauvignon
- Syrah
- Cinsault
- País

Colchagua is especially known for its reds.

**Anchors:** Clos Apalta · Viu Manent · Viña Montes

## Argentina (Luján + Uco)

You need excellent **Malbec** — also seek:

- Cabernet Franc (especially Uco)
- Bonarda
- Torrontés
- Cabernet Sauvignon
- Petit Verdot
- High-altitude red blends

**Anchors:** Lagarde / Fogón · Finca Decero · Valle de Uco vineyard tastings

## Pacing rule

Two wineries + one long lunch beats four rushed tastings.
`);

await write(`${ESS}Chile Argentina Adventure Checklist.md`, `---
title: Chile + Argentina adventure checklist
kind: reference
hub: mendoza
destination_slug: mendoza
country: Argentina
section: more
order: 3
---
Adventure under the wine — none of this requires turning the trip into an exhausting trek.

## Checklist

- [ ] Andes hiking
- [ ] Aconcagua views (Laguna de Horcones)
- [ ] Puente del Inca
- [ ] Horseback riding (Colchagua and/or Uco cabalgata)
- [ ] Vineyard biking / e-biking
- [ ] Rafting **or** kayaking at Potrerillos
- [ ] Thermal springs at Cacheuta
- [ ] Potrerillos reservoir scenery
- [ ] High Andes road trip (Ruta 7)
- [ ] Optional: San Rafael / Cañón del Atuel (days 14–15)

## Do-not-skip

**Day 8 — Aconcagua + High Andes.** Soft hiking, huge payoff.
`);

await write(`${ESS}Santiago Things You Have to Eat.md`, `---
title: Santiago things you have to eat
kind: reference
hub: santiago
destination_slug: santiago
country: Chile
section: food
order: 1
---
See also the fuller Chile food checklist. In the city: markets, Lastarria dinners, and a seafood night before Colchagua.
`);

console.log("Done seeding Chile + Argentina content.");
