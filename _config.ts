import lume from "lume/mod.ts";
import blog from "./mod.ts";
import search from "lume/plugins/search.ts";

const site = lume();

site
  .use(blog())
  .use(search());  // 👈 required

// Load products for pagination
site.data("products", async () => {
  const file = await Deno.readTextFile("./_data/products.json");
  return JSON.parse(file);
});


export default site;
