export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  const media = search.pages("kind=media", "title=asc");

  for (const data of paginate(media, { url, size: 20 })) {
    if (data.pagination.page === 1) {
      data.menu = { visible: false, order: 1 };
    }

    yield {
      ...data,
      title: "Photo Inspiration",
      archiveType: "media",
    };
  }
}
function url(n) {
  if (n === 1) return "/media/";
  return `/media/${n}/`;
}
