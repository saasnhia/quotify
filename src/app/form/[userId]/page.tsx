"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, FileText } from "lucide-react";

interface FormSettings {
  title: string;
  description: string | null;
  color: string;
  companyName: string;
}

export default function LeadFormPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/form/${userId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Formulaire indisponible");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSettings(data);
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/form/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      alert("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Formulaire indisponible</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "Ce formulaire n'est plus disponible."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${settings.color}15` }}
            >
              <CheckCircle className="h-8 w-8" style={{ color: settings.color }} />
            </div>
            <p className="text-xl font-semibold">Demande envoyée</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {settings.companyName} reviendra vers vous rapidement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${settings.color}15` }}
          >
            <FileText className="h-6 w-6" style={{ color: settings.color }} />
          </div>
          <CardTitle className="text-xl">{settings.title}</CardTitle>
          {settings.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {settings.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {settings.companyName}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Décrivez votre besoin</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bonjour, j'aimerais un devis pour..."
                rows={4}
              />
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: settings.color }}
              disabled={submitting || !name.trim() || !email.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Envoyer ma demande
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Vos données sont traitées conformément au RGPD uniquement pour
              la gestion de cette demande.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
