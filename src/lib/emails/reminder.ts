/**
 * Reminder email templates — J+2 (vu) / J+5 (signature) / J+7 (acompte).
 * Inspired by HoneyBook/Bonsai automated follow-ups.
 */

interface ReminderParams {
  clientName: string;
  quoteTitle: string;
  quoteRef: string;
  totalTTC: string;
  shareUrl: string;
  companyName: string;
  depositPercent?: number;
  unsubscribeUrl: string;
}

interface ReminderTemplate {
  subject: string;
  html: string;
}

function baseLayout(content: string, ctaUrl: string, ctaText: string, unsubscribeUrl: string): string {
  return `
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
        ${content}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${ctaUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${ctaText}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
          Cet email a été envoyé automatiquement par Devizly. Ne pas répondre.
        </p>
        <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">
          <a href="${unsubscribeUrl}" style="color:#6366F1;text-decoration:underline;">Se désinscrire des rappels pour ce devis</a>
          <br/>Conformément au RGPD, votre demande sera traitée immédiatement.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** J+2 — Devis consulté, relance douce */
export function reminderView(p: ReminderParams): ReminderTemplate {
  return {
    subject: `Votre devis ${p.quoteRef} (consulté récemment)`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Nous avons vu que vous avez consulté le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> d'un montant de <strong>${p.totalTTC}</strong>.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Des questions ? ${p.companyName} reste disponible. Sinon, vous pouvez le valider en un clic.
       </p>`,
      p.shareUrl,
      `Consulter le devis — ${p.totalTTC}`,
      p.unsubscribeUrl
    ),
  };
}

/** J+5 — Pousse vers la signature */
export function reminderSign(p: ReminderParams): ReminderTemplate {
  return {
    subject: `${p.quoteRef} : Toujours intéressé ? Signez en 1 clic`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> (${p.totalTTC}) est toujours en attente de votre signature.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Pour ne pas retarder votre projet, signez directement en ligne — c'est rapide et sécurisé.
       </p>`,
      p.shareUrl,
      `Signer le devis maintenant`,
      p.unsubscribeUrl
    ),
  };
}

/** J+7 — Acompte sécurisé */
export function reminderDeposit(p: ReminderParams): ReminderTemplate {
  const depositPct = p.depositPercent ?? 30;
  return {
    subject: `Dernier rappel : Acompte ${depositPct}% sécurisé — ${p.quoteRef}`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         C'est notre dernier rappel concernant le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> d'un montant de <strong>${p.totalTTC}</strong>.
       </p>
       <p style="margin:0 0 8px;font-size:15px;color:#6366F1;line-height:1.6;font-weight:600;">
         Sécurisez votre place avec un acompte de ${depositPct}% — paiement en ligne simple et rapide.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Signez et payez maintenant pour démarrer votre projet sans attendre.
       </p>`,
      p.shareUrl,
      `Signer et payer l'acompte`,
      p.unsubscribeUrl
    ),
  };
}

export const REMINDER_TEMPLATES = [reminderView, reminderSign, reminderDeposit] as const;
