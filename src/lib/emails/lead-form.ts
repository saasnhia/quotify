/**
 * Notification email sent to the freelancer when a prospect submits the lead form.
 */

interface LeadFormEmailParams {
  freelancerName: string;
  prospectName: string;
  prospectEmail: string;
  prospectPhone?: string;
  message?: string;
  dashboardUrl: string;
}

export function leadFormEmail(p: LeadFormEmailParams): { subject: string; html: string } {
  return {
    subject: `Nouvelle demande de devis de ${p.prospectName}`,
    html: `
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
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.freelancerName},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          Vous avez reçu une nouvelle demande de devis via votre formulaire.
        </p>

        <!-- Prospect info card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
              <span style="font-size:13px;color:#64748B;font-weight:600;">NOUVEAU PROSPECT</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#64748B;padding-bottom:8px;">Nom</td>
                  <td style="font-size:14px;color:#0F172A;font-weight:600;text-align:right;padding-bottom:8px;">${p.prospectName}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748B;padding-bottom:8px;">Email</td>
                  <td style="font-size:14px;color:#0F172A;font-weight:500;text-align:right;padding-bottom:8px;">${p.prospectEmail}</td>
                </tr>
                ${p.prospectPhone ? `<tr>
                  <td style="font-size:14px;color:#64748B;padding-bottom:8px;">Téléphone</td>
                  <td style="font-size:14px;color:#0F172A;font-weight:500;text-align:right;padding-bottom:8px;">${p.prospectPhone}</td>
                </tr>` : ""}
                ${p.message ? `<tr>
                  <td colspan="2" style="font-size:14px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:12px;">Message</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:14px;color:#0F172A;padding-top:4px;line-height:1.5;">${p.message}</td>
                </tr>` : ""}
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${p.dashboardUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Voir dans le pipeline</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">
          Notification envoyée par Devizly.
        </p>
        <p style="margin:0;font-size:11px;color:#CBD5E1;text-align:center;">
          Conformément au RGPD, les données du prospect sont traitées uniquement pour la gestion de votre activité.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
