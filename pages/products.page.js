// products.page.js
// const text = await Deno.readTextFile("./_data/products.json");
// const products = JSON.parse(text);

export default function* (site) {
  const products = site.products || [];
 
   console.log("Single Generator sees:", products.length);

  for (const product of products) {
    yield {
      slug: `${product.name}`,
      url: `/products/${product.name}/`,
      title: product.name,
      type: "product",
      description: product.description,
      price: product.price,
      image: product.image,
      layout: "layouts/product.vto",
      ...product,
    };
  }
}

