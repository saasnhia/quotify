"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { calculateItemTotal, calculateTotals, formatCurrency } from "@/lib/utils/quote";
import { CURRENCIES } from "@/lib/currencies";
import type { Client, QuoteItemDraft } from "@/types";
import { toast } from "sonner";

const TVA_RATES = [
  { label: "20%", value: "20" },
  { label: "10%", value: "10" },
  { label: "5.5%", value: "5.5" },
  { label: "0%", value: "0" },
];

const emptyItem: QuoteItemDraft = {
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
};

export default function NouveauDevisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [tvaRate, setTvaRate] = useState("20");
  const [discount, setDiscount] = useState("0");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<QuoteItemDraft[]>([{ ...emptyItem }]);
  const [clients, setClients] = useState<Client[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients((data || []) as Client[]);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!editId) return;
    async function loadQuote() {
      const supabase = createClient();
      const { data } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", editId)
        .single();
      if (!data) return;
      setTitle(data.title);
      setClientId(data.client_id || "");
      setTvaRate(String(data.tva_rate));
      setDiscount(String(data.discount));
      setCurrency(data.currency || "EUR");
      setNotes(data.notes || "");
      setValidUntil(data.valid_until || "");
      if (data.quote_items && data.quote_items.length > 0) {
        setItems(
          data.quote_items
            .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
            .map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              total: Number(item.total),
            }))
        );
      }
    }
    loadQuote();
  }, [editId]);

  function updateItem(index: number, field: keyof QuoteItemDraft, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === "description") {
        item.description = value as string;
      } else {
        item[field] = Number(value) || 0;
      }
      item.total = calculateItemTotal(item.quantity, item.unit_price);
      updated[index] = item;
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totals = calculateTotals(items, Number(tvaRate), Number(discount));

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) {
      toast.error("Décrivez votre prestation");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Erreur IA");
        return;
      }
      const data = result.data;
      if (data.title) setTitle(data.title);
      if (data.notes) setNotes(data.notes);
      if (data.items && Array.isArray(data.items)) {
        setItems(
          data.items.map((item: { description: string; quantity: number; unit_price: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: calculateItemTotal(item.quantity, item.unit_price),
          }))
        );
      }
      toast.success("Devis généré par l'IA !");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(status: "brouillon" | "envoyé" = "brouillon") {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      toast.error("Ajoutez au moins une ligne");
      return;
    }

    setSaving(true);
    const validItems = items.filter((i) => i.description.trim());
    const payload = {
      title,
      client_id: clientId || null,
      currency,
      tva_rate: Number(tvaRate),
      discount: Number(discount),
      notes,
      valid_until: validUntil || null,
      ai_prompt: aiPrompt || null,
      total_ht: totals.totalHT,
      total_ttc: totals.totalTTC,
      status,
      items: validItems,
    };

    try {
      const url = editId ? `/api/quotes/${editId}` : "/api/quotes";
      const method = editId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Erreur de sauvegarde");
        return;
      }
      toast.success(
        status === "envoyé" ? "Devis envoyé !" : "Devis sauvegardé !"
      );
      router.push("/devis");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {editId ? "Modifier le devis" : "Nouveau devis"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* AI Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Générer avec l&apos;IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Décrivez votre prestation en langage naturel... Ex: Site vitrine WordPress 5 pages pour un restaurant à Paris"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading}
                variant="outline"
                className="w-full"
              >
                {aiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Générer avec l&apos;IA
              </Button>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du devis</Label>
                <Input
                  id="title"
                  placeholder="Ex: Création site web"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valide jusqu&apos;au</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Conditions particulières, délais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lignes du devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Ligne {index + 1}</Badge>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Prix unitaire</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={formatCurrency(item.total, currency)}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TVA</Label>
                  <Select value={tvaRate} onValueChange={setTvaRate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TVA_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Remise (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(totals.subtotalHT, currency)}</span>
                </div>
                {Number(discount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise ({discount}%)</span>
                    <span>-{formatCurrency(totals.discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{formatCurrency(totals.totalHT, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    TVA ({tvaRate}%)
                  </span>
                  <span>{formatCurrency(totals.tvaAmount, currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(totals.totalTTC, currency)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSave("brouillon")}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Brouillon
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSave("envoyé")}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
