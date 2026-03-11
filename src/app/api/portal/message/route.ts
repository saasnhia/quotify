import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getResend } from "@/lib/resend";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * POST /api/portal/message
 * Sends a message from the client portal to the freelancer via email.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { token, message, clientName, clientEmail } = body as {
    token: string;
    message: string;
    clientName: string;
    clientEmail: string | null;
  };

  if (!token || !message?.trim()) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Find client + owner from portal token
  const { data: client } = await supabase
    .from("clients")
    .select("id, user_id, name")
    .eq("portal_token", token)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Portail introuvable" }, { status: 404 });
  }

  // Get freelancer email
  const { data: owner } = await supabase
    .from("profiles")
    .select("email, company_name")
    .eq("id", client.user_id)
    .single();

  // Also get from auth.users as fallback
  const { data: authUser } = await supabase.auth.admin.getUserById(client.user_id);
  const freelancerEmail = owner?.email || authUser?.user?.email;

  if (!freelancerEmail) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  const resend = getResend();

  await resend.emails.send({
    from: "Devizly <noreply@devizly.fr>",
    to: freelancerEmail,
    replyTo: clientEmail || undefined,
    subject: `Message de ${clientName || client.name} via votre portail client`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b;margin-bottom:16px">Nouveau message client</h2>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="color:#64748b;font-size:14px;margin:0 0 4px 0">
            <strong>${clientName || client.name}</strong>
            ${clientEmail ? `&lt;${clientEmail}&gt;` : ""}
          </p>
          <p style="color:#1e293b;white-space:pre-wrap;margin:8px 0 0 0">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        ${clientEmail ? `<p style="color:#64748b;font-size:13px">Repondez directement a cet email pour contacter votre client.</p>` : ""}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          Message envoye via votre portail client Devizly.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
