import { createServerClient } from "@supabase/ssr";
import { generateInvoice } from "./generate-invoice";
import { resend } from "@/lib/resend";
import { invoiceEmail } from "@/lib/emails/invoice";
import { formatCurrency, formatDate } from "@/lib/utils/quote";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

interface AutoInvoiceOptions {
  quoteId: string;
  userId: string;
  /** If true, mark the invoice as paid immediately (used for payment webhook) */
  markAsPaid?: boolean;
}

/**
 * Auto-generate an invoice for a quote if the user's automation settings allow it.
 * Wrapped in try/catch — NEVER throws to the caller.
 * Returns the invoice id if created, null otherwise.
 */
export async function tryAutoInvoice(
  trigger: "sign" | "payment",
  options: AutoInvoiceOptions
): Promise<string | null> {
  const { quoteId, userId, markAsPaid } = options;

  try {
    const supabase = createServiceClient();

    // 1. Check user's automation preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("auto_invoice_on_sign, auto_invoice_on_payment, auto_send_invoice, company_name, full_name")
      .eq("id", userId)
      .single();

    if (!profile) return null;

    const isEnabled =
      trigger === "sign"
        ? profile.auto_invoice_on_sign
        : profile.auto_invoice_on_payment;

    if (!isEnabled) {
      return null;
    }

    // 2. Anti-doublon: check if an invoice already exists for this quote
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("quote_id", quoteId)
      .single();

    if (existingInvoice) {
      // Invoice already exists — if payment trigger, just mark as paid
      if (markAsPaid) {
        await supabase
          .from("invoices")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", existingInvoice.id);
      }
      return existingInvoice.id;
    }

    // 3. Generate invoice
    const result = await generateInvoice(quoteId, userId);

    // 4. If payment trigger, mark as paid immediately
    if (markAsPaid) {
      await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", result.invoice.id);
    }

    // 5. Auto-send email if enabled
    if (profile.auto_send_invoice && result.clientEmail && result.invoice.stripe_checkout_url) {
      const companyName =
        profile.company_name || profile.full_name || "Votre prestataire";

      const { subject, html } = invoiceEmail({
        clientName: result.clientName,
        invoiceNumber: result.invoice.invoice_number,
        quoteTitle: "", // Will be fetched inside generateInvoice context
        amount: formatCurrency(Number(result.invoice.amount), result.currency),
        dueDate: result.invoice.due_date
          ? formatDate(result.invoice.due_date)
          : "—",
        checkoutUrl: result.invoice.stripe_checkout_url,
        companyName,
      });

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: result.clientEmail,
        subject,
        html,
      });

      if (!sendError) {
        await supabase
          .from("invoices")
          .update({ status: markAsPaid ? "paid" : "sent" })
          .eq("id", result.invoice.id);
      } else {
        console.error("[Auto-invoice] Email send failed:", sendError);
      }
    }

    console.log(
      `[Auto-invoice] ${trigger}: Generated ${result.invoice.invoice_number} for quote ${quoteId}`
    );
    return result.invoice.id;
  } catch (err) {
    // CRITICAL: Never let automation errors propagate
    console.error(`[Auto-invoice] ${trigger} failed for quote ${quoteId}:`, err);
    return null;
  }
}
