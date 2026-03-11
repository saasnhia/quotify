"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Copy, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  checkoutUrl: string | null;
}

export function InvoiceActions({
  invoiceId,
  status,
  checkoutUrl,
}: InvoiceActionsProps) {
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur envoi");
      }

      toast.success("Facture envoyée par email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur envoi");
    } finally {
      setSending(false);
    }
  }

  function handleCopyLink() {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success("Lien de paiement copié");
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        asChild
        title="Télécharger PDF"
      >
        <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener noreferrer">
          <Download className="mr-1 h-3 w-3" />
          PDF
        </a>
      </Button>

      {(status === "draft" || status === "sent") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleSend}
          disabled={sending}
          title="Envoyer par email"
        >
          <Send className="mr-1 h-3 w-3" />
          {sending ? "..." : "Envoyer"}
        </Button>
      )}

      {checkoutUrl && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleCopyLink}
            title="Copier le lien de paiement"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            asChild
            title="Ouvrir le lien de paiement"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </>
      )}
    </div>
  );
}
