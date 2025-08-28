// api/webhook.ts
import Stripe from "https://esm.sh/stripe?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// Webhook handler
export default async (req: Request) => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    // ✅ Metadata set in create-checkout-session.ts
    const variantId = session.metadata.printful_variant_id;
    const quantity = parseInt(session.metadata.printful_quantity || "1");

    console.log("✅ Stripe session completed, creating Printful order", {
      variantId,
      quantity,
    });

    // ✅ Call Printful Orders API
    const res = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PRINTFUL_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          name: session.customer_details?.name || "Customer",
          email: session.customer_details?.email,
          // You probably also want address fields (Stripe has them under session.customer_details.address)
          address1: session.customer_details?.address?.line1,
          city: session.customer_details?.address?.city,
          country_code: session.customer_details?.address?.country,
          zip: session.customer_details?.address?.postal_code,
        },
        items: [
          {
            variant_id: parseInt(variantId),
            quantity,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Printful order failed:", errText);
      return new Response("Error placing order with Printful", { status: 500 });
    }

    const data = await res.json();
    console.log("✅ Printful order created:", data);
  }

  return new Response("ok");
};
