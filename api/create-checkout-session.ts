// api/create-checkout-session.ts
import Stripe from "https://esm.sh/stripe?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

export default async (req: Request) => {
  try {
    const formData = await req.formData();
    const variantId = formData.get("variantId") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 1;

    // Load product data from your generated JSON
    const { products } = JSON.parse(
      await Deno.readTextFile("./_data/products.json"),
    );

    const variant = products
      .flatMap((p: any) => p.variants)
      .find((v: any) => v.id.toString() === variantId);

    if (!variant) {
      return new Response("Variant not found", { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (variant.currency || "USD").toLowerCase(),
            product_data: {
              name: variant.name,
              images: [variant.image],
            },
            unit_amount: Math.round(parseFloat(variant.retail_price) * 100),
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: "https://your-site.com/success",
      cancel_url: "https://your-site.com/cancel",

      // 👇 This is the critical piece
      metadata: {
        printful_variant_id: variantId,
        printful_quantity: quantity.toString(),
      },
    });

    return Response.redirect(session.url!, 303);
  } catch (err) {
    console.error("Stripe session error:", err);
    return new Response("Error creating checkout session", { status: 500 });
  }
};
