import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { tryAutoInvoice } from "@/lib/invoices/auto-invoice";
import type Stripe from "stripe";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function planFromPriceId(priceId: string): "pro" | "business" | "free" {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return "free";
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Invoice payment
      if (session.metadata?.invoice_payment === "true") {
        const invoiceNumber = session.metadata.invoice_number;
        if (invoiceNumber) {
          await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: (session.payment_intent as string) || null,
            })
            .eq("invoice_number", invoiceNumber);
        }
        break;
      }

      // Connect payment for a quote
      if (session.metadata?.devizly_payment === "true") {
        const quoteId = session.metadata.quote_id;
        if (quoteId) {
          // Fetch user_id before update (needed for auto-invoice)
          const { data: quoteData } = await supabase
            .from("quotes")
            .select("user_id")
            .eq("id", quoteId)
            .single();

          await supabase
            .from("quotes")
            .update({
              status: "payé",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: (session.payment_intent as string) || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", quoteId);

          // Automation: auto-generate paid invoice receipt (non-blocking)
          if (quoteData?.user_id) {
            tryAutoInvoice("payment", {
              quoteId,
              userId: quoteData.user_id,
              markAsPaid: true,
            });
          }
        }
        break;
      }

      // Subscription checkout
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !session.subscription) break;

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price?.id || "";
      const plan = planFromPriceId(priceId);

      await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price?.id || "";
      const plan = subscription.status === "active"
        ? planFromPriceId(priceId)
        : "free";

      await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_id: null,
          devis_used: 0,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
