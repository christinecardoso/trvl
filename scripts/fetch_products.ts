// scripts/fetch_products.ts
import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("PRINTFUL_API_KEY");

if (!API_KEY) {
  throw new Error("Missing PRINTFUL_API_KEY in .env");
}

async function fetchPrintful(endpoint: string) {
  const resp = await fetch(`https://api.printful.com/${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `Error fetching ${endpoint}: ${resp.status} ${resp.statusText} ${text}`,
    );
  }

  return resp.json();
}

async function main() {
  console.log("Fetching products from Printful…");

  // Fetch products in your store
  const data = await fetchPrintful("store/products");

  // Each "sync_product" is minimal; you might want to fetch variants in detail
  const products = await Promise.all(
    data.result.map(async (p: any) => {
      const detail = await fetchPrintful(`store/products/${p.id}`);
      return {
        id: detail.result.sync_product.id,
        name: detail.result.sync_product.name,
        thumbnail_url: detail.result.sync_product.thumbnail_url,
        variants: detail.result.sync_variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          retail_price: v.retail_price,
          image: v.product?.image,
          color: v.color,
          size: v.size,
        })),
      };
    }),
  );

  await Deno.writeTextFile(
    "./_data/products.json",
    JSON.stringify(products, null, 2),
  );

  console.log(`✅ Saved ${products.length} products to _data/products.json`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("❌ Error:", err.message);
    Deno.exit(1);
  });
}
