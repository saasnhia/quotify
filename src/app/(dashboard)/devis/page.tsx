"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Share2,
  Eye,
  EyeOff,
  Save,
  Send,
  PenLine,
  CreditCard,
  GitBranch,
  Bell,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import type { QuoteWithClient, QuoteStatus } from "@/types";
import { ShareModal } from "@/components/quotes/ShareModal";
import { RelanceModal } from "@/components/quotes/relance-modal";
import { SaveTemplateModal } from "@/components/templates/save-template-modal";
import { toast } from "sonner";

const statusTabs: { label: string; value: QuoteStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Brouillon", value: "brouillon" },
  { label: "Envoyé", value: "envoyé" },
  { label: "Signé", value: "signé" },
  { label: "Payé", value: "payé" },
  { label: "Refusé", value: "refusé" },
];

export default function DevisPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [templateModalQuote, setTemplateModalQuote] = useState<QuoteWithClient | null>(null);
  const [quota, setQuota] = useState<{ plan: string; used: number; limit: number } | null>(null);
  const [reminderCounts, setReminderCounts] = useState<Record<string, number>>({});

  const fetchQuotes = useCallback(async () => {
    const supabase = createClient();
    const [quotesRes, profileRes, remindersRes] = await Promise.all([
      supabase
        .from("quotes")
        .select("*, clients(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("subscription_status, devis_used")
        .single(),
      supabase
        .from("quote_reminders")
        .select("quote_id"),
    ]);
    setQuotes((quotesRes.data || []) as QuoteWithClient[]);
    if (profileRes.data) {
      const plan = profileRes.data.subscription_status || "free";
      const used = profileRes.data.devis_used || 0;
      const limit = plan === "free" ? 3 : -1;
      setQuota({ plan, used, limit });
    }
    // Count reminders per quote
    if (remindersRes.data) {
      const counts: Record<string, number> = {};
      for (const r of remindersRes.data) {
        counts[r.quote_id] = (counts[r.quote_id] || 0) + 1;
      }
      setReminderCounts(counts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filtered = quotes.filter((q) => {
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    const matchSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.clients?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce devis ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Devis supprimé");
    fetchQuotes();
  }

  async function handleDuplicate(quote: QuoteWithClient) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newQuote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        title: `${quote.title} (copie)`,
        total_ht: quote.total_ht,
        tva_rate: quote.tva_rate,
        discount: quote.discount,
        total_ttc: quote.total_ttc,
        currency: quote.currency || "EUR",
        notes: quote.notes,
        valid_until: quote.valid_until,
      })
      .select()
      .single();

    if (error || !newQuote) {
      toast.error("Erreur lors de la duplication");
      return;
    }

    // Copy items
    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);

    if (items && items.length > 0) {
      await supabase.from("quote_items").insert(
        items.map((item) => ({
          quote_id: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: item.position,
        }))
      );
    }

    toast.success("Devis dupliqué");
    fetchQuotes();
  }

  async function handleNewVersion(quote: QuoteWithClient) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const newVersion = (quote.version || 1) + 1;
    const { data: newQuote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        title: quote.title,
        total_ht: quote.total_ht,
        tva_rate: quote.tva_rate,
        discount: quote.discount,
        total_ttc: quote.total_ttc,
        currency: quote.currency || "EUR",
        notes: quote.notes,
        valid_until: quote.valid_until,
        version: newVersion,
        parent_quote_id: quote.parent_quote_id || quote.id,
      })
      .select()
      .single();

    if (error || !newQuote) {
      toast.error("Erreur lors de la création de version");
      return;
    }

    // Copy items
    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);

    if (items && items.length > 0) {
      await supabase.from("quote_items").insert(
        items.map((item) => ({
          quote_id: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: item.position,
        }))
      );
    }

    toast.success(`Version ${newVersion} créée`);
    router.push(`/devis/nouveau?edit=${newQuote.id}`);
  }

  async function handleStatusChange(id: string, newStatus: QuoteStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from("quotes")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
      return;
    }
    toast.success(`Statut changé: ${getStatusLabel(newStatus)}`);
    fetchQuotes();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devis</h1>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Analytics bar */}
      {!loading && quotes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Envoyés",
              count: quotes.filter((q) => q.status === "envoyé").length,
              icon: Send,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Ouverts",
              count: quotes.filter((q) => q.viewed_at).length,
              icon: Eye,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Signés",
              count: quotes.filter(
                (q) => q.status === "signé" || q.status === "accepté"
              ).length,
              icon: PenLine,
              color: "text-green-600 bg-green-50",
            },
            {
              label: "Payés",
              count: quotes.filter((q) => q.status === "payé").length,
              amount: quotes
                .filter((q) => q.status === "payé")
                .reduce((sum, q) => sum + Number(q.total_ttc), 0),
              icon: CreditCard,
              color: "text-violet-600 bg-violet-50",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                    {"amount" in stat && stat.amount
                      ? ` — ${formatCurrency(stat.amount)}`
                      : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quota banner */}
      {quota && (
        <div
          className={`rounded-xl p-4 ${
            quota.limit === -1
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
              : quota.used >= quota.limit
                ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
                : "bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200"
          }`}
        >
          {quota.limit === -1 ? (
            <p className="text-sm font-semibold text-green-700">
              Plan {quota.plan === "pro" ? "Pro" : "Business"} — Devis illimités
            </p>
          ) : (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Gratuit : {quota.used}/{quota.limit} devis utilisés ce mois
                </p>
                {quota.used >= quota.limit && (
                  <p className="text-sm text-red-600 mt-0.5">
                    Limite atteinte.{" "}
                    <Link href="/pricing" className="underline font-semibold hover:text-red-800">
                      Passez Pro (19€) pour des devis illimités
                    </Link>
                  </p>
                )}
              </div>
              {quota.used < quota.limit && (
                <Link
                  href="/pricing"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Passer Pro — illimité
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1">
              {statusTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={statusFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className="text-lg font-medium">Aucun devis trouvé</p>
              <p className="mt-1">Créez votre premier devis pour commencer</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/devis/nouveau">Créer un devis</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Relances</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm">
                      DEV-{String(quote.number).padStart(4, "0")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span>{quote.title}</span>
                      {quote.version > 1 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          v{quote.version}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{quote.clients?.name || "—"}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(quote.status)}
                        >
                          {getStatusLabel(quote.status)}
                        </Badge>
                        {quote.status === "envoyé" && (
                          quota && quota.plan !== "free" ? (
                            quote.viewed_at ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600" title={`Consulté le ${formatDate(quote.viewed_at)}`}>
                                <Eye className="h-3 w-3" /> Vu{quote.view_count > 1 ? ` ${quote.view_count}x` : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <EyeOff className="h-3 w-3" /> Non lu
                              </span>
                            )
                          ) : (
                            <a href="/pricing" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600">
                              <Eye className="h-3 w-3" /> Tracking Pro
                            </a>
                          )
                        )}
                        {quote.deposit_percent && quote.deposit_paid_at && (
                          <Badge variant="outline" className="text-xs text-violet-600 border-violet-200">
                            Acompte {quote.deposit_percent}%
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {quote.status === "envoyé" || quote.status === "signé" ? (
                        <div className="flex items-center gap-1.5">
                          <Bell className={`h-3.5 w-3.5 ${
                            (reminderCounts[quote.id] || 0) > 0
                              ? "text-indigo-500"
                              : "text-slate-300"
                          }`} />
                          <span className={`text-xs font-medium ${
                            (reminderCounts[quote.id] || 0) >= 3
                              ? "text-emerald-600"
                              : (reminderCounts[quote.id] || 0) > 0
                                ? "text-indigo-600"
                                : "text-slate-400"
                          }`}>
                            {reminderCounts[quote.id] || 0}/3
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(quote.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {quote.status === "envoyé" && quote.clients?.name && (
                          <RelanceModal
                            quoteId={quote.id}
                            clientName={quote.clients.name}
                            variant="icon"
                          />
                        )}
                        {quote.share_token && (
                          <ShareModal
                            shareToken={quote.share_token}
                            quoteTitle={quote.title}
                            clientEmail={quote.clients?.email}
                          />
                        )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/devis/nouveau?edit=${quote.id}`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(quote)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleNewVersion(quote)}
                          >
                            <GitBranch className="mr-2 h-4 w-4" />
                            Nouvelle version
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTemplateModalQuote(quote)}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Sauvegarder comme template
                          </DropdownMenuItem>
                          {quote.status === "brouillon" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(quote.id, "envoyé")
                              }
                            >
                              Marquer envoyé
                            </DropdownMenuItem>
                          )}
                          {quote.status === "envoyé" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(quote.id, "signé")
                              }
                            >
                              Marquer signé
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(quote.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {templateModalQuote && (
        <SaveTemplateModal
          open={!!templateModalQuote}
          onOpenChange={(open) => {
            if (!open) setTemplateModalQuote(null);
          }}
          quoteId={templateModalQuote.id}
          quoteTitle={templateModalQuote.title}
        />
      )}
    </div>
  );
}
