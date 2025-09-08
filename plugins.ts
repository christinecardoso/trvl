import baseBlog from "https://deno.land/x/lume_theme_simple_blog@v0.16.0/mod.ts";
import type { Options as BaseBlogOptions } from "https://deno.land/x/lume_theme_simple_blog@v0.16.0/mod.ts";
import favicon from "lume/plugins/favicon.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import relations from "lume/plugins/relations.ts";
import markdownItContainer from "npm:markdown-it-container@4.0.0";
import attrs from "npm:markdown-it-attrs@4.3.1";
import { wikilinksPlugin } from "./plugins/wikilinks.ts";
import wikilinks from "https://deno.land/x/lume_markdown_plugins/wikilinks.ts";
import slugify from "lume/plugins/slugify_urls.ts";
import transformImages from "lume/plugins/transform_images.ts";

import { merge } from "lume/core/utils/object.ts";


import "lume/types.ts";

export interface Options extends BaseBlogOptions {
  fonts?: {
    display?: string;
    text?: string;
  };
  colors?: {
    hue?: number;
    complement?: number;
    analogous?: number;
    sathi?: number;
    satmid?: number;
    satlo?: number;
    xlight?: number;
    lighter?: number;
    lightness?: number;
    midrange?: number;
    lowmid?: number;
    darkness?: number;
    darker?: number;
  };
}

export const defaults: Options = {
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
    },
    items: {
      title: "=title",
    },
  },
  fonts: {
    display: "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900",
    text:
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700",
  },
  colors: {
    // HSL hues
    // In CSS, an `<angle>` is periodic, `<hue>` is normalized to the range
    // [0deg, 360deg). It implicitly wraps around such that 480deg is the same
    // as 120deg, -120deg is the same as 240deg, -1turn is the same as 1turn,
    // and so on. Yet, here we pass an integer 1-359 for each of the
    // 3 hue values, to get type checking.
    hue: 172,
    complement: 351,
    analogous: 38,

    // color mixing values
    sathi: 94, // 80-100
    satmid: 54, // 50-70
    satlo: 20, // 10-30
    xlight: 92, // 84-92
    lighter: 83, // 76-84
    lightness: 65, // 64-72
    midrange: 54, // 48-64
    lowmid: 36, // 28-36
    darkness: 20, // 16-24
    darker: 9, // 0-12
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site.data("colorscheme", options.colors)
    .use(tailwindcss(/* Options */))
    .add("style.css") //Add the entry point
    .add("logo.png") //Add the entry point
    .use(wikilinks())
    .use(transformImages({
      // Only process raster images; leave SVGs alone so svg2png isn't invoked
      extensions: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
    }))
    .use(slugify({
      lowercase: true, // Converts all characters to lowercase
      alphanumeric: true, // Replace non-alphanumeric characters with their equivalent. Example: ñ to n.
      separator: "-", // Character used as separator for words
      stopWords: ["and", "or", "the"], // A list of words not included in the slug
    }))
    .use(relations({
      idKey: "slug",      // match by slug
      typeKey: "kind",    // use 'kind' instead of 'type'
      foreignKeys: {
        destination: {
          foreignKey: "destination_slug",
          relationKey: "destination",       // activity/post → single destination
          pluralRelationKey: "destinations",// reverse: destination → many activities/posts
          idKey: "slug",
        },
        activity: {
          foreignKey: ["activity_slug", "activity_slugs"],
          relationKey: "activity",          // post → single activity
          pluralRelationKey: "activities",  // reverse: activity → many posts
          idKey: "slug",
        },
        travelCategory: {
          foreignKey: ["travel_category"],   // the key inside each destination post
          idKey: "base",                     // how categories are uniquely identified
          relationKey: "travel_category",    // destination → single category
          pluralRelationKey: "travelCategories", // category → many destinations
        },
        post: {
          foreignKey: ["post_slug", "post_slugs"],
          relationKey: "post",              // activity/destination → single post
          pluralRelationKey: "posts",       // reverse: post → many related items
          idKey: "slug",
        },
        media: {
          foreignKey: ["media_slug", "media_slugs"],
          relationKey: "media",             // activity/destination → single gallery
          pluralRelationKey: "galleries",   // reverse: gallery → many related items
          idKey: "slug",
        },
      },
      log: true, // 👈 enable debug logging

    }));
    // lume.config.ts (or similar)
    // You can log here (not inside the object!)
    console.log("Relations plugin loaded ✅");
    for (const type of ["div", "tip", "warning", "info", "note"]) {
      site.hooks.addMarkdownItPlugin(markdownItContainer, type);
    }
    site.hooks.addMarkdownItPlugin(attrs); // for {.class} support
    site.hooks.addMarkdownItPlugin(wikilinksPlugin); // for {.class} support


// Search and replace the wikilinks with the final URLs
site.process([".html"], (pages) => {
  for (const page of pages) {
    // Search all wikilinks in the page
    for (const link of page.document!.querySelectorAll("a[data-wikilink]")) {
      // Get the link id and remove the attribute
      const id = link.getAttribute("data-wikilink");
      link.removeAttribute("data-wikilink");

      // Search a page with this id
      // const found = pages.find((p) => p.id === id);

      if (id) {
        link.setAttribute("href", `/${id}`);
      } else {
        link.setAttribute("title", "This page does not exist");
      }
    }
  }
});

    site.use(baseBlog(options))
      .use(favicon())
      .use(googleFonts({
        cssFile: "styles.css",
        placeholder: "/* google-fonts */",
        fonts: options.fonts,
      }))
        .preprocess([".md"], (pages) => {
      const wikilinkRegex = /\[\[([^\]]+)\]\]/g;

      for (const page of pages) {

        // id and slug on title
        const t = page.data.title as string;
        if (t) {
          // page.data.slug = t;
          page.data.id = slugify(`${t}-${page.src.path}`);
        }

        // Existing excerpt logic
        page.data.excerpt ??= (page.data.content as string).split(
          /<!--\s*more\s*-->/i,
        )[0];


        // Collect wikilinks
        const content = page.data.content as string;
        const matches = [...content.matchAll(wikilinkRegex)].map((m) => m[1]);

        if (matches.length) {
          // Deduplicate
          const uniqueLinks = [...new Set(matches)];
          page.data.outgoing_links = uniqueLinks;
        } else {
          page.data.outgoing_links = [];
        }
      }
    });
  };
}
