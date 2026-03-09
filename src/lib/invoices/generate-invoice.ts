import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import type Stripe from "stripe";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function computeNextDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

interface GenerateInvoiceResult {
  invoice: {
    id: string;
    invoice_number: string;
    amount: number;
    due_date: string;
    stripe_checkout_url: string | null;
    status: string;
  };
  clientEmail: string | null;
  clientName: string;
  currency: string;
}

/**
 * Generate an invoice from a recurring quote.
 * 1. Fetch quote + client + items
 * 2. Generate sequential invoice number (INV-YYYY-NNN per user)
 * 3. Create Stripe Checkout Session (one-time payment)
 * 4. INSERT invoice
 * 5. Update recurring_next_date + recurring_invoice_count
 */
export async function generateInvoice(
  quoteId: string,
  userId: string
): Promise<GenerateInvoiceResult> {
  const supabase = createServiceClient();

  // 1. Fetch quote + client + items
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", quoteId)
    .eq("user_id", userId)
    .single();

  if (quoteError || !quote) {
    throw new Error("Devis introuvable");
  }

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;
  const clientName = client?.name || "Client";
  const clientEmail = client?.email || null;

  // 2. Generate sequential invoice number: INV-YYYY-NNN (per user)
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`);

  const seq = (count || 0) + 1;
  const invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;

  // 3. Due date = today + 30 days
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  // 4. Create Stripe Checkout Session
  let stripeCheckoutUrl: string | null = null;
  const stripe = getStripe();
  const appUrl = getSiteUrl();

  const items = (quote.quote_items || []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );

  const stripeCurrency = (quote.currency || "EUR").toLowerCase();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item: { description: string; total: number }) => ({
      price_data: {
        currency: stripeCurrency,
        product_data: { name: item.description },
        unit_amount: Math.round(Number(item.total) * 100),
      },
      quantity: 1,
    })
  );

  // Add TVA line if applicable
  const tvaAmount = Number(quote.total_ttc) - Number(quote.total_ht);
  if (tvaAmount > 0) {
    lineItems.push({
      price_data: {
        currency: stripeCurrency,
        product_data: { name: `TVA (${Number(quote.tva_rate)}%)` },
        unit_amount: Math.round(tvaAmount * 100),
      },
      quantity: 1,
    });
  }

  // Check Stripe Connect
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_status")
    .eq("id", userId)
    .single();

  const hasConnect =
    profile?.stripe_account_id && profile.stripe_connect_status === "connected";

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/dashboard/factures?paid=${invoiceNumber}`,
      cancel_url: `${appUrl}/dashboard/factures`,
      metadata: {
        invoice_payment: "true",
        quote_id: quoteId,
        invoice_number: invoiceNumber,
      },
      payment_intent_data: {
        metadata: { quote_id: quoteId, invoice_number: invoiceNumber },
      },
    };

    if (clientEmail) {
      sessionConfig.customer_email = clientEmail;
    }

    const session = hasConnect
      ? await stripe.checkout.sessions.create(sessionConfig, {
          stripeAccount: profile!.stripe_account_id!,
        })
      : await stripe.checkout.sessions.create(sessionConfig);

    stripeCheckoutUrl = session.url;
  } catch (stripeErr) {
    // CRITICAL: If Stripe fails, throw — do NOT update recurring_next_date
    console.error("[Invoice] Stripe checkout creation failed:", stripeErr);
    throw new Error("Erreur Stripe lors de la création du paiement");
  }

  // 5. INSERT invoice
  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      quote_id: quoteId,
      client_id: quote.client_id,
      invoice_number: invoiceNumber,
      amount: Number(quote.total_ttc),
      currency: quote.currency || "EUR",
      status: "draft",
      due_date: dueDateStr,
      stripe_checkout_url: stripeCheckoutUrl,
    })
    .select("id, invoice_number, amount, due_date, stripe_checkout_url, status")
    .single();

  if (insertError || !invoice) {
    throw new Error("Erreur insertion facture");
  }

  // 6. Update recurring_next_date + recurring_invoice_count
  if (quote.is_recurring && quote.recurring_frequency) {
    const currentNext = quote.recurring_next_date
      ? new Date(quote.recurring_next_date)
      : new Date();
    const nextDate = computeNextDate(currentNext, quote.recurring_frequency);

    await supabase
      .from("quotes")
      .update({
        recurring_next_date: nextDate.toISOString().split("T")[0],
        recurring_invoice_count: (quote.recurring_invoice_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);
  }

  return {
    invoice,
    clientEmail,
    clientName,
    currency: quote.currency || "EUR",
  };
}
