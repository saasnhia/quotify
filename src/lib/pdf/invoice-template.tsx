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
}

export interface InvoicePdfProps {
  invoice_number: string;
  title: string;
  created_at: string;
  due_date?: string | null;
  client?: PdfClient | null;
  items: PdfItem[];
  total_ht: number;
  tva_rate: number;
  discount: number;
  total_ttc: number;
  notes?: string | null;
  status: string;
  paid_at?: string | null;
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
  logo: { width: 40, height: 40 },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  companyInfo: { fontSize: 8, color: C.muted, marginTop: 2 },
  invoiceNumber: { fontSize: 9, color: C.muted, textAlign: "right" as const },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "right" as const,
  },
  invoiceLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    textAlign: "right" as const,
    marginBottom: 4,
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
  clientName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  clientDetail: { fontSize: 9, color: C.muted, marginTop: 2 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateText: { fontSize: 9, color: C.muted },
  table: { marginBottom: 20 },
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
  tableRowAlt: { backgroundColor: C.light },
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" as const },
  colPrice: { flex: 2, textAlign: "right" as const },
  colTotal: { flex: 2, textAlign: "right" as const },
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
  totalLabel: { fontSize: 10, color: C.muted },
  totalValue: { fontSize: 10 },
  totalTtcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: C.dark,
    marginTop: 4,
  },
  totalTtcLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  totalTtcValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
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
  notesText: { fontSize: 9, lineHeight: 1.5 },
  paidBox: {
    backgroundColor: C.greenBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 14,
    marginBottom: 20,
    alignItems: "center" as const,
  },
  paidText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.green,
  },
  paidDate: { fontSize: 10, color: C.green, marginTop: 4 },
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
  if (status === "paid") return { backgroundColor: C.greenBg, color: C.green };
  if (status === "sent") return { backgroundColor: "#EFF6FF", color: "#2563EB" };
  if (status === "overdue") return { backgroundColor: "#FEF2F2", color: "#DC2626" };
  return { backgroundColor: C.light, color: C.muted };
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "BROUILLON",
    sent: "ENVOYEE",
    paid: "PAYEE",
    overdue: "EN RETARD",
  };
  return map[status] || status.toUpperCase();
}

/* ── Component ─────────────────────────────────── */

export function InvoicePdf(props: InvoicePdfProps) {
  const {
    invoice_number,
    title,
    created_at,
    due_date,
    client,
    items,
    total_ht,
    tva_rate,
    discount,
    total_ttc,
    notes,
    status,
    paid_at,
    company,
    currency = "EUR",
  } = props;

  const f = (n: number) => fmt(n, currency);
  const tvaAmount = total_ttc - total_ht;

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
              <Text style={s.companyInfo}>Tel : {company.phone}</Text>
            )}
            {company.siret && (
              <Text style={s.companyInfo}>SIRET : {company.siret}</Text>
            )}
          </View>
          <View>
            <Text style={s.invoiceLabel}>FACTURE</Text>
            <Text style={s.invoiceNumber}>{invoice_number}</Text>
            <Text style={s.invoiceTitle}>{title}</Text>
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
            Date d&apos;emission : {fmtDate(created_at)}
          </Text>
          {due_date && (
            <Text style={s.dateText}>
              Echeance : {fmtDate(due_date)}
            </Text>
          )}
        </View>

        {/* ── Client ── */}
        {client && (
          <View style={s.clientBox}>
            <Text style={s.clientLabel}>Facture a</Text>
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
            <Text style={[s.tableHeaderText, s.colQty]}>Qte</Text>
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
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA ({tva_rate}%)</Text>
            <Text style={s.totalValue}>{f(tvaAmount)}</Text>
          </View>
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
            <Text style={s.totalTtcLabel}>Total TTC</Text>
            <Text style={s.totalTtcValue}>{f(total_ttc)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Paid stamp ── */}
        {status === "paid" && (
          <View style={s.paidBox}>
            <Text style={s.paidText}>PAYEE</Text>
            {paid_at && (
              <Text style={s.paidDate}>Le {fmtDate(paid_at)}</Text>
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
            Conditions : Paiement a 30 jours. Penalites de retard : 3x taux interet legal.
          </Text>
          <Text style={s.footerText}>
            Document genere par Devizly — devizly.fr
          </Text>
        </View>
      </Page>
    </Document>
  );
}
