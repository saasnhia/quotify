"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RelanceModalProps {
  quoteId: string;
  clientName: string;
  variant?: "icon" | "button" | "menu";
}

export function RelanceModal({
  quoteId,
  clientName,
  variant = "button",
}: RelanceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [to, setTo] = useState("");
  const [generated, setGenerated] = useState(false);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && !generated) {
      setLoading(true);
      try {
        const res = await fetch(`/api/quotes/${quoteId}/relance`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Erreur lors de la generation");
          setOpen(false);
          return;
        }
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        setTo(data.draft.to);
        setGenerated(true);
      } catch {
        toast.error("Erreur reseau");
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Sujet et corps requis");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/relance/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'envoi");
        return;
      }
      toast.success("Relance envoyee avec succes");
      setOpen(false);
      setGenerated(false);
      setSubject("");
      setBody("");
    } catch {
      toast.error("Erreur reseau");
    } finally {
      setSending(false);
    }
  }

  const triggerButton =
    variant === "icon" ? (
      <Button variant="ghost" size="icon" title="Relancer">
        <Send className="h-4 w-4" />
      </Button>
    ) : variant === "menu" ? (
      <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm">
        <Send className="h-4 w-4" />
        Relancer
      </button>
    ) : (
      <Button variant="outline" size="sm">
        <Send className="mr-2 h-4 w-4" />
        Relancer
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Relancer {clientName}
          </DialogTitle>
          <DialogDescription>
            Email pre-redige par IA. Modifiez-le avant d&apos;envoyer.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">
              Redaction en cours par Mistral AI...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Destinataire
              </label>
              <Input value={to} disabled className="bg-slate-50" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sujet</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Message
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={loading || sending}>
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {sending ? "Envoi..." : "Envoyer la relance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
