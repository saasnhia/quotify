import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Export quotes as CSV for comptabilité.
 * GET /api/export/csv?year=2026&month=3
 * Optional: ?status=payé to filter by status.
 * FR-compliant: TVA, HT, TTC, dates jj/mm/aaaa.
 */

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Business-only feature gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status !== "business") {
    return NextResponse.json(
      { error: "PLAN_REQUIRED", plan: "business", message: "Export CSV réservé au plan Business" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const status = searchParams.get("status");

  // Build query
  let query = supabase
    .from("quotes")
    .select("*, clients(name, email, siret)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Filter by date range
  if (year) {
    const y = parseInt(year);
    if (month) {
      const m = parseInt(month) - 1; // 0-indexed
      const startDate = new Date(y, m, 1).toISOString();
      const endDate = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    } else {
      const startDate = new Date(y, 0, 1).toISOString();
      const endDate = new Date(y, 11, 31, 23, 59, 59).toISOString();
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: quotes, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!quotes || quotes.length === 0) {
    return NextResponse.json(
      { error: "Aucun devis trouvé pour cette période" },
      { status: 404 }
    );
  }

  // Build CSV
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel FR
  const separator = ";"; // FR Excel default
  const headers = [
    "Numéro",
    "Date",
    "Client",
    "Email client",
    "SIRET client",
    "Titre",
    "Total HT",
    "Taux TVA",
    "Montant TVA",
    "Remise %",
    "Total TTC",
    "Statut",
    "Signé le",
    "Payé le",
  ];

  const rows = quotes.map((q) => {
    const client = q.clients as { name: string; email: string | null; siret: string | null } | null;
    const totalHT = Number(q.total_ht);
    const totalTTC = Number(q.total_ttc);
    const tvaAmount = totalTTC - totalHT;

    return [
      `DEV-${String(q.number).padStart(4, "0")}`,
      fmtDate(q.created_at),
      client?.name || "",
      client?.email || "",
      client?.siret || "",
      q.title,
      fmtNum(totalHT),
      `${Number(q.tva_rate)}%`,
      fmtNum(tvaAmount),
      `${Number(q.discount)}%`,
      fmtNum(totalTTC),
      q.status,
      q.signed_at ? fmtDate(q.signed_at) : "",
      q.paid_at ? fmtDate(q.paid_at) : "",
    ];
  });

  // Summary row
  const totalHT = quotes.reduce((s, q) => s + Number(q.total_ht), 0);
  const totalTTC = quotes.reduce((s, q) => s + Number(q.total_ttc), 0);
  const totalTVA = totalTTC - totalHT;
  rows.push([
    "",
    "",
    "",
    "",
    "",
    `TOTAL (${quotes.length} devis)`,
    fmtNum(totalHT),
    "",
    fmtNum(totalTVA),
    "",
    fmtNum(totalTTC),
    "",
    "",
    "",
  ]);

  const csv =
    BOM +
    headers.join(separator) +
    "\n" +
    rows.map((row) => row.map(escapeCSV).join(separator)).join("\n");

  const filename = month
    ? `devizly-export-${year}-${String(month).padStart(2, "0")}.csv`
    : `devizly-export-${year || "all"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function fmtDate(d: string): string {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function fmtNum(n: number): string {
  // French number format: 1 234,56
  return n.toFixed(2).replace(".", ",");
}

function escapeCSV(value: string): string {
  // Prevent CSV injection: prefix formula-like values to block Excel execution
  if (/^[=+\-@\t\r]/.test(value)) {
    value = "'" + value;
  }
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
