import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

/* ── Types ─────────────────────────────────────── */

interface PdfItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface PdfClient {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  siret?: string | null;
}

interface PdfCompany {
  name?: string;
  address?: string;
  siret?: string;
  phone?: string;
  logo_url?: string | null;
  tva_number?: string | null;
  is_micro_entrepreneur?: boolean;
}

export interface DevisPdfProps {
  number: number;
  title: string;
  created_at: string;
  valid_until?: string | null;
  client?: PdfClient | null;
  items: PdfItem[];
  total_ht: number;
  tva_rate: number;
  discount: number;
  total_ttc: number;
  notes?: string | null;
  status: string;
  signature_data?: string | null;
  signer_name?: string | null;
  signed_at?: string | null;
  company: PdfCompany;
  currency?: string;
}

/* ── Colors ────────────────────────────────────── */

const C = {
  primary: "#6366F1",
  dark: "#0F172A",
  muted: "#64748B",
  light: "#F8FAFC",
  border: "#E2E8F0",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  white: "#FFFFFF",
};

/* ── Styles ────────────────────────────────────── */

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.dark,
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  companyInfo: {
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
  },
  quoteNumber: {
    fontSize: 9,
    color: C.muted,
    textAlign: "right" as const,
  },
  quoteTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "right" as const,
  },
  statusBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    textAlign: "center" as const,
    alignSelf: "flex-end" as const,
  },
  // Client
  clientBox: {
    backgroundColor: C.light,
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  clientLabel: {
    fontSize: 8,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  clientDetail: {
    fontSize: 9,
    color: C.muted,
    marginTop: 2,
  },
  // Date row
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 9,
    color: C.muted,
  },
  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    backgroundColor: C.light,
  },
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" as const },
  colPrice: { flex: 2, textAlign: "right" as const },
  colTotal: { flex: 2, textAlign: "right" as const },
  // Totals
  totalsContainer: {
    alignSelf: "flex-end" as const,
    width: 220,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: C.muted,
  },
  totalValue: {
    fontSize: 10,
  },
  totalTtcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: C.dark,
    marginTop: 4,
  },
  totalTtcLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  totalTtcValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  // Notes
  notesBox: {
    backgroundColor: C.light,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 8,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Signature
  signatureBox: {
    backgroundColor: C.greenBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 14,
    marginBottom: 20,
  },
  signatureTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    marginBottom: 8,
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginBottom: 6,
  },
  signatureInfo: {
    fontSize: 9,
    color: C.green,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: C.muted,
    textAlign: "center" as const,
    lineHeight: 1.6,
  },
});

/* ── Helpers ───────────────────────────────────── */

function fmt(n: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(n);
}

function fmtDate(d: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

function statusStyle(status: string) {
  if (status === "signé")
    return { backgroundColor: C.greenBg, color: C.green };
  if (status === "accepté")
    return { backgroundColor: "#ECFDF5", color: "#059669" };
  if (status === "envoyé")
    return { backgroundColor: "#EFF6FF", color: "#2563EB" };
  if (status === "refusé")
    return { backgroundColor: "#FEF2F2", color: "#DC2626" };
  return { backgroundColor: C.light, color: C.muted };
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    brouillon: "BROUILLON",
    "envoyé": "ENVOYE",
    "signé": "SIGNE",
    "accepté": "ACCEPTE",
    "refusé": "REFUSE",
  };
  return map[status] || status.toUpperCase();
}

/* ── Component ─────────────────────────────────── */

export function DevisPdf(props: DevisPdfProps) {
  const {
    number,
    title,
    created_at,
    valid_until,
    client,
    items,
    total_ht,
    tva_rate,
    discount,
    total_ttc,
    notes,
    status,
    signature_data,
    signer_name,
    signed_at,
    company,
    currency = "EUR",
  } = props;

  const f = (n: number) => fmt(n, currency);
  const tvaAmount = total_ttc - total_ht;
  const quoteRef = `DEV-${String(number).padStart(4, "0")}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <View style={s.headerLeft}>
              {company.logo_url && (
                <Image src={company.logo_url} style={s.logo} />
              )}
              <Text style={s.brandName}>
                {company.name || "Devizly"}
              </Text>
            </View>
            {company.address && (
              <Text style={s.companyInfo}>{company.address}</Text>
            )}
            {company.phone && (
              <Text style={s.companyInfo}>Tél : {company.phone}</Text>
            )}
            {company.siret && (
              <Text style={s.companyInfo}>SIRET : {company.siret}</Text>
            )}
            {company.tva_number && !company.is_micro_entrepreneur && (
              <Text style={s.companyInfo}>N° TVA : {company.tva_number}</Text>
            )}
          </View>
          <View>
            <Text style={s.quoteNumber}>{quoteRef}</Text>
            <Text style={s.quoteTitle}>{title}</Text>
            <View style={[s.statusBadge, statusStyle(status)]}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                {statusLabel(status)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Dates ── */}
        <View style={s.dateRow}>
          <Text style={s.dateText}>
            Date : {fmtDate(created_at)}
          </Text>
          {valid_until && (
            <Text style={s.dateText}>
              Valide jusqu&apos;au : {fmtDate(valid_until)}
            </Text>
          )}
        </View>

        {/* ── Client ── */}
        {client && (
          <View style={s.clientBox}>
            <Text style={s.clientLabel}>Client</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.email && (
              <Text style={s.clientDetail}>{client.email}</Text>
            )}
            {client.phone && (
              <Text style={s.clientDetail}>{client.phone}</Text>
            )}
            {client.address && (
              <Text style={s.clientDetail}>
                {client.address}
                {client.postal_code && `, ${client.postal_code}`}
                {client.city && ` ${client.city}`}
              </Text>
            )}
            {client.siret && (
              <Text style={s.clientDetail}>SIRET : {client.siret}</Text>
            )}
          </View>
        )}

        {/* ── Items table ── */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderText, s.colQty]}>Qté</Text>
            <Text style={[s.tableHeaderText, s.colPrice]}>Prix unit.</Text>
            <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={s.colDesc}>{item.description}</Text>
              <Text style={s.colQty}>{Number(item.quantity)}</Text>
              <Text style={s.colPrice}>{f(Number(item.unit_price))}</Text>
              <Text style={[s.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                {f(Number(item.total))}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsContainer}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total HT</Text>
            <Text style={s.totalValue}>{f(total_ht)}</Text>
          </View>
          {!company.is_micro_entrepreneur && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TVA ({tva_rate}%)</Text>
              <Text style={s.totalValue}>{f(tvaAmount)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { color: "#DC2626" }]}>
                Remise ({discount}%)
              </Text>
              <Text style={[s.totalValue, { color: "#DC2626" }]}>
                incluse
              </Text>
            </View>
          )}
          <View style={s.totalTtcRow}>
            <Text style={s.totalTtcLabel}>
              {company.is_micro_entrepreneur ? "Total à payer" : "Total TTC"}
            </Text>
            <Text style={s.totalTtcValue}>
              {f(company.is_micro_entrepreneur ? total_ht : total_ttc)}
            </Text>
          </View>
        </View>
        {company.is_micro_entrepreneur && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 8, color: C.muted, fontStyle: "italic" }}>
              TVA non applicable, article 293 B du CGI
            </Text>
          </View>
        )}

        {/* ── Notes ── */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Signature ── */}
        {status === "signé" && signature_data && (
          <View style={s.signatureBox}>
            <Text style={s.signatureTitle}>
              Devis signe electroniquement
            </Text>
            <Image src={signature_data} style={s.signatureImage} />
            {signer_name && (
              <Text style={s.signatureInfo}>
                Signe par : {signer_name}
              </Text>
            )}
            {signed_at && (
              <Text style={s.signatureInfo}>
                Le {fmtDate(signed_at)}
              </Text>
            )}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {company.name || "Devizly"}
            {company.siret ? ` — SIRET ${company.siret}` : ""}
            {company.address ? ` — ${company.address}` : ""}
          </Text>
          <Text style={s.footerText}>
            Conditions : Devis valide 30 jours sauf mention contraire.
            Paiement à réception de facture. Pas d&apos;escompte pour règlement anticipé.
          </Text>
          <Text style={s.footerText}>
            Tout retard de paiement entraîne des pénalités au taux de 3 fois le taux d&apos;intérêt légal
            (art. L441-10 du Code de commerce) et une indemnité forfaitaire de 40€ pour frais de recouvrement
            (art. D441-5 du Code de commerce).
          </Text>
          <Text style={s.footerText}>
            Prestations soumises à nos conditions générales de vente disponibles sur demande.
          </Text>
          <Text style={s.footerText}>
            Document généré par Devizly — devizly.fr
          </Text>
        </View>
      </Page>
    </Document>
  );
}
