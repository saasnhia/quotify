import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { tryAutoInvoice } from "@/lib/invoices/auto-invoice";
import { createNotification } from "@/lib/notifications/create";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";

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

    // eIDAS audit trail: IP, User-Agent, document hash
    const signerIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const signedUserAgent = request.headers.get("user-agent") || "unknown";
    updateData.signer_ip = signerIp;
    updateData.signed_user_agent = signedUserAgent;

    // SHA-256 hash of signature payload for document integrity
    const encoder = new TextEncoder();
    const data = encoder.encode(`${quote.id}:${signer_name.trim()}:${now}:${signature_data}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const documentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    updateData.document_hash = documentHash;
    updateData.document_hash_algorithm = "SHA-256";
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

    // Confirmation emails to both parties (non-blocking)
    (async () => {
      try {
        const { data: fullQuote } = await supabase
          .from("quotes")
          .select("id, number, title, total_ttc, client_id, clients(name, email)")
          .eq("id", quote.id)
          .single();
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, company_name")
          .eq("id", quote.user_id)
          .single();
        if (!fullQuote) return;

        const quoteRef = `DEV-${String(fullQuote.number).padStart(4, "0")}`;
        const client = fullQuote.clients as unknown as { name: string; email: string | null } | null;
        const appUrl = getSiteUrl();
        const companyName = profile?.company_name || "Le prestataire";

        // Email to client: signature confirmation
        if (client?.email) {
          resend.emails.send({
            from: "Devizly <noreply@devizly.fr>",
            to: client.email,
            subject: `Signature confirmée — ${quoteRef}`,
            html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#6366F1;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${client.name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Votre signature du devis <strong>${quoteRef} — ${fullQuote.title}</strong> a bien été enregistrée.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        <strong>${companyName}</strong> a été notifié et reviendra vers vous pour la suite du projet.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${appUrl}/devis/${token}" style="display:inline-block;background:#6366F1;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Revoir le devis signé</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
      <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
    </td></tr>
  </table>
</body>
</html>`,
          }).then(() => {});
        }

        // Email to freelance: client signed
        if (profile?.email) {
          const clientName = client?.name ?? "Votre client";
          resend.emails.send({
            from: "Devizly <noreply@devizly.fr>",
            to: profile.email,
            subject: `${clientName} a signé le devis ${quoteRef}`,
            html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#22C55E;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonne nouvelle !</p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        <strong>${clientName}</strong> a signé le devis <strong>${quoteRef} — ${fullQuote.title}</strong> d'un montant de <strong>${Number(fullQuote.total_ttc).toFixed(2)} €</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Vous pouvez maintenant passer à l'étape suivante de votre projet.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${appUrl}/devis" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Voir mes devis</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
      <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
    </td></tr>
  </table>
</body>
</html>`,
          }).then(() => {});
        }
      } catch { /* non-blocking */ }
    })();
  }

  return NextResponse.json({ success: true, status: action });
}
