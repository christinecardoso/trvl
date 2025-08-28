export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  const activities = search.pages("kind=activity", "title=asc");

  for (const data of paginate(activities, { url, size: 15 })) {
     if (data.pagination.page === 1) {
      data.menu = { visible: true, order: 1 };
    }
   
    yield {
      ...data,
      title: "Things to Do",
      archiveType: "activity",
    };
  }
}

function url(n) {
  if (n === 1) return "/activities/";
  return `/activities/${n}/`;
}
