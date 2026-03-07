import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create a Stripe Connect Account Link (Express onboarding)
  // First, check if user already has a Connect account
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  let accountId = profile?.stripe_account_id;

  if (!accountId) {
    // Create a new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        supabase_user_id: user.id,
      },
    });
    accountId = account.id;

    // Save account ID immediately
    const { createServerClient } = await import("@supabase/ssr");
    const service = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    await service
      .from("profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", user.id);
  }

  // Create Account Link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect/authorize`,
    return_url: `${appUrl}/api/stripe/connect/callback?account_id=${accountId}`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
