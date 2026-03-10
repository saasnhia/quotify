import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import { checkRateLimit } from "@/lib/ratelimit";
import type Stripe from "stripe";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit check
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;
  const body = await request.json();
  const { share_token, deposit_percent } = body as {
    share_token: string;
    deposit_percent?: number;
  };

  if (!share_token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch quote by ID + verify share_token matches
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", id)
    .eq("share_token", share_token)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Allow payment for envoyé or signé quotes
  if (quote.status !== "envoyé" && quote.status !== "signé") {
    return NextResponse.json(
      { error: "Ce devis ne peut pas être payé dans son état actuel" },
      { status: 400 }
    );
  }

  // Validate deposit_percent if provided
  const validDepositPercents = [30, 50];
  const isDeposit =
    deposit_percent !== undefined &&
    validDepositPercents.includes(deposit_percent);

  // Gate acompte to Pro/Business — check quote owner's plan
  if (isDeposit) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", quote.user_id)
      .single();

    if (!ownerProfile || ownerProfile.subscription_status === "free") {
      return NextResponse.json(
        {
          error: "PLAN_REQUIRED",
          message: "Acompte Stripe — Pro requis",
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }
  }

  const stripe = getStripe();
  const appUrl = getSiteUrl();
  const stripeCurrency = (quote.currency || "EUR").toLowerCase();

  if (isDeposit) {
    // Deposit: single line item for the acompte amount
    const depositAmount = Math.round(
      Number(quote.total_ttc) * (deposit_percent / 100) * 100
    );

    const lineItems = [
      {
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `Acompte ${deposit_percent}% — ${quote.title || "Devis"}`,
          },
          unit_amount: depositAmount,
        },
        quantity: 1,
      },
    ];

    // Check if owner has Stripe Connect
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_connect_status")
      .eq("id", quote.user_id)
      .single();

    const hasConnect =
      profile?.stripe_account_id &&
      profile.stripe_connect_status === "connected";

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/devis/${share_token}?paid=deposit`,
      cancel_url: `${appUrl}/devis/${share_token}`,
      metadata: {
        quote_id: quote.id,
        devizly_payment: "true",
        deposit_percent: String(deposit_percent),
      },
      payment_intent_data: {
        metadata: {
          quote_id: quote.id,
          deposit_percent: String(deposit_percent),
        },
      },
    };

    if (quote.clients?.email) {
      sessionConfig.customer_email = quote.clients.email;
    }

    const session = hasConnect
      ? await stripe.checkout.sessions.create(sessionConfig, {
          stripeAccount: profile!.stripe_account_id!,
        })
      : await stripe.checkout.sessions.create(sessionConfig);

    // Save deposit info
    await supabase
      .from("quotes")
      .update({
        stripe_checkout_session: session.id,
        deposit_percent: deposit_percent,
      })
      .eq("id", quote.id);

    return NextResponse.json({ url: session.url });
  }

  // Full payment flow
  // Build line items from quote
  const items = (quote.quote_items || []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );

  const lineItems = items.map((item: { description: string; total: number }) => ({
    price_data: {
      currency: stripeCurrency,
      product_data: {
        name: item.description,
      },
      unit_amount: Math.round(Number(item.total) * 100),
    },
    quantity: 1,
  }));

  // Add TVA as a separate line if applicable
  const tvaAmount = Number(quote.total_ttc) - Number(quote.total_ht);
  if (tvaAmount > 0) {
    lineItems.push({
      price_data: {
        currency: stripeCurrency,
        product_data: {
          name: `TVA (${Number(quote.tva_rate)}%)`,
        },
        unit_amount: Math.round(tvaAmount * 100),
      },
      quantity: 1,
    });
  }

  // Check if owner has Stripe Connect
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_status")
    .eq("id", quote.user_id)
    .single();

  const hasConnect =
    profile?.stripe_account_id && profile.stripe_connect_status === "connected";

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${appUrl}/devis/${share_token}?paid=true`,
    cancel_url: `${appUrl}/devis/${share_token}`,
    metadata: {
      quote_id: quote.id,
      devizly_payment: "true",
    },
    payment_intent_data: {
      metadata: {
        quote_id: quote.id,
      },
    },
  };

  // Add customer email if available
  if (quote.clients?.email) {
    sessionConfig.customer_email = quote.clients.email;
  }

  // Create session — on connected account if available, otherwise platform
  const session = hasConnect
    ? await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: profile!.stripe_account_id!,
      })
    : await stripe.checkout.sessions.create(sessionConfig);

  // Save session ID
  await supabase
    .from("quotes")
    .update({ stripe_checkout_session: session.id })
    .eq("id", quote.id);

  return NextResponse.json({ url: session.url });
}
