import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { REMINDER_TEMPLATES } from "@/lib/emails/reminder";
import { formatCurrency } from "@/lib/utils/quote";
import { getSiteUrl } from "@/lib/url";

/**
 * Cron endpoint: auto-send reminders for "envoyé" quotes.
 * Sequence: J+2 after first view → J+5 signature push → J+7 deposit nudge.
 * Vercel Cron runs daily at 9:00 AM (vercel.json).
 * Protected by CRON_SECRET header.
 * Pro/Business users only — max 3 reminders per quote.
 */

const REMINDER_SCHEDULE = [
  { day: 2, type: "view" as const },
  { day: 5, type: "sign" as const },
  { day: 7, type: "deposit" as const },
] as const;

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  const now = new Date();
  let totalSent = 0;
  const errors: string[] = [];

  // Find all "envoyé" quotes with client + owner profile (exclude opted-out)
  const { data: quotes } = await supabase
    .from("quotes")
    .select(`
      id, title, number, total_ttc, share_token, created_at, viewed_at,
      user_id, client_id, deposit_percent, relance_opt_out,
      clients(name, email),
      profiles!quotes_user_id_fkey(subscription_status, company_name, full_name, relance_enabled, relance_delays)
    `)
    .eq("status", "envoyé")
    .neq("relance_opt_out", true);

  if (!quotes || quotes.length === 0) {
    return NextResponse.json({ sent: 0, message: "No pending quotes" });
  }

  for (const quote of quotes) {
    // Only pro and business users with relance enabled get auto-reminders
    const profile = quote.profiles as unknown as {
      subscription_status: string;
      company_name: string | null;
      full_name: string | null;
      relance_enabled: boolean | null;
      relance_delays: number[] | null;
    } | null;
    if (!profile || profile.subscription_status === "free") continue;
    if (profile.relance_enabled === false) continue;

    // Use custom delays or default [2, 5, 7]
    const userDelays = Array.isArray(profile.relance_delays) ? profile.relance_delays : [2, 5, 7];

    const client = quote.clients as unknown as {
      name: string;
      email: string | null;
    } | null;
    if (!client?.email) continue;

    // J+2 is based on first view date; J+5 and J+7 based on creation date
    const createdAt = new Date(quote.created_at);
    const viewedAt = quote.viewed_at ? new Date(quote.viewed_at) : null;
    const daysSinceCreated = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceViewed = viewedAt
      ? Math.floor((now.getTime() - viewedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;
    const shareUrl = `${appUrl}/devis/${quote.share_token}`;
    const companyName =
      profile.company_name || profile.full_name || "Votre prestataire";

    const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${quote.share_token}`;

    for (let i = 0; i < REMINDER_SCHEDULE.length; i++) {
      const { day, type } = REMINDER_SCHEDULE[i];
      const reminderNumber = i + 1;

      // Skip if this delay is disabled by user
      if (!userDelays.includes(day)) continue;

      // J+2 (view): only if the quote has been viewed and 2+ days since first view
      if (type === "view") {
        if (!viewedAt || daysSinceViewed === null || daysSinceViewed < day) continue;
      } else {
        // J+5 and J+7: based on creation date
        if (daysSinceCreated < day) continue;
      }

      // Check if already sent
      const { data: existing } = await supabase
        .from("quote_reminders")
        .select("id")
        .eq("quote_id", quote.id)
        .eq("reminder_number", reminderNumber)
        .eq("type", "email")
        .single();

      if (existing) continue;

      // Generate email from template
      const templateFn = REMINDER_TEMPLATES[i];
      const { subject, html } = templateFn({
        clientName: client.name,
        quoteTitle: quote.title,
        quoteRef,
        totalTTC: formatCurrency(Number(quote.total_ttc)),
        shareUrl,
        companyName,
        depositPercent: quote.deposit_percent ?? undefined,
        unsubscribeUrl,
      });

      // Send via Resend
      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: client.email,
        subject,
        html,
      });

      if (sendError) {
        console.error(
          `[Reminder] Failed ${type} (J+${day}) for ${quoteRef}:`,
          sendError
        );
        errors.push(`${quoteRef} ${type}: ${sendError.message}`);
        continue;
      }

      console.log(
        `[Reminder] Sent ${type} (J+${day}) for ${quoteRef} → ${client.email}`
      );

      // Record reminder as sent
      await supabase.from("quote_reminders").insert({
        quote_id: quote.id,
        user_id: quote.user_id,
        type: "email",
        reminder_number: reminderNumber,
      });

      totalSent++;
    }
  }

  return NextResponse.json({
    sent: totalSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
