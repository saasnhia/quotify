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
import { toast } from "sonner";

const statusTabs: { label: string; value: QuoteStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Brouillon", value: "brouillon" },
  { label: "Envoyé", value: "envoyé" },
  { label: "Signé", value: "signé" },
];

export default function DevisPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("quotes")
      .select("*, clients(*)")
      .order("created_at", { ascending: false });
    setQuotes((data || []) as QuoteWithClient[]);
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
                    <TableCell className="font-medium">{quote.title}</TableCell>
                    <TableCell>{quote.clients?.name || "—"}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(quote.total_ttc))}
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
                          quote.viewed_at ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600" title={`Consulte le ${formatDate(quote.viewed_at)}`}>
                              <Eye className="h-3 w-3" /> Vu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <EyeOff className="h-3 w-3" /> Non lu
                            </span>
                          )
                        )}
                      </div>
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
    </div>
  );
}
