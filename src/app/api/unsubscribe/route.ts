import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/unsubscribe?token=[share_token]
 * Public route — client clicks unsubscribe link in reminder email.
 * Sets relance_opt_out = true on the quote identified by share_token.
 * Returns a simple HTML confirmation page.
 */

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(htmlPage("Lien invalide", "Le lien de désinscription est invalide ou expiré."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createServiceClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("id, number, relance_opt_out")
    .eq("share_token", token)
    .single();

  if (error || !quote) {
    return new NextResponse(htmlPage("Devis introuvable", "Ce devis n'existe pas ou le lien est expiré."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (quote.relance_opt_out) {
    return new NextResponse(
      htmlPage("Déjà désinscrit", "Vous êtes déjà désinscrit des rappels pour ce devis."),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  await supabase
    .from("quotes")
    .update({
      relance_opt_out: true,
      relance_opt_out_at: new Date().toISOString(),
    })
    .eq("id", quote.id);

  const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;

  return new NextResponse(
    htmlPage(
      "Désinscription confirmée",
      `Vous ne recevrez plus de rappels concernant le devis ${quoteRef}. Conformément au RGPD, votre demande a été traitée immédiatement.`
    ),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Devizly</title>
  <style>
    body { margin:0; padding:40px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#F8FAFC; color:#0F172A; }
    .card { max-width:480px; margin:60px auto; background:#fff; border-radius:12px; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center; }
    h1 { font-size:24px; margin:0 0 16px; }
    p { font-size:16px; color:#64748B; line-height:1.6; margin:0; }
    .logo { color:#6366F1; font-size:20px; font-weight:700; margin-bottom:24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Devizly</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
