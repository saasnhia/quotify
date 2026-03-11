"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, Receipt, X } from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: "quote" | "client" | "invoice";
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const pattern = `%${q}%`;

      const [quotesRes, clientsRes, invoicesRes] = await Promise.all([
        supabase
          .from("quotes")
          .select("id, title, number, status")
          .ilike("title", pattern)
          .limit(5),
        supabase
          .from("clients")
          .select("id, name, email")
          .ilike("name", pattern)
          .limit(5),
        supabase
          .from("invoices")
          .select("id, invoice_number, amount, status")
          .ilike("invoice_number", pattern)
          .limit(3),
      ]);

      const mapped: SearchResult[] = [];

      (quotesRes.data ?? []).forEach((q) => {
        mapped.push({
          id: q.id as string,
          label: (q.title as string) || `Devis #${q.number}`,
          sublabel: `Devis · ${q.status ?? ""}`,
          type: "quote",
          href: `/devis/nouveau?edit=${q.id}`,
        });
      });

      (clientsRes.data ?? []).forEach((c) => {
        mapped.push({
          id: c.id as string,
          label: c.name as string,
          sublabel: c.email as string,
          type: "client",
          href: `/clients`,
        });
      });

      (invoicesRes.data ?? []).forEach((inv) => {
        mapped.push({
          id: inv.id as string,
          label: inv.invoice_number as string,
          sublabel: `Facture · ${typeof inv.amount === "number" ? inv.amount.toFixed(2) + " €" : ""}`,
          type: "invoice",
          href: `/dashboard/factures`,
        });
      });

      setResults(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(val);
    }, 300);
  }

  function handleSelect(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  const iconMap = {
    quote: <FileText className="h-4 w-4 text-slate-400 shrink-0" />,
    client: <Users className="h-4 w-4 text-slate-400 shrink-0" />,
    invoice: <Receipt className="h-4 w-4 text-slate-400 shrink-0" />,
  };

  const groupLabels: Record<SearchResult["type"], string> = {
    quote: "Devis",
    client: "Clients",
    invoice: "Factures",
  };

  // Group results by type preserving order: quote → client → invoice
  const grouped = (["quote", "client", "invoice"] as const).reduce<
    Record<SearchResult["type"], SearchResult[]>
  >(
    (acc, type) => {
      acc[type] = results.filter((r) => r.type === type);
      return acc;
    },
    { quote: [], client: [], invoice: [] }
  );

  const hasResults = results.length > 0;
  const showEmpty = query.trim() && !loading && !hasResults;

  return (
    <>
      {/* Trigger button shown in sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        aria-label="Ouvrir la recherche"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Rechercher...</span>
        <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-500 sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-lg p-0 overflow-hidden"
          aria-describedby={undefined}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              placeholder="Rechercher un devis, client, facture..."
              className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 h-auto"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {!query.trim() && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tapez pour rechercher...
              </p>
            )}

            {loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Recherche en cours...
              </p>
            )}

            {showEmpty && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour &quot;{query}&quot;
              </p>
            )}

            {hasResults &&
              (["quote", "client", "invoice"] as const).map((type) => {
                const group = grouped[type];
                if (group.length === 0) return null;
                return (
                  <div key={type} className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {groupLabels[type]}
                    </p>
                    {group.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100"
                      >
                        {iconMap[result.type]}
                        <span className="flex-1 min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {result.label}
                          </span>
                          {result.sublabel && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {result.sublabel}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
