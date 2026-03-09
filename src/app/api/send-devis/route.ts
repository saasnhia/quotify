import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { devisEmail } from "@/lib/emails/devis";
import { getSiteUrl } from "@/lib/url";
import { checkRateLimit } from "@/lib/ratelimit";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { to, devis } = body as {
    to: string;
    devis: {
      id: string | number;
      client: string;
      montant: number;
      titre?: string;
      share_token?: string;
      stripe_url?: string;
      currency?: string;
    };
  };

  if (!to || !devis?.id || !devis?.client || !devis?.montant) {
    return NextResponse.json(
      { error: "Champs requis : to, devis.id, devis.client, devis.montant" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return NextResponse.json(
      { error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  // Get company name from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, full_name")
    .eq("id", user.id)
    .single();

  const companyName =
    profile?.company_name || profile?.full_name || "Votre prestataire";

  const appUrl = getSiteUrl();
  const quoteRef = `DEV-${String(devis.id).padStart(4, "0")}`;
  const totalTTC = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devis.currency || "EUR",
  }).format(devis.montant);

  const shareUrl = devis.share_token
    ? `${appUrl}/devis/${devis.share_token}`
    : undefined;

  const { subject, html } = devisEmail({
    clientName: devis.client,
    quoteRef,
    quoteTitle: devis.titre || "Devis",
    totalTTC,
    shareUrl: shareUrl || `${appUrl}/dashboard`,
    stripeUrl: devis.stripe_url,
    companyName,
  });

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[send-devis] Resend error:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }

  console.log(`[send-devis] Sent ${quoteRef} to ${to} — id: ${data?.id}`);

  return NextResponse.json({
    success: true,
    messageId: data?.id,
    to,
    quoteRef,
  });
}
