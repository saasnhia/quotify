import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import { Badge } from "@/components/ui/badge";
import { InvoiceActions } from "./invoice-actions";

export const metadata = {
  title: "Factures — Worthifast",
};

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary" className="bg-slate-100 text-slate-600">Brouillon</Badge>;
    case "sent":
      return <Badge variant="secondary" className="bg-blue-50 text-blue-600">Envoyée</Badge>;
    case "paid":
      return <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">Payée</Badge>;
    case "overdue":
      return <Badge variant="secondary" className="bg-red-50 text-red-600">En retard</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function FacturesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch invoices with client info
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allInvoices = (invoices || []).map((inv) => {
    const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
    return { ...inv, client };
  });

  // Stats
  const totalInvoiced = allInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  const totalPending = allInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "draft")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalPaidThisMonth = allInvoices
    .filter(
      (inv) =>
        inv.status === "paid" &&
        inv.paid_at &&
        new Date(inv.paid_at) >= monthStart
    )
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos factures et suivez les paiements.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">Total facturé</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">En attente</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(totalPending)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">Payé ce mois</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalPaidThisMonth)}
          </p>
        </div>
      </div>

      {/* Invoice table */}
      {allInvoices.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-muted-foreground">Aucune facture pour le moment.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les factures seront générées automatiquement depuis vos devis récurrents.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    N° Facture
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Échéance
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Créée le
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      {inv.client?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(inv.amount), inv.currency || "EUR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <InvoiceActions
                        invoiceId={inv.id}
                        status={inv.status}
                        checkoutUrl={inv.stripe_checkout_url}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
