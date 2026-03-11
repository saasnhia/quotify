import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/lib/pdf/invoice-template";
import type { InvoicePdfProps } from "@/lib/pdf/invoice-template";

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

  // Fetch invoice (owner only)
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, clients(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  // Fetch quote items if linked to a quote
  let items: { description: string; quantity: number; unit_price: number; total: number }[] = [];
  let tvaRate = 20;
  let totalHt = 0;
  let discount = 0;
  let notes: string | null = null;
  let quoteTitle = "Facture";

  if (invoice.quote_id) {
    const { data: quote } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", invoice.quote_id)
      .single();

    if (quote) {
      quoteTitle = quote.title || "Facture";
      tvaRate = Number(quote.tva_rate) || 20;
      totalHt = Number(quote.total_ht);
      discount = Number(quote.discount) || 0;
      notes = quote.notes;
      items = (quote.quote_items || [])
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total: Number(item.total),
        }));
    }
  }

  // Fetch logo from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("logo_url, tva_number, is_micro_entrepreneur")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata || {};

  const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;

  const props: InvoicePdfProps = {
    invoice_number: invoice.invoice_number,
    title: quoteTitle,
    created_at: invoice.created_at,
    due_date: invoice.due_date,
    client,
    items,
    total_ht: totalHt || Number(invoice.amount) / (1 + tvaRate / 100),
    tva_rate: tvaRate,
    discount,
    total_ttc: Number(invoice.amount),
    notes,
    status: invoice.status,
    paid_at: invoice.paid_at,
    company: {
      name: meta.company_name || undefined,
      address: meta.company_address || undefined,
      siret: meta.company_siret || undefined,
      phone: meta.company_phone || undefined,
      logo_url: profile?.logo_url || undefined,
      tva_number: meta.tva_number || profile?.tva_number || undefined,
      is_micro_entrepreneur: meta.is_micro_entrepreneur || profile?.is_micro_entrepreneur || undefined,
    },
    currency: invoice.currency || "EUR",
  };

  const buffer = await renderToBuffer(<InvoicePdf {...props} />);
  const bytes = new Uint8Array(buffer);

  const filename = `${invoice.invoice_number}-${quoteTitle.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.pdf`;

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
