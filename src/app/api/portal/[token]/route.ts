import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * GET /api/portal/[token]
 * Public endpoint — returns client info + all their quotes.
 * The portal_token acts as authentication.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Find client by portal token
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, email, phone, address, city, postal_code, user_id")
    .eq("portal_token", token)
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: "Portail introuvable" },
      { status: 404 }
    );
  }

  // Get owner's company info (including brand color + email for contact)
  const { data: owner } = await supabase
    .from("profiles")
    .select("company_name, logo_url, brand_color, email")
    .eq("id", client.user_id)
    .single();

  // Fetch all quotes for this client (only sent/signed/paid — not drafts)
  const { data: quotes } = await supabase
    .from("quotes")
    .select(
      "id, number, title, total_ht, tva_rate, total_ttc, status, share_token, created_at, signed_at, paid_at"
    )
    .eq("client_id", client.id)
    .eq("user_id", client.user_id)
    .in("status", ["envoyé", "signé", "accepté", "payé"])
    .order("created_at", { ascending: false });

  // Compute summary
  const allQuotes = quotes || [];
  const totalPaid = allQuotes
    .filter((q) => q.status === "payé")
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);
  const totalPending = allQuotes
    .filter((q) => q.status === "envoyé" || q.status === "signé")
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  return NextResponse.json({
    client: {
      name: client.name,
      email: client.email,
    },
    company: {
      name: owner?.company_name || "Votre prestataire",
      logo_url: owner?.logo_url || null,
      brand_color: owner?.brand_color || "#8B5CF6",
      email: owner?.email || null,
    },
    quotes: allQuotes,
    summary: {
      total: allQuotes.length,
      paid: allQuotes.filter((q) => q.status === "payé").length,
      pending: allQuotes.filter(
        (q) => q.status === "envoyé" || q.status === "signé"
      ).length,
      totalPaid,
      totalPending,
    },
  });
}
