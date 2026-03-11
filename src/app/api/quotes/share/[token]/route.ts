import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { tryAutoInvoice } from "@/lib/invoices/auto-invoice";
import { createNotification } from "@/lib/notifications/create";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const MAX_SIGNATURE_SIZE = 500_000; // 500KB

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("share_token", token)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Track views: set viewed_at on first view, always increment view_count
  const updates: Record<string, unknown> = {
    view_count: (quote.view_count || 0) + 1,
  };
  if (!quote.viewed_at) {
    updates.viewed_at = new Date().toISOString();
  }
  await supabase.from("quotes").update(updates).eq("id", quote.id);

  // Log detailed view (non-blocking)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  supabase
    .from("quote_views")
    .insert({ quote_id: quote.id, ip_address: ip, user_agent: ua })
    .then(() => {});

  // Fetch owner profile for calendly link + subscription status
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("calendly_url, subscription_status")
    .eq("id", quote.user_id)
    .single();

  const ownerPlan = ownerProfile?.subscription_status || "free";

  return NextResponse.json({
    success: true,
    data: quote,
    calendly_url: ownerPlan !== "free" ? (ownerProfile?.calendly_url || null) : null,
    owner_plan: ownerPlan,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const body = await request.json();
  const { action, signature_data, signer_name } = body;

  if (action !== "accepté" && action !== "refusé" && action !== "signé") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  // For signing, require signature data + signer name
  if (action === "signé") {
    if (!signature_data || !signer_name?.trim()) {
      return NextResponse.json(
        { error: "Signature et nom requis" },
        { status: 400 }
      );
    }
    if (typeof signature_data === "string" && signature_data.length > MAX_SIGNATURE_SIZE) {
      return NextResponse.json(
        { error: "Signature trop volumineuse (500KB max)" },
        { status: 400 }
      );
    }
    if (signer_name.trim().length > 200) {
      return NextResponse.json(
        { error: "Nom trop long (200 caracteres max)" },
        { status: 400 }
      );
    }
  }

  const { data: quote, error: findError } = await supabase
    .from("quotes")
    .select("id, status, user_id")
    .eq("share_token", token)
    .single();

  if (findError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (
    quote.status === "signé" ||
    quote.status === "accepté" ||
    quote.status === "refusé"
  ) {
    return NextResponse.json(
      { error: "Ce devis a déjà reçu une réponse" },
      { status: 400 }
    );
  }

  // Gate signature to Pro/Business — check quote owner's plan
  if (action === "signé") {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", quote.user_id)
      .single();

    if (!ownerProfile || ownerProfile.subscription_status === "free") {
      return NextResponse.json(
        {
          error: "PLAN_REQUIRED",
          message: "Signature électronique — Pro requis",
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }
  }

  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status: action,
    updated_at: now,
  };

  if (action === "signé") {
    updateData.signature_data = signature_data;
    updateData.signer_name = signer_name.trim();
    updateData.signed_at = now;
  }

  const { error: updateError } = await supabase
    .from("quotes")
    .update(updateData)
    .eq("id", quote.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Automation: auto-generate invoice on signature (non-blocking)
  if (action === "signé" && quote.user_id) {
    tryAutoInvoice("sign", { quoteId: quote.id, userId: quote.user_id });
  }

  // In-app notification on signature (non-blocking, fire-and-forget)
  if (action === "signé" && quote.user_id) {
    // Fetch quote title for the notification message
    supabase
      .from("quotes")
      .select("title, number")
      .eq("id", quote.id)
      .single()
      .then(({ data: quoteDetail }) => {
        const label = quoteDetail?.title
          ? quoteDetail.title
          : `Devis #${quoteDetail?.number ?? ""}`;
        createNotification({
          userId: quote.user_id,
          type: "signature",
          title: "Devis signé",
          message: label,
          link: "/devis",
        }).then(() => {});
      });
  }

  return NextResponse.json({ success: true, status: action });
}
