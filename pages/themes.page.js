const themes = JSON.parse(
  await Deno.readTextFile("./_data/themes.json"),
);

export const layout = "layouts/archive.vto";

export default function* ({ search, paginate }) {
  for (const theme of themes) {
    const items = search.pages(theme.query);

    // Paginate, even if it's just 1 page
    for (const data of paginate(items, {
      size: 12,
      url: (n) =>
        n === 1
          ? `/themes/${theme.slug}/`
          : `/themes/${theme.slug}/${n}/`,
    })) {
      yield {
        ...data,
        title: theme.title,
        description: theme.description,
        archiveType: "theme",
        theme,
      };
    }
  }
}
