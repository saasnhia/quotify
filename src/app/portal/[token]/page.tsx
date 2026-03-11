"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  Euro,
  Loader2,
  ExternalLink,
  Send,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils/quote";

interface PortalQuote {
  id: string;
  number: number;
  title: string;
  total_ht: number;
  tva_rate: number;
  total_ttc: number;
  status: string;
  share_token: string | null;
  created_at: string;
  signed_at: string | null;
  paid_at: string | null;
}

interface PortalData {
  client: { name: string; email: string | null };
  company: { name: string; logo_url: string | null; brand_color: string; email: string | null };
  quotes: PortalQuote[];
  summary: {
    total: number;
    paid: number;
    pending: number;
    totalPaid: number;
    totalPending: number;
  };
}

export default function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchPortal() {
      const res = await fetch(`/api/portal/${token}`);
      if (!res.ok) {
        setError("Portail introuvable ou lien invalide.");
        setLoading(false);
        return;
      }
      const result = await res.json();
      setData(result);
      setLoading(false);
    }
    fetchPortal();
  }, [token]);

  async function handleSendMessage() {
    if (!message.trim() || !data) return;
    setSending(true);
    try {
      await fetch("/api/portal/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          message: message.trim(),
          clientName: data.client.name,
          clientEmail: data.client.email,
        }),
      });
      setMessageSent(true);
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Portail introuvable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "Ce lien n'est plus valide."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { client, company, quotes, summary } = data;
  const brandColor = company.brand_color || "#8B5CF6";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Branded Header */}
      <div
        className="border-b"
        style={{ backgroundColor: brandColor }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <div className="relative h-10 w-20">
                <Image
                  src={company.logo_url}
                  alt="Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-white">{company.name}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">{client.name}</p>
            {client.email && (
              <p className="text-xs text-white/80">{client.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour {client.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Retrouvez tous vos devis et paiements avec {company.name}.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{summary.pending}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summary.totalPending)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-green-50 p-3 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payes</p>
                <p className="text-2xl font-bold">{summary.paid}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total devis</p>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summary.totalPaid + summary.totalPending)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes list */}
        <Card>
          <CardHeader>
            <CardTitle>Vos devis</CardTitle>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-10 w-10 opacity-50" />
                <p>Aucun devis pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          DEV-{String(quote.number).padStart(4, "0")}
                        </span>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(quote.status)}
                        >
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium">{quote.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quote.created_at)} —{" "}
                        {formatCurrency(Number(quote.total_ttc))} TTC
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* View / Sign / Pay */}
                      {quote.share_token && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/devis/${quote.share_token}`}>
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Voir
                          </a>
                        </Button>
                      )}

                      {/* PDF */}
                      {quote.share_token && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `/api/quotes/share/${quote.share_token}/pdf`,
                              "_blank"
                            )
                          }
                        >
                          <Download className="mr-1 h-3 w-3" />
                          PDF
                        </Button>
                      )}

                      {/* Pay button for envoyé/signé */}
                      {(quote.status === "envoyé" ||
                        quote.status === "signé") &&
                        quote.share_token && (
                          <Button
                            size="sm"
                            style={{ backgroundColor: brandColor }}
                            className="text-white hover:opacity-90"
                            asChild
                          >
                            <a href={`/devis/${quote.share_token}`}>
                              <CreditCard className="mr-1 h-3 w-3" />
                              Payer
                            </a>
                          </Button>
                        )}

                      {/* Paid info */}
                      {quote.status === "payé" && quote.paid_at && (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Paye le {formatDate(quote.paid_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact / Message section */}
        {company.email && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contacter {company.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messageSent ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Message envoye ! {company.name} vous repondra par email.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message..."
                    rows={3}
                    maxLength={2000}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    style={{ backgroundColor: brandColor }}
                    className="text-white hover:opacity-90"
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Envoyer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Portail propulse par{" "}
          <a href="https://devizly.fr" className="underline" target="_blank" rel="noopener noreferrer">
            Devizly
          </a>
        </p>
      </div>
    </div>
  );
}
