/**
 * Seed Miami weekend shortlist (Fri–Sat) for hub calendar + maps.
 * deno run -A scripts/seed_miami_weekend.ts
 */
const ROOT = new URL("../posts/places/miami/", import.meta.url).pathname;
const ESS = new URL("../posts/places/essentials/", import.meta.url).pathname;

async function write(path: string, body: string) {
  await Deno.mkdir(path.replace(/\/[^/]+$/, ""), { recursive: true });
  await Deno.writeTextFile(path, body.trimStart());
  console.log("wrote", path.replace(/.*\/posts\//, "posts/"));
}

function weeklyYaml(
  slots: {
    days: string[];
    time?: string;
    title: string;
    notes?: string;
    cadence?: string;
  }[],
) {
  return slots
    .map((s) => {
      let b = `  - days: [${s.days.join(", ")}]`;
      if (s.time) b += `\n    time: ${JSON.stringify(s.time)}`;
      b += `\n    title: ${JSON.stringify(s.title)}`;
      if (s.cadence) b += `\n    cadence: ${s.cadence}`;
      if (s.notes) b += `\n    notes: ${JSON.stringify(s.notes)}`;
      return b;
    })
    .join("\n");
}

await write(`${ROOT}_data.yml`, `destination_slug: miami
country: "USA"
base: miami
`);

await write(
  `${ROOT}Miami.md`,
  `---
title: Miami
slug: miami
base: miami
isBase: true
kind: destination
region: South Florida
country: USA
season: Year-round
lat: 25.7617
lng: -80.1918
tags:
  - Food
  - Nightlife
  - Culture
layout: layouts/destination.vto
---
Miami Beach, Little Havana, Wynwood, Brickell, and Coral Gables — dinner + live music, daytime jazz and pools, plus cultural picks you’d remember like flamenco or a WALLCAST.

Use **On the calendar** for Friday/Saturday options, or open the weekend shortlist to compare vibes side by side.

<!--more-->

## This weekend mindset

- **Friday night:** pick one lane — Faena upscale/performative, Lyric Theater cultural, or Café La Trova → Ball & Chain for Cuban dinner + dancing.
- **Saturday before boat/day plans:** Betsy daytime jazz, Float On!, Novo Flow, golf, or Vizcaya / Coconut Grove.
- **If Saturday evening frees up:** prioritize **Viva Brazil at the Bandshell**.
`,
);

type Stop = {
  file: string;
  title: string;
  kind?: string;
  themes: string[];
  excerpt: string;
  area: string;
  vibe: string;
  lat: number;
  lng: number;
  cat?: string;
  body: string;
  weekly: {
    days: string[];
    time?: string;
    title: string;
    notes?: string;
    cadence?: string;
  }[];
};

const stops: Stop[] = [
  {
    file: "Faena Miami Beach.md",
    title: "Faena — Pao → Living Room → Saxony",
    themes: ["food", "nightlife", "jazz"],
    excerpt: "Fri night Miami Beach — dinner at Pao, live music in Living Room, Afro-house later at Saxony.",
    area: "Miami Beach",
    vibe: "Dinner + live music + Afro-house later",
    lat: 25.8072,
    lng: -80.1238,
    weekly: [{
      days: ["fri"],
      title: "Pao → Living Room → Saxony night",
      notes: "Beautiful/upscale/performative Friday lane — confirm show & DJ times",
    }],
    body: `**Area:** Miami Beach  
**Vibe:** Dinner + live music + Afro-house later

Best Friday pick if you want the beautiful / upscale / performative night. Sequence: **Pao** dinner → **Living Room** live music → **Saxony** for later Afro-house.

Pair with **OBSESSION** at Faena Theater if you want cabaret the same night (separate ticket).`,
  },
  {
    file: "Faena Theater Obsession.md",
    title: "Faena Theater — OBSESSION",
    themes: ["dance", "nightlife"],
    excerpt: "Fri 8 / 10:30 PM — cabaret, dance, immersive show at Faena Theater.",
    area: "Miami Beach",
    vibe: "Cabaret / dance / immersive",
    lat: 25.8074,
    lng: -80.1235,
    weekly: [{
      days: ["fri"],
      time: "8:00 PM & 10:30 PM",
      title: "OBSESSION",
      notes: "This weekend showtimes — confirm tickets on Faena Theater",
      cadence: "monthly",
    }],
    body: `**Area:** Miami Beach  
**When:** Friday **8:00 PM** and **10:30 PM** (confirm this weekend)

Theatrical / cabaret / immersive — the SoundScape / flamenco-adjacent cultural lane at Faena.`,
  },
  {
    file: "Cachita Lopez Lyric Theater.md",
    title: "Cachita López Quartet @ Historic Lyric Theater",
    themes: ["jazz", "historic"],
    excerpt: "Fri 8 PM — Cuban/Latin jazz in Overtown’s historic Lyric Theater.",
    area: "Overtown",
    vibe: "Cuban/Latin jazz in a historic theater",
    lat: 25.7845,
    lng: -80.1992,
    weekly: [{
      days: ["fri"],
      time: "8:00 PM",
      title: "Cachita López Quartet",
      notes: "This Friday — culturally special alternative to Faena",
      cadence: "monthly",
    }],
    body: `**Area:** Overtown  
**When:** Friday **8:00 PM**

Historic Lyric Theater + Cuban/Latin jazz. Top cultural Friday pick if you’d rather something special than clubby.`,
  },
  {
    file: "Cafe La Trova Fontainebleau.md",
    title: "Café La Trova × Fontainebleau takeover",
    themes: ["food", "jazz", "nightlife"],
    excerpt: "Fri 9–11:30 PM — Cuban musicians + cocktails at Fontainebleau (takeover).",
    area: "Miami Beach",
    vibe: "Cuban musicians + cocktails",
    lat: 25.8183,
    lng: -80.1222,
    weekly: [{
      days: ["fri"],
      time: "9:00 PM – 11:30 PM",
      title: "Fontainebleau takeover",
      notes: "This Friday only — confirm venue room on Fontainebleau / La Trova channels",
      cadence: "monthly",
    }],
    body: `**Area:** Miami Beach (Fontainebleau)  
**When:** Friday **9:00–11:30 PM**

Café La Trova musicians taking over Fontainebleau for Cuban music + cocktails.`,
  },
  {
    file: "Cafe La Trova.md",
    title: "Café La Trova",
    kind: "eats",
    themes: ["food", "jazz"],
    excerpt: "Little Havana dinner + live Cuban music — Fri night classic.",
    area: "Little Havana",
    vibe: "Dinner + live Cuban music",
    lat: 25.7654,
    lng: -80.2198,
    weekly: [{
      days: ["fri", "sat"],
      title: "Dinner + live Cuban music",
      notes: "Reserve — music nights are busy; check which band is on",
    }],
    body: `**Area:** Little Havana  
**Vibe:** Dinner + live Cuban music / cocktail culture

Home-base Cuban night. Pair with **Ball & Chain** for dancing after dinner.`,
  },
  {
    file: "Ball and Chain.md",
    title: "Ball & Chain — Miami Boheme",
    themes: ["food", "dance", "nightlife"],
    excerpt: "Fri night Little Havana — dinner + live salsa/timba + dancing (Miami Boheme).",
    area: "Little Havana",
    vibe: "Dinner + live salsa/timba + dancing",
    lat: 25.7656,
    lng: -80.2195,
    weekly: [{
      days: ["fri"],
      title: "Miami Boheme",
      notes: "Salsa/timba night — arrive early for dinner if you want a table",
    }],
    body: `**Area:** Little Havana  
Strong Friday dance lane after Café La Trova — live salsa/timba.`,
  },
  {
    file: "Armstrong Jazz House.md",
    title: "Armstrong Jazz House",
    kind: "eats",
    themes: ["jazz", "food"],
    excerpt: "Coral Gables intimate jazz + dinner — Fri or Sat.",
    area: "Coral Gables",
    vibe: "Intimate jazz + dinner",
    lat: 25.7495,
    lng: -80.2585,
    weekly: [{
      days: ["fri", "sat"],
      title: "Jazz + dinner",
      notes: "Intimate room — reserve",
    }],
    body: `**Area:** Coral Gables  
Quiet, intimate alternative to Beach club nights.`,
  },
  {
    file: "Lagniappe.md",
    title: "Lagniappe",
    kind: "eats",
    themes: ["wine", "jazz", "food"],
    excerpt: "Midtown wine + food + live jazz — Fri or Sat.",
    area: "Midtown",
    vibe: "Wine + food + live jazz",
    lat: 25.8092,
    lng: -80.1931,
    weekly: [{
      days: ["fri", "sat"],
      title: "Wine + live jazz",
      notes: "Walk-up energy; check who’s playing",
    }],
    body: `**Area:** Midtown  
Wine garden energy with live jazz — lower-key than Faena or clubs.`,
  },
  {
    file: "Andres Carne de Res.md",
    title: "Andrés Carne de Res",
    kind: "eats",
    themes: ["food", "dance", "nightlife"],
    excerpt: "Miami Beach Colombian dinner + performers + dancing — Fri or Sat.",
    area: "Miami Beach",
    vibe: "Dinner + performers + dancing",
    lat: 25.7908,
    lng: -80.1301,
    weekly: [{
      days: ["fri", "sat"],
      title: "Dinner + performers + dancing",
      notes: "Loud, theatrical Colombian night — reserve",
    }],
    body: `**Area:** Miami Beach  
Performative dinner with dancing — high energy if Faena feels too polished.`,
  },
  {
    file: "Jazz at The Betsy.md",
    title: "Jazz @ The Betsy",
    themes: ["jazz", "food"],
    excerpt: "Sat 11 AM–4 PM — daytime live jazz + cocktails in South Beach.",
    area: "South Beach",
    vibe: "Daytime live jazz + cocktails",
    lat: 25.7883,
    lng: -80.1298,
    weekly: [{
      days: ["sat"],
      time: "11:00 AM – 4:00 PM",
      title: "Daytime jazz",
      notes: "Strong Saturday-before-boat pick — beautiful hotel setting",
    }],
    body: `**Area:** South Beach  
**When:** Saturday **11 AM – 4 PM**

Daytime cultural jazz in a beautiful hotel — top Saturday afternoon shortlist pick.`,
  },
  {
    file: "Float On Mayfair House.md",
    title: "Float On! @ Mayfair House",
    themes: ["nightlife"],
    excerpt: "Sat 12–6 PM — boutique rooftop pool party in Coconut Grove.",
    area: "Coconut Grove",
    vibe: "Boutique rooftop pool party",
    lat: 25.7274,
    lng: -80.2402,
    weekly: [{
      days: ["sat"],
      time: "12:00 PM – 6:00 PM",
      title: "Float On!",
      notes: "This Saturday pool day — confirm tickets / guest list",
      cadence: "monthly",
    }],
    body: `**Area:** Coconut Grove  
**When:** Saturday **12–6 PM**

Boutique rooftop pool party — strong Saturday-before-boat option.`,
  },
  {
    file: "Novo Flow Novotel.md",
    title: "Novo Flow @ Novotel",
    themes: ["nightlife", "dance"],
    excerpt: "Sat 1–7 PM Brickell — house + live sax + pool + dancing.",
    area: "Brickell",
    vibe: "House + live sax + pool + dancing",
    lat: 25.7615,
    lng: -80.1918,
    weekly: [{
      days: ["sat"],
      time: "1:00 PM – 7:00 PM",
      title: "Novo Flow",
      notes: "This Saturday — pool / house day party",
      cadence: "monthly",
    }],
    body: `**Area:** Brickell  
**When:** Saturday **1–7 PM**`,
  },
  {
    file: "STAMPED Arlo Wynwood.md",
    title: "STAMPED @ Arlo Wynwood",
    themes: ["nightlife"],
    excerpt: "Sat 4–11 PM — rooftop pool + Afrobeats/amapiano in Wynwood.",
    area: "Wynwood",
    vibe: "Rooftop pool + Afrobeats / amapiano",
    lat: 25.8012,
    lng: -80.1991,
    weekly: [{
      days: ["sat"],
      time: "4:00 PM – 11:00 PM",
      title: "STAMPED",
      notes: "This Saturday — later afternoon into night",
      cadence: "monthly",
    }],
    body: `**Area:** Wynwood  
**When:** Saturday **4–11 PM**`,
  },
  {
    file: "Andrew Music Club.md",
    title: "Andrew Music Club",
    themes: ["nightlife", "dance"],
    excerpt: "Sat 4 PM+ Wynwood — skate rave + electronic music.",
    area: "Wynwood",
    vibe: "Skate rave + electronic",
    lat: 25.8018,
    lng: -80.2005,
    weekly: [{
      days: ["sat"],
      time: "4:00 PM+",
      title: "Skate rave",
      notes: "Jumps near the top if you have until later afternoon",
    }],
    body: `**Area:** Wynwood  
**When:** Saturday **4 PM+**

Skate rave + electronic — prioritize if Saturday afternoon is free until later.`,
  },
  {
    file: "Macs Club Deuce 100th.md",
    title: "Mac's Club Deuce 100th Anniversary",
    themes: ["nightlife", "historic"],
    excerpt: "Sat 4 PM+ — historic South Beach block party for Deuce’s 100th.",
    area: "South Beach",
    vibe: "Historic block party",
    lat: 25.7808,
    lng: -80.1312,
    weekly: [{
      days: ["sat"],
      time: "4:00 PM+",
      title: "100th Anniversary block party",
      notes: "This Saturday special — street / bar celebration",
      cadence: "monthly",
    }],
    body: `**Area:** South Beach  
**When:** Saturday **4 PM+** (this weekend anniversary)`,
  },
  {
    file: "Viva Brazil Bandshell.md",
    title: "Viva Brazil @ Miami Beach Bandshell",
    themes: ["dance", "jazz"],
    excerpt: "Sat 6 PM+ North Beach — samba, forró, capoeira + film. Top cultural Sat evening pick.",
    area: "North Beach",
    vibe: "Samba + forró + capoeira + film",
    lat: 25.8675,
    lng: -80.1212,
    weekly: [{
      days: ["sat"],
      time: "6:00 PM+",
      title: "Viva Brazil",
      notes: "Prioritize if Saturday evening unexpectedly frees up",
      cadence: "monthly",
    }],
    body: `**Area:** North Beach (Miami Beach Bandshell)  
**When:** Saturday **6 PM+**

Outdoor cultural performance — the Saturday evening cultural priority if plans open up.`,
  },
  {
    file: "Casa Juancho.md",
    title: "Casa Juancho",
    kind: "eats",
    themes: ["food", "dance"],
    excerpt: "Sat evening — Spanish dinner + flamenco.",
    area: "Miami",
    vibe: "Spanish dinner + flamenco",
    lat: 25.7728,
    lng: -80.2145,
    weekly: [{
      days: ["sat"],
      title: "Flamenco dinner",
      notes: "Confirm flamenco seating / show time",
    }],
    body: `**Area:** Miami  
Spanish dinner + flamenco — cultural Saturday evening lane.`,
  },
  {
    file: "La Taberna Giralda.md",
    title: "La Taberna Giralda",
    kind: "eats",
    themes: ["food", "dance"],
    excerpt: "Sat evening Coral Gables — intimate flamenco + tapas.",
    area: "Coral Gables",
    vibe: "Intimate flamenco + tapas",
    lat: 25.7502,
    lng: -80.2578,
    weekly: [{
      days: ["sat"],
      title: "Flamenco + tapas",
      notes: "Smaller/intimate alternative to Casa Juancho",
    }],
    body: `**Area:** Coral Gables  
Intimate flamenco + tapas.`,
  },
  {
    file: "Factory Town.md",
    title: "Factory Town — ISOxo + Brutalismus 3000",
    themes: ["nightlife"],
    excerpt: "Sat night Hialeah rave — ISOxo + Brutalismus 3000.",
    area: "Hialeah",
    vibe: "Rave / electronic",
    lat: 25.857,
    lng: -80.292,
    cat: "Day Trip",
    weekly: [{
      days: ["sat"],
      title: "ISOxo + Brutalismus 3000",
      notes: "This Saturday lineup — tickets required",
      cadence: "monthly",
    }],
    body: `**Area:** Hialeah  
**When:** Saturday night — this weekend’s big electronic bill.`,
  },
  {
    file: "Club Space.md",
    title: "Club Space",
    themes: ["nightlife"],
    excerpt: "Sat night Downtown — house / underground electronic.",
    area: "Downtown",
    vibe: "House / underground electronic",
    lat: 25.7841,
    lng: -80.1935,
    weekly: [{
      days: ["sat"],
      title: "House / underground night",
      notes: "Check lineup & open hours — often late",
    }],
    body: `**Area:** Downtown Miami  
Classic underground house lane.`,
  },
  {
    file: "ZeyZey.md",
    title: "ZeyZey",
    themes: ["nightlife", "food"],
    excerpt: "Sat night Little River — outdoor music + cocktails.",
    area: "Little River",
    vibe: "Outdoor music + cocktails",
    lat: 25.8465,
    lng: -80.1915,
    weekly: [{
      days: ["sat"],
      title: "Outdoor music + cocktails",
      notes: "Lower-key outdoor night vs LIV / Space",
    }],
    body: `**Area:** Little River`,
  },
  {
    file: "Disco Lines LIV.md",
    title: "Disco Lines @ LIV",
    themes: ["nightlife"],
    excerpt: "Sat night Miami Beach — Disco Lines at LIV (big club night).",
    area: "Miami Beach",
    vibe: "Big Miami club night",
    lat: 25.8185,
    lng: -80.122,
    weekly: [{
      days: ["sat"],
      title: "Disco Lines @ LIV",
      notes: "This Saturday guest — guest list / tickets",
      cadence: "monthly",
    }],
    body: `**Area:** Miami Beach (Fontainebleau / LIV)  
Big-room club night.`,
  },
];

const daytime: Stop[] = [
  {
    file: "Crandon Golf.md",
    title: "Crandon Golf",
    themes: ["photo"],
    excerpt: "Key Biscayne — most scenic / unique Miami golf.",
    area: "Key Biscayne",
    vibe: "Scenic golf",
    lat: 25.7155,
    lng: -80.1565,
    cat: "Nearby",
    weekly: [{ days: ["sat"], title: "Tee time", notes: "Book ahead — scenic Key Biscayne" }],
    body: `**Area:** Key Biscayne — most scenic/unique golf option on the shortlist.`,
  },
  {
    file: "Miami Beach Golf Club.md",
    title: "Miami Beach Golf Club",
    themes: ["photo"],
    excerpt: "Miami Beach golf — great location + beautiful course.",
    area: "Miami Beach",
    vibe: "Golf",
    lat: 25.8065,
    lng: -80.1375,
    weekly: [{ days: ["sat"], title: "Tee time", notes: "Book ahead" }],
    body: `**Area:** Miami Beach`,
  },
  {
    file: "Normandy Shores Golf.md",
    title: "Normandy Shores Golf",
    themes: ["photo"],
    excerpt: "North Beach island course + water views.",
    area: "North Beach",
    vibe: "Island golf + water views",
    lat: 25.861,
    lng: -80.134,
    weekly: [{ days: ["sat"], title: "Tee time" }],
    body: `**Area:** North Beach`,
  },
  {
    file: "Granada Golf.md",
    title: "Granada Golf",
    themes: ["historic"],
    excerpt: "Coral Gables — easy historic 9-hole option.",
    area: "Coral Gables",
    vibe: "Historic 9-hole",
    lat: 25.748,
    lng: -80.268,
    weekly: [{ days: ["sat"], title: "9-hole round", notes: "Easy daytime option" }],
    body: `**Area:** Coral Gables`,
  },
  {
    file: "Vizcaya.md",
    title: "Vizcaya Museum & Gardens",
    themes: ["historic", "architecture", "photo"],
    excerpt: "Coconut Grove estate + gardens + bay — Saturday daytime classic.",
    area: "Coconut Grove",
    vibe: "Estate + gardens + bay",
    lat: 25.7444,
    lng: -80.2105,
    weekly: [{ days: ["sat"], title: "Day visit", notes: "Timed tickets — book ahead" }],
    body: `**Area:** Coconut Grove  
Beautiful estate + gardens + bay — strong non-party Saturday.`,
  },
  {
    file: "Pop Air Balloon Museum.md",
    title: "Pop Air / Balloon Museum",
    themes: ["photo"],
    excerpt: "Wynwood immersive art — final day Saturday (this weekend).",
    area: "Wynwood",
    vibe: "Immersive art",
    lat: 25.8015,
    lng: -80.1998,
    weekly: [{
      days: ["sat"],
      title: "Final day (this weekend)",
      notes: "Closing Saturday — go if you still haven’t seen it",
      cadence: "monthly",
    }],
    body: `**Area:** Wynwood  
Immersive balloon / Pop Air museum — **final day Saturday** this weekend.`,
  },
  {
    file: "Little Havana Walk.md",
    title: "Little Havana (Calle Ocho)",
    themes: ["food", "markets", "historic"],
    excerpt: "Cafecito + food + culture walk — anytime daytime.",
    area: "Little Havana",
    vibe: "Cafecito + food + culture",
    lat: 25.7658,
    lng: -80.2205,
    weekly: [{ days: ["fri", "sat"], title: "Calle Ocho wander", notes: "Cafecito, food, street culture" }],
    body: `**Area:** Calle Ocho — cafecito, food, and culture wandering.`,
  },
  {
    file: "Coconut Grove Market.md",
    title: "Coconut Grove Market",
    themes: ["markets", "food"],
    excerpt: "Food + tropical produce + wandering in the Grove.",
    area: "Coconut Grove",
    vibe: "Market wander",
    lat: 25.7278,
    lng: -80.2425,
    weekly: [{ days: ["sat"], title: "Market day", notes: "Confirm market hours this Saturday" }],
    body: `**Area:** Coconut Grove`,
  },
  {
    file: "Deering Estate.md",
    title: "Deering Estate",
    themes: ["historic", "photo"],
    excerpt: "Palmetto Bay historic waterfront estate.",
    area: "Palmetto Bay",
    vibe: "Historic waterfront estate",
    lat: 25.6195,
    lng: -80.3055,
    cat: "Day Trip",
    weekly: [{ days: ["sat"], title: "Day visit" }],
    body: `**Area:** Palmetto Bay`,
  },
  {
    file: "South Pointe Walk.md",
    title: "South Pointe",
    themes: ["photo"],
    excerpt: "South Beach — beautiful morning walk.",
    area: "Miami Beach",
    vibe: "Morning walk",
    lat: 25.7645,
    lng: -80.1325,
    weekly: [{ days: ["sat"], time: "Morning", title: "South Pointe walk" }],
    body: `**Area:** South Beach — morning walk before heat / boat.`,
  },
  {
    file: "Wynwood Walls.md",
    title: "Wynwood murals",
    themes: ["photo"],
    excerpt: "Wynwood street art / murals daytime wander.",
    area: "Wynwood",
    vibe: "Murals / street art",
    lat: 25.801,
    lng: -80.1995,
    weekly: [{ days: ["sat"], title: "Murals wander" }],
    body: `**Area:** Wynwood`,
  },
  {
    file: "Gold Coast Railroad Museum.md",
    title: "Gold Coast Railroad Museum",
    themes: ["historic"],
    excerpt: "South Miami — Free First Saturday + makers market.",
    area: "South Miami",
    vibe: "Free First Saturday + makers market",
    lat: 25.6455,
    lng: -80.4075,
    cat: "Day Trip",
    weekly: [{
      days: ["sat"],
      title: "Free First Saturday + makers market",
      notes: "This Saturday is First Saturday — free entry window",
      cadence: "monthly",
    }],
    body: `**Area:** South Miami  
**Free First Saturday** + makers market — this weekend qualifies.`,
  },
  {
    file: "Miami Koi Show.md",
    title: "Miami Koi Show",
    themes: ["photo"],
    excerpt: "Random wildcard — Miami Koi Show this weekend.",
    area: "Miami",
    vibe: "Wildcard",
    lat: 25.7617,
    lng: -80.1918,
    weekly: [{
      days: ["sat"],
      title: "Koi Show",
      notes: "Confirm venue/hours — fun wildcard",
      cadence: "monthly",
    }],
    body: `Wildcard daytime option — confirm venue before you drive.`,
  },
  {
    file: "Urban Film Festival.md",
    title: "Urban Film Festival",
    themes: ["historic"],
    excerpt: "Overtown/Downtown — free independent film festival.",
    area: "Overtown / Downtown",
    vibe: "Free indie cinema",
    lat: 25.7848,
    lng: -80.1985,
    weekly: [{
      days: ["fri", "sat"],
      title: "Urban Film Festival screenings",
      notes: "Free independent film festival — check schedule",
      cadence: "monthly",
    }],
    body: `**Area:** Overtown / Downtown  
Free independent cinema — cultural daytime / evening lane.`,
  },
];

async function writeStop(s: Stop) {
  const themes = s.themes.map((t) => `  - ${t}`).join("\n");
  const primary = s.themes[0];
  await write(
    `${ROOT}${s.file}`,
    `---
title: ${JSON.stringify(s.title)}
kind: ${s.kind || "activity"}
themes:
${themes}
travel_category: ${s.cat || "In city"}
bucket_list: true
visit_time: evening–late
lat: ${s.lat}
lng: ${s.lng}
theme_excerpts:
  ${primary}: ${JSON.stringify(s.excerpt)}
weekly:
${weeklyYaml(s.weekly)}
---
${s.excerpt}

<!--more-->

### Details

${s.body}

- **Area:** ${s.area}
- **Vibe:** ${s.vibe}
`,
  );
}

for (const s of stops) await writeStop(s);
for (const s of daytime) await writeStop(s);

await write(
  `${ESS}Miami Weekend Shortlist.md`,
  `---
title: Miami weekend shortlist (Fri–Sat)
kind: reference
hub: miami
destination_slug: miami
country: USA
section: more
order: 1
---
Condensed **Fri 9/4–Sat 9/5** options so you can compare vibes. Live times also feed the [Miami hub calendar](/destinations/miami/).

## Best choices (if you cut everything)

### Friday night
- **Faena** — beautiful / upscale / performative (Pao → Living Room → Saxony; optional OBSESSION)
- **Cachita López @ Lyric Theater** — culturally special Cuban/Latin jazz
- **Café La Trova → Ball & Chain** — Cuban dinner, live music, dancing

### Saturday before the boat
- **Jazz @ The Betsy** (11 AM–4 PM)
- **Float On!** @ Mayfair House
- **Novo Flow** @ Novotel Brickell
- **Golf** (Crandon / Miami Beach / Normandy / Granada)
- **Vizcaya / Coconut Grove**
- If free until later afternoon: **Andrew Music Club** skate rave

### If Saturday evening opens up
Prioritize **Viva Brazil @ Miami Beach Bandshell**.

---

## Friday night shortlist

| Experience | Area | Vibe |
| --- | --- | --- |
| Faena — Pao → Living Room → Saxony | Miami Beach | Dinner + live music + Afro-house |
| Faena Theater — OBSESSION (8 / 10:30 PM) | Miami Beach | Cabaret / immersive |
| Cachita López Quartet @ Lyric (8 PM) | Overtown | Cuban/Latin jazz |
| Café La Trova × Fontainebleau (9–11:30 PM) | Miami Beach | Cuban musicians + cocktails |
| Café La Trova | Little Havana | Dinner + live Cuban music |
| Ball & Chain — Miami Boheme | Little Havana | Salsa/timba + dancing |
| Armstrong Jazz House | Coral Gables | Intimate jazz + dinner |
| Lagniappe | Midtown | Wine + food + jazz |
| Andrés Carne de Res | Miami Beach | Dinner + performers + dancing |

## Saturday shortlist

| When | Experience | Area |
| --- | --- | --- |
| 11 AM–4 PM | Jazz @ The Betsy | South Beach |
| 12–6 PM | Float On! @ Mayfair House | Coconut Grove |
| 1–7 PM | Novo Flow @ Novotel | Brickell |
| 4–11 PM | STAMPED @ Arlo Wynwood | Wynwood |
| 4 PM+ | Andrew Music Club | Wynwood |
| 4 PM+ | Mac’s Club Deuce 100th | South Beach |
| 6 PM+ | Viva Brazil @ Bandshell | North Beach |
| Evening | Casa Juancho / La Taberna Giralda | Miami / Gables |
| Night | Factory Town / Club Space / ZeyZey / Disco Lines @ LIV | Various |

## Daytime (non-party)

Golf (Crandon, Miami Beach, Normandy Shores, Granada) · Vizcaya · Pop Air / Balloon Museum (final Sat) · Little Havana · Coconut Grove Market · Deering Estate · South Pointe walk · Wynwood murals · Gold Coast Railroad Museum (Free First Saturday) · Miami Koi Show · Urban Film Festival.

## Cultural lane (remember for later)

Faena Theater · Lyric Theater · Miami Beach Bandshell · Café La Trova · Casa Juancho / Giralda flamenco · Urban Film Festival · The Betsy jazz · always check **SoundScape Park / New World Center** for WALLCAST, projections, and outdoor cinema.
`,
);

await write(
  `${ESS}Miami Cultural Experiences.md`,
  `---
title: Miami cultural experiences
kind: reference
hub: miami
destination_slug: miami
country: USA
section: more
order: 2
---
The flamenco / symphony / opera / SoundScape-type lane — worth remembering beyond any single weekend.

- **Faena Theater** — theatrical / cabaret
- **Historic Lyric Theater** — Latin jazz in a historic venue
- **Miami Beach Bandshell** — outdoor cultural performance
- **Café La Trova** — Cuban music / cocktail culture
- **Casa Juancho / La Taberna Giralda** — flamenco
- **Urban Film Festival** — independent cinema
- **The Betsy** — jazz in a beautiful hotel setting
- **SoundScape Park / New World Center** — WALLCAST concerts, projections, outdoor cinema when you’re in town
`,
);

console.log("Done seeding Miami weekend content.");
