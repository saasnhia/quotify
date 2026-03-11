import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoice } from "@/lib/invoices/generate-invoice";
import type { PlanId } from "@/lib/stripe";

/**
 * POST /api/invoices/generate
 * Generate an invoice from a signed/paid quote.
 * Body: { quoteId: string }
 * Gated to Pro/Business.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { quoteId } = await request.json();

  if (!quoteId) {
    return NextResponse.json({ error: "quoteId requis" }, { status: 400 });
  }

  // Verify ownership
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, status, user_id")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Only signed/paid/accepted quotes can generate invoices
  if (!["signé", "accepté", "payé"].includes(quote.status)) {
    return NextResponse.json(
      { error: "Le devis doit être signé ou payé pour générer une facture" },
      { status: 400 }
    );
  }

  // Gate to Pro/Business
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_status || "free") as PlanId;
  if (plan === "free") {
    return NextResponse.json(
      {
        error: "PLAN_REQUIRED",
        message: "Facturation — Pro requis",
        upgradeUrl: "/pricing",
      },
      { status: 403 }
    );
  }

  // Check for existing invoice to avoid duplicates
  const { data: existing } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("quote_id", quoteId)
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Une facture existe déjà pour ce devis", invoice: existing },
      { status: 409 }
    );
  }

  try {
    const result = await generateInvoice(quoteId, user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur génération facture";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
