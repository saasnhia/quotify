"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface ProspectData {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  estimated_amount: number;
}

interface EditProspectModalProps {
  open: boolean;
  prospect: ProspectData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProspectModal({
  open,
  prospect,
  onClose,
  onSuccess,
}: EditProspectModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    estimated_amount: "",
    notes: "",
  });

  // Pre-fill form when prospect changes
  useEffect(() => {
    if (prospect) {
      setForm({
        name: prospect.name,
        email: prospect.email ?? "",
        company: prospect.company ?? "",
        estimated_amount:
          prospect.estimated_amount > 0
            ? String(prospect.estimated_amount)
            : "",
        notes: prospect.notes ?? "",
      });
    }
  }, [prospect]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    if (!prospect) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          company: form.company.trim() || null,
          estimated_amount: parseFloat(form.estimated_amount) || 0,
          notes: form.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error || "Erreur modification prospect");
      }

      toast.success("Prospect mis à jour");
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de modifier le prospect"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le prospect</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nom *</Label>
            <Input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nom du prospect"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <Label htmlFor="edit-company">Entreprise</Label>
            <Input
              id="edit-company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Nom de l'entreprise"
            />
          </div>

          <div>
            <Label htmlFor="edit-estimated_amount">Montant estimé (€)</Label>
            <Input
              id="edit-estimated_amount"
              name="estimated_amount"
              type="number"
              step="0.01"
              min="0"
              value={form.estimated_amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Détails sur le prospect..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
