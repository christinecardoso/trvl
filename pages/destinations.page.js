export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  const destinations = search.pages("kind=destination isBase=true", "title=asc");

  for (const data of paginate(destinations, { size: 12, url })) {
    if (data.pagination.page === 1) {
      data.menu = { visible: true, order: 0 };
    }

    yield {
      ...data,
      title: "Destinations",
      archiveType: "destination",
      search,

    };
  }
}

function url(n) {
  if (n === 1) {
    return "/destinations/";
  }
  return `/destinations/${n}/`;
}
