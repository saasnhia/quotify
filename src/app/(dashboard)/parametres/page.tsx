"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Save, Loader2, CreditCard, Building, ExternalLink, Upload, Trash2, ImageIcon, Wallet, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ParametresPage() {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [stripeConnectStatus, setStripeConnectStatus] = useState("not_connected");
  const [connectLoading, setConnectLoading] = useState(false);
  const [automations, setAutomations] = useState({
    auto_invoice_on_sign: true,
    auto_invoice_on_payment: true,
    auto_send_invoice: true,
  });
  const [profile, setProfile] = useState({
    full_name: "",
    company_name: "",
    company_address: "",
    company_siret: "",
    company_phone: "",
    default_tva_rate: "20",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata) {
        setProfile({
          full_name: user.user_metadata.full_name || "",
          company_name: user.user_metadata.company_name || "",
          company_address: user.user_metadata.company_address || "",
          company_siret: user.user_metadata.company_siret || "",
          company_phone: user.user_metadata.company_phone || "",
          default_tva_rate: user.user_metadata.default_tva_rate || "20",
        });
      }

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, logo_url, stripe_connect_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) {
        setSubscriptionStatus(data.subscription_status);
      }
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
      if (data?.stripe_connect_status) {
        setStripeConnectStatus(data.stripe_connect_status);
      }
    }
    loadProfile();

    async function loadAutomations() {
      try {
        const res = await fetch("/api/settings/automations");
        if (res.ok) {
          const data = await res.json();
          setAutomations(data);
        }
      } catch {
        // Use defaults
      }
    }
    loadAutomations();
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (PNG, JPEG)");
      return;
    }
    if (file.size > 500_000) {
      toast.error("Logo trop volumineux (500KB max)");
      return;
    }

    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await fetch("/api/admin/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: dataUrl }),
      });
      if (res.ok) {
        setLogoUrl(dataUrl);
        toast.success("Logo mis à jour");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur upload");
      }
      setLogoLoading(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleLogoDelete() {
    setLogoLoading(true);
    const res = await fetch("/api/admin/logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_url: null }),
    });
    if (res.ok) {
      setLogoUrl(null);
      toast.success("Logo supprimé");
    }
    setLogoLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: profile });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Paramètres sauvegardés");
    }
    setLoading(false);
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleAutomationToggle(
    field: "auto_invoice_on_sign" | "auto_invoice_on_payment" | "auto_send_invoice"
  ) {
    const newValue = !automations[field];
    setAutomations((prev) => ({ ...prev, [field]: newValue }));

    try {
      const res = await fetch("/api/settings/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error();
      toast.success("Paramètre mis à jour");
    } catch {
      setAutomations((prev) => ({ ...prev, [field]: !newValue }));
      toast.error("Erreur de sauvegarde");
    }
  }

  const planLabel =
    subscriptionStatus === "business"
      ? "Business"
      : subscriptionStatus === "pro"
        ? "Pro"
        : "Free";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Profil & Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo upload */}
            <div className="space-y-2">
              <Label>Logo entreprise (PDF & devis)</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative h-12 w-24 rounded border bg-white p-1">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-24 items-center justify-center rounded border border-dashed bg-slate-50">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logoLoading}
                    onClick={() =>
                      document.getElementById("logo-input")?.click()
                    }
                  >
                    {logoLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {logoUrl ? "Changer" : "Uploader"}
                  </Button>
                  {logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoDelete}
                      disabled={logoLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PNG ou JPEG, 500KB max. Apparaît sur vos PDF.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de l&apos;entreprise</Label>
              <Input
                value={profile.company_name}
                onChange={(e) =>
                  setProfile({ ...profile, company_name: e.target.value })
                }
                placeholder="Ma Société SAS"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={profile.company_address}
                onChange={(e) =>
                  setProfile({ ...profile, company_address: e.target.value })
                }
                placeholder="123 rue de la Paix, 75001 Paris"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input
                  value={profile.company_siret}
                  onChange={(e) =>
                    setProfile({ ...profile, company_siret: e.target.value })
                  }
                  placeholder="123 456 789 00012"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={profile.company_phone}
                  onChange={(e) =>
                    setProfile({ ...profile, company_phone: e.target.value })
                  }
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Taux de TVA par défaut</Label>
              <Select
                value={profile.default_tva_rate}
                onValueChange={(v) =>
                  setProfile({ ...profile, default_tva_rate: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plan {planLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionStatus === "free"
                      ? "3 devis/mois"
                      : subscriptionStatus === "pro"
                        ? "50 devis/mois"
                        : "Devis illimités"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    subscriptionStatus === "free"
                      ? ""
                      : "bg-green-100 text-green-700"
                  }
                >
                  {planLabel}
                </Badge>
              </div>
            </div>

            {subscriptionStatus !== "free" ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Gérer mon abonnement
              </Button>
            ) : (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Pro</p>
                      <p className="text-sm text-muted-foreground">
                        50 devis/mois + IA avancée
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">19€<span className="text-sm font-normal text-muted-foreground">/mois HT</span></p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div>
                      <p className="font-medium">Business</p>
                      <p className="text-sm text-muted-foreground">
                        Devis illimités + Signature
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">49€<span className="text-sm font-normal text-muted-foreground">/mois HT</span></p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <a href="/pricing">Voir les tarifs</a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect — Onboarding optimise conversion comptables */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-[#1e40af]/[0.03] pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#1e40af]" />
            Encaissement automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {stripeConnectStatus === "connected" ? (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">
                    Paiements actifs
                  </p>
                  <p className="text-sm text-green-700">
                    Vos clients paient en ligne. Les fonds arrivent sur votre
                    compte Stripe sous 2 jours.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Voir mes encaissements
                </a>
              </Button>
            </>
          ) : (
            <>
              {/* Benefit block */}
              <div className="rounded-xl border border-[#1e40af]/20 bg-[#1e40af]/[0.03] p-5">
                <p className="text-base font-semibold text-[#1e40af]">
                  Vos clients signent et paient en un clic
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  L&apos;argent arrive directement sur votre compte. Sans
                  relance, sans attente.
                </p>

                {/* Trust pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Virement sous 48h
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Carte bancaire
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    100% securise
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full bg-[#1e40af] text-base font-semibold hover:bg-[#1e3a8a]"
                size="lg"
                disabled={connectLoading}
                onClick={() => {
                  setConnectLoading(true);
                  window.location.href = "/api/stripe/connect/authorize";
                }}
              >
                {connectLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-5 w-5" />
                )}
                Connecter Stripe
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Gratuit. Configuration en 2 minutes.
              </p>

              {stripeConnectStatus === "pending" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-700">
                  Configuration en cours — finalisez sur Stripe pour activer
                  les paiements.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Automations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Automations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          {/* Auto-invoice on sign */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">
                Générer une facture à la signature
              </p>
              <p className="text-xs text-muted-foreground">
                Une facture est créée automatiquement dès qu&apos;un client signe votre devis.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={automations.auto_invoice_on_sign}
              onClick={() => handleAutomationToggle("auto_invoice_on_sign")}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                automations.auto_invoice_on_sign ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.auto_invoice_on_sign ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Auto-invoice on payment */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">
                Générer un reçu au paiement
              </p>
              <p className="text-xs text-muted-foreground">
                Un reçu est généré automatiquement après chaque paiement Stripe.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={automations.auto_invoice_on_payment}
              onClick={() => handleAutomationToggle("auto_invoice_on_payment")}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                automations.auto_invoice_on_payment ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.auto_invoice_on_payment ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Auto-send invoice email */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">
                Envoyer automatiquement par email
              </p>
              <p className="text-xs text-muted-foreground">
                Les factures sont envoyées sans action manuelle de votre part.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={automations.auto_send_invoice}
              onClick={() => handleAutomationToggle("auto_send_invoice")}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                automations.auto_send_invoice ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.auto_send_invoice ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
