import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { DevisPdf } from "@/lib/pdf/devis-template";
import type { DevisPdfProps } from "@/lib/pdf/devis-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Fetch quote (owner only)
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Fetch logo from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("logo_url, tva_number, is_micro_entrepreneur")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata || {};

  const items = (quote.quote_items || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position);

  const props: DevisPdfProps = {
    number: quote.number,
    title: quote.title,
    created_at: quote.created_at,
    valid_until: quote.valid_until,
    client: quote.clients,
    items,
    total_ht: Number(quote.total_ht),
    tva_rate: Number(quote.tva_rate),
    discount: Number(quote.discount),
    total_ttc: Number(quote.total_ttc),
    notes: quote.notes,
    status: quote.status,
    signature_data: quote.signature_data,
    signer_name: quote.signer_name,
    signed_at: quote.signed_at,
    company: {
      name: meta.company_name || undefined,
      address: meta.company_address || undefined,
      siret: meta.company_siret || undefined,
      phone: meta.company_phone || undefined,
      logo_url: profile?.logo_url || undefined,
      tva_number: meta.tva_number || profile?.tva_number || undefined,
      is_micro_entrepreneur: meta.is_micro_entrepreneur || profile?.is_micro_entrepreneur || undefined,
    },
    currency: quote.currency || "EUR",
  };

  const buffer = await renderToBuffer(<DevisPdf {...props} />);
  const bytes = new Uint8Array(buffer);

  const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;
  const filename = `${quoteRef}-${quote.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.pdf`;

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
