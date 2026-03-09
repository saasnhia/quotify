import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { subject, body } = await request.json();

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json(
      { error: "Sujet et corps de l'email requis" },
      { status: 400 }
    );
  }

  // Fetch quote to verify ownership and get client email
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("id, title, number, share_token, clients(name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;
  const clientEmail = client?.email;
  if (!clientEmail) {
    return NextResponse.json(
      { error: "Ce client n'a pas d'email" },
      { status: 400 }
    );
  }

  const appUrl = getSiteUrl();
  const shareUrl = `${appUrl}/devis/${quote.share_token}`;

  // Build HTML email from plain text body
  const htmlBody = body
    .split("\n")
    .map((line: string) => (line.trim() === "" ? "<br>" : `<p style="margin:0 0 8px;font-size:15px;color:#334155;line-height:1.6;">${line}</p>`))
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:#6366F1;padding:24px 32px;">
        <span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        ${htmlBody}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${shareUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Consulter le devis</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0;font-size:11px;color:#CBD5E1;text-align:center;">
          Envoye via Devizly — Conformement au RGPD, vos donnees sont traitees uniquement pour la gestion de ce devis.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send email
  const { error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject,
    html,
  });

  if (sendError) {
    return NextResponse.json(
      { error: `Erreur d'envoi: ${sendError.message}` },
      { status: 500 }
    );
  }

  // Log the relance
  await supabase.from("relance_logs").insert({
    quote_id: quote.id,
    user_id: user.id,
    subject,
    body_preview: body.substring(0, 500),
    type: "manual",
  });

  return NextResponse.json({ success: true });
}
