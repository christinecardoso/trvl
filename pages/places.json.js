export default function(site) {
  return site.pages
    .filter((p) => p.data.lat && p.data.lng)
    .map((p) => ({
      title: p.data.title,
      url: p.data.url,
      lat: p.data.lat,
      lng: p.data.lng,
      type: p.data.type,
      region: p.data.region,
      country: p.data.country,
    }));
}
