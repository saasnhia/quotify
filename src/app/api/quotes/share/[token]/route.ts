import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
  _request: Request,
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

  return NextResponse.json({ success: true, data: quote });
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
    .select("id, status")
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

  return NextResponse.json({ success: true, status: action });
}
