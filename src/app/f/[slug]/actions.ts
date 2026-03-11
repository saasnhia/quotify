"use server";

import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { leadFormEmail } from "@/lib/emails/lead-form";
import { getSiteUrl } from "@/lib/url";
import { createNotification } from "@/lib/notifications/create";
import type { LeadForm } from "@/types";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

export async function getPublicForm(slug: string): Promise<LeadForm | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("lead_forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as LeadForm;
}

// Simple in-memory rate limiter (per form, 5 submissions per minute)
const submitTimestamps = new Map<string, number[]>();

function isRateLimited(formId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 5;
  const timestamps = submitTimestamps.get(formId) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  if (recent.length >= maxRequests) return true;
  recent.push(now);
  submitTimestamps.set(formId, recent);
  return false;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str: string, maxLen: number): string {
  return str.trim().slice(0, maxLen);
}

export async function submitLead(
  formId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    project_type?: string;
    budget_range?: string;
    message?: string;
    deadline?: string;
    responses?: Record<string, string>;
  }
) {
  // Rate limit
  if (isRateLimited(formId)) {
    return { error: "Trop de soumissions. Réessayez dans une minute." };
  }

  // Server-side validation
  const name = sanitize(data.name || "", 200);
  const email = sanitize(data.email || "", 254).toLowerCase();

  if (!name) {
    return { error: "Le nom est requis" };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Adresse email invalide" };
  }

  const supabase = createServiceClient();

  // Get form to find user_id and settings
  const { data: form, error: formError } = await supabase
    .from("lead_forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (formError || !form) {
    return { error: "Formulaire introuvable" };
  }

  // Sanitize optional fields
  const phone = data.phone ? sanitize(data.phone, 30) : null;
  const company = data.company ? sanitize(data.company, 200) : null;
  const projectType = data.project_type ? sanitize(data.project_type, 200) : null;
  const budgetRange = data.budget_range ? sanitize(data.budget_range, 100) : null;
  const message = data.message ? sanitize(data.message, 5000) : null;
  const deadline = data.deadline || null;

  // Sanitize custom field responses
  let responses: Record<string, string> | null = null;
  if (data.responses && Object.keys(data.responses).length > 0) {
    responses = {};
    for (const [key, val] of Object.entries(data.responses)) {
      const sKey = sanitize(key, 100);
      const sVal = sanitize(String(val), 2000);
      if (sKey && sVal) {
        responses[sKey] = sVal;
      }
    }
  }

  // Build insert data (user_id can be null for system forms)
  const insertData: Record<string, unknown> = {
    form_id: formId,
    name,
    email,
    phone,
    company,
    project_type: projectType,
    budget_range: budgetRange,
    message,
    deadline,
    pipeline_stage: form.auto_pipeline_stage || "nouveau",
    source: "form",
  };

  if (form.user_id) {
    insertData.user_id = form.user_id;
  }

  if (responses) {
    insertData.responses = responses;
  }

  const { error: insertError } = await supabase.from("leads").insert(insertData);

  if (insertError) {
    console.error("[Lead form] Insert error:", insertError);
    return { error: "Erreur lors de l'enregistrement" };
  }

  // In-app notification (non-blocking, fire-and-forget, only for user-owned forms)
  if (form.user_id) {
    createNotification({
      userId: form.user_id,
      type: "lead",
      title: "Nouveau lead",
      message: name,
      link: "/leads",
    }).then(() => {});
  }

  // Send notification email (fire-and-forget, only for user-owned forms)
  const notifEmail = form.notification_email;
  if (notifEmail && form.user_id) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", form.user_id)
        .single();

      const freelancerName =
        profile?.company_name || profile?.full_name || "Freelance";
      const appUrl = getSiteUrl();

      const { subject, html } = leadFormEmail({
        freelancerName,
        prospectName: name,
        prospectEmail: email,
        prospectPhone: phone || undefined,
        message: message || undefined,
        dashboardUrl: `${appUrl}/dashboard/leads`,
      });

      resend.emails
        .send({ from: FROM_EMAIL, to: notifEmail, subject, html })
        .catch((err: unknown) => {
          console.error("[Lead form] Email notification failed:", err);
        });
    } catch (err) {
      console.error("[Lead form] Email prep failed:", err);
    }
  }

  return { success: true, redirect_url: form.redirect_url };
}
