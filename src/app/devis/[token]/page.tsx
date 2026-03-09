"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  PenLine,
  CreditCard,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import { SignatureCanvas } from "@/components/signature-canvas";
import type { QuoteWithItems } from "@/types";
import { toast } from "sonner";

export default function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const [quote, setQuote] = useState<QuoteWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Signature state
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const fetchQuote = useCallback(async () => {
    const response = await fetch(`/api/quotes/share/${token}`);
    if (!response.ok) {
      setError("Ce devis est introuvable ou le lien est invalide.");
      setLoading(false);
      return;
    }
    const result = await response.json();
    setQuote(result.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (searchParams.get("paid") === "true") {
      setPaidSuccess(true);
      toast.success("Paiement effectué avec succès !");
      // Refetch to get updated status from webhook
      const timer = setTimeout(() => fetchQuote(), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchQuote]);

  async function handleSign() {
    if (!signatureData) {
      toast.error("Veuillez signer dans le cadre ci-dessus");
      return;
    }
    if (!signerName.trim()) {
      toast.error("Veuillez entrer votre nom complet");
      return;
    }

    setResponding(true);
    const response = await fetch(`/api/quotes/share/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "signé",
        signature_data: signatureData,
        signer_name: signerName.trim(),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Erreur");
      setResponding(false);
      return;
    }
    toast.success("Devis signé avec succès !");
    setQuote((prev) =>
      prev
        ? {
            ...prev,
            status: "signé",
            signature_data: signatureData,
            signer_name: signerName.trim(),
            signed_at: new Date().toISOString(),
          }
        : prev
    );
    setShowSignature(false);
    setResponding(false);
  }

  async function handleRefuse() {
    setResponding(true);
    const response = await fetch(`/api/quotes/share/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refusé" }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Erreur");
      setResponding(false);
      return;
    }
    toast.success("Devis refusé.");
    setQuote((prev) => (prev ? { ...prev, status: "refusé" } : prev));
    setResponding(false);
  }

  async function handlePayment() {
    if (!quote) return;
    setPayLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_token: token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erreur lors de la création du paiement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPayLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Devis introuvable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "Ce lien n'est plus valide."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = (quote.quote_items || []).sort(
    (a, b) => a.position - b.position
  );
  const tvaAmount = Number(quote.total_ttc) - Number(quote.total_ht);
  const alreadyResponded =
    quote.status === "accepté" ||
    quote.status === "refusé" ||
    quote.status === "signé" ||
    quote.status === "payé";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Devizly</span>
          </div>
          <Badge variant="secondary" className={getStatusColor(quote.status)}>
            {getStatusLabel(quote.status)}
          </Badge>
        </div>

        {/* Quote Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">{quote.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Devis n° DEV-{String(quote.number).padStart(4, "0")} —{" "}
                  {formatDate(quote.created_at)}
                </p>
              </div>
              {quote.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valide jusqu&apos;au {formatDate(quote.valid_until)}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Client info */}
            {quote.clients && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Client
                </p>
                <p className="font-medium">{quote.clients.name}</p>
                {quote.clients.email && (
                  <p className="text-sm text-muted-foreground">
                    {quote.clients.email}
                  </p>
                )}
                {quote.clients.address && (
                  <p className="text-sm text-muted-foreground">
                    {quote.clients.address}
                    {quote.clients.postal_code &&
                      `, ${quote.clients.postal_code}`}
                    {quote.clients.city && ` ${quote.clients.city}`}
                  </p>
                )}
              </div>
            )}

            {/* Items table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unit_price), quote.currency || "EUR")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.total), quote.currency || "EUR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formatCurrency(Number(quote.total_ht), quote.currency || "EUR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  TVA ({Number(quote.tva_rate)}%)
                </span>
                <span>{formatCurrency(tvaAmount, quote.currency || "EUR")}</span>
              </div>
              {Number(quote.discount) > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Remise ({Number(quote.discount)}%)</span>
                  <span>incluse</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}</span>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {quote.notes}
                </p>
              </div>
            )}

            {/* Signature display (when signed) */}
            {(quote.status === "signé" || quote.status === "payé") && quote.signature_data && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-800">
                    Devis signé electroniquement
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <Image
                    src={quote.signature_data}
                    alt="Signature"
                    width={300}
                    height={120}
                    className="max-h-[120px] w-auto"
                    unoptimized
                  />
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-green-700">
                  <p>
                    Signé par : <strong>{quote.signer_name}</strong>
                  </p>
                  {quote.signed_at && (
                    <p>Le {formatDate(quote.signed_at)}</p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Paid success banner */}
            {paidSuccess && quote.status !== "payé" && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Paiement en cours de traitement</p>
                  <p className="text-sm text-green-600">
                    Votre paiement a été reçu et sera confirmé sous quelques instants.
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() =>
                  window.open(`/api/quotes/share/${token}/pdf`, "_blank")
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>

              {/* Paid state */}
              {quote.status === "payé" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 py-3 text-sm font-medium text-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Devis payé
                  </div>
                  {quote.paid_at && (
                    <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-center text-sm text-violet-700">
                      Paiement reçu le {formatDate(quote.paid_at)}
                    </div>
                  )}
                </div>

              ) : quote.status === "refusé" ? (
                <div className="flex items-center justify-center rounded-lg border bg-slate-50 py-3 text-sm text-muted-foreground">
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Devis refusé
                </div>

              ) : quote.status === "accepté" ? (
                <div className="flex items-center justify-center rounded-lg border bg-slate-50 py-3 text-sm text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Devis accepté
                </div>

              ) : showSignature ? (
                /* Signature flow */
                <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Signature electronique</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signer-name">Votre nom complet</Label>
                    <Input
                      id="signer-name"
                      placeholder="Jean Dupont"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Votre signature</Label>
                    <SignatureCanvas onSignatureChange={setSignatureData} />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    En signant, je confirme avoir lu et accepté les termes de ce
                    devis pour un montant de{" "}
                    <strong>
                      {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")} TTC
                    </strong>
                    .
                  </p>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleSign}
                      disabled={responding || !signatureData || !signerName.trim()}
                    >
                      {responding ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Signer et accepter
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSignature(false)}
                      disabled={responding}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>

              ) : (
                /* Main actions: Pay + Sign + Refuse */
                <div className="flex flex-col gap-3">
                  {/* Pay button — always visible for envoyé/signé */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    onClick={handlePayment}
                    disabled={payLoading}
                  >
                    {payLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    Payer {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")} maintenant
                  </Button>

                  {/* Sign/Refuse — only for envoyé */}
                  {quote.status === "envoyé" && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowSignature(true)}
                        disabled={responding}
                      >
                        <PenLine className="mr-2 h-4 w-4" />
                        Accepter et signer
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handleRefuse}
                        disabled={responding}
                      >
                        {responding ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Refuser
                      </Button>
                    </div>
                  )}

                  {/* Signed badge */}
                  {quote.status === "signé" && (
                    <div className="flex items-center justify-center rounded-lg border bg-slate-50 py-2 text-sm text-muted-foreground">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Devis signé
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Propulsé par Devizly
        </p>
      </div>
    </div>
  );
}
