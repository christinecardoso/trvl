const text = await Deno.readTextFile("./_data/products.json");
const products = JSON.parse(text);

export const layout = "layouts/products-archive.vto";

export default function* ({ site, paginate, i18n }) {
  // const products = site.products || [];
  // const products = search.pages("type=product");

  console.log("Archive sees:", products.length);

  for (
    const data of paginate(products, { url, size: 12 })
  ) {
    // Show the first page in the menu
    if (data.pagination.page === 1) {
      data.menu = {
        visible: false,
        order: 1,
        title: "Products",
      };
    }

    yield {
      ...data,
      title: i18n.nav.prod_title,
      results: products
    };
  }
}

//   yield {
//     url: "/products/",
//     title: "Products Archive",
//     layout: "layouts/products-archive.vto",
//     results: products,
//   };
// }

function url(n) {
  return n === 1 ? "/products/" : `/products/${n}/`;
}
