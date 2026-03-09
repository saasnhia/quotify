import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit } from "@/lib/ratelimit";
import { resend } from "@/lib/resend";
import { leadFormEmail } from "@/lib/emails/lead-form";
import { getSiteUrl } from "@/lib/url";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

/**
 * GET — Return lead form settings for a user (public, no auth).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("lead_form_enabled, lead_form_title, lead_form_description, lead_form_color, full_name, company_name")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!profile.lead_form_enabled) {
    return NextResponse.json({ error: "Formulaire désactivé" }, { status: 403 });
  }

  return NextResponse.json({
    title: profile.lead_form_title || "Demandez un devis",
    description: profile.lead_form_description || null,
    color: profile.lead_form_color || "#7c3aed",
    companyName: profile.company_name || profile.full_name || "Freelance",
  });
}

/**
 * POST — Submit a lead form (public, rate-limited).
 * Creates a prospect with source='form' and emails the freelancer.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Rate limit: 5 req/min/IP
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { userId } = await params;
  const supabase = createServiceClient();

  // Verify user exists and form is enabled
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("lead_form_enabled, full_name, company_name, email")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!profile.lead_form_enabled) {
    return NextResponse.json({ error: "Formulaire désactivé" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, phone, message, estimated_amount } = body as {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    estimated_amount?: number;
  };

  // Validate required fields
  if (!name || !email) {
    return NextResponse.json(
      { error: "Nom et email sont requis" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  // Create prospect
  const { error: insertError } = await supabase
    .from("prospects")
    .insert({
      user_id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      notes: message?.trim() || null,
      estimated_amount: estimated_amount || 0,
      source: "form",
    });

  if (insertError) {
    console.error("[Lead form] Insert error:", insertError);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }

  // Notify freelancer by email (fire-and-forget)
  const freelancerEmail = profile.email;
  if (freelancerEmail) {
    const appUrl = getSiteUrl();
    const freelancerName = profile.company_name || profile.full_name || "Freelance";

    const { subject, html } = leadFormEmail({
      freelancerName,
      prospectName: name.trim(),
      prospectEmail: email.trim(),
      prospectPhone: phone?.trim(),
      message: message?.trim(),
      dashboardUrl: `${appUrl}/dashboard/pipeline`,
    });

    resend.emails
      .send({ from: FROM_EMAIL, to: freelancerEmail, subject, html })
      .catch((err: unknown) => {
        console.error("[Lead form] Email notification failed:", err);
      });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
