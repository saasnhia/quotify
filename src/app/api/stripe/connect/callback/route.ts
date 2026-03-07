import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!accountId) {
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error`);
  }

  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  // Check account status on Stripe
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const isReady =
    account.charges_enabled && account.payouts_enabled;

  // Update profile with Connect status
  const service = createServiceClient();
  await service
    .from("profiles")
    .update({
      stripe_account_id: accountId,
      stripe_connect_status: isReady ? "connected" : "pending",
    })
    .eq("id", user.id);

  return NextResponse.redirect(
    `${appUrl}/parametres?stripe=${isReady ? "success" : "pending"}`
  );
}
