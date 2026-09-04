export default function* ({ search, canonicalRedirects = [] }) {
  const seen = new Set();

  for (const { from, to } of canonicalRedirects) {
    if (!from || !to || from === to || seen.has(from)) continue;
    seen.add(from);
    yield {
      url: from,
      layout: "layouts/redirect.vto",
      redirectTo: to,
      title: "Redirecting…",
      extra_head: [
        `<meta http-equiv="refresh" content="0; url=${to}">`,
        `<link rel="canonical" href="${to}">`,
      ],
    };
  }

  // Content merges: pages with redirect_to: in frontmatter
  for (const page of search.pages() || []) {
    const to = page.redirect_to || page.redirectTo;
    const from = page.url;
    if (!to || !from || from === to || seen.has(from)) continue;
    // Page already renders as redirect layout — skip duplicate yield
    if (String(page.layout || "").includes("redirect")) continue;
    seen.add(from);
    yield {
      url: from,
      layout: "layouts/redirect.vto",
      redirectTo: to,
      title: "Redirecting…",
      extra_head: [
        `<meta http-equiv="refresh" content="0; url=${to}">`,
        `<link rel="canonical" href="${to}">`,
      ],
    };
  }
}
