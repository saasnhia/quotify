"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Star,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

/* ── Plan data ───────────────────────────────────── */

type PlanFeature = {
  text: string;
  free: boolean;
  pro: boolean;
  business: boolean;
};

const comparisonFeatures: PlanFeature[] = [
  { text: "Devis par mois", free: false, pro: false, business: false },
  { text: "Génération IA", free: true, pro: true, business: true },
  { text: "Templates Devizly (10+)", free: true, pro: true, business: true },
  { text: "Gestion clients", free: true, pro: true, business: true },
  { text: "Partage par lien + QR Code", free: true, pro: true, business: true },
  { text: "Versioning devis", free: true, pro: true, business: true },
  { text: "Signature électronique", free: false, pro: true, business: true },
  { text: "Acompte Stripe (30/50%)", free: false, pro: true, business: true },
  { text: "Tracking ouvertures email", free: false, pro: true, business: true },
  { text: "Calendly intégré", free: false, pro: true, business: true },
  { text: "Export PDF personnalisé", free: false, pro: true, business: true },
  { text: "Analytics devis", free: false, pro: true, business: true },
  { text: "Relances automatiques", free: false, pro: true, business: true },
  { text: "Lead forms (5+ types)", free: false, pro: false, business: true },
  { text: "Export CSV comptable", free: false, pro: false, business: true },
  { text: "Branding personnalisé", free: false, pro: false, business: true },
  { text: "Support prioritaire 24h", free: false, pro: false, business: true },
];

const devisLimits: Record<string, string> = {
  free: "3",
  pro: "Illimités",
  business: "Illimités",
};

const plans = [
  {
    id: "free" as const,
    name: "Gratuit",
    monthlyPrice: "0",
    annualPrice: "0",
    description: "Pour tester sans engagement",
    highlight: null,
    cta: "Commencer gratuit",
    priceId: null,
    popular: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    monthlyPrice: "19",
    annualPrice: "15",
    description: "Pour les indépendants actifs",
    highlight: "Populaire",
    cta: "Choisir Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || null,
    popular: true,
  },
  {
    id: "business" as const,
    name: "Business",
    monthlyPrice: "39",
    annualPrice: "31",
    description: "Pour les agences et pros exigeants",
    highlight: null,
    cta: "Choisir Business",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || null,
    popular: false,
  },
];

const faqs = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement, au prorata du temps restant.",
  },
  {
    q: "Comment fonctionne le plan gratuit ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro pour un nombre illimité de devis.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon quota ?",
    a: "Vous recevrez une notification et pourrez upgrader votre plan en un clic. Vos devis existants restent accessibles.",
  },
  {
    q: "Comment annuler mon abonnement ?",
    a: "Depuis la page Paramètres ou via le bouton \"Gérer l'abonnement\" ci-dessus. L'annulation prend effet à la fin de la période en cours.",
  },
];

const guarantees = [
  { icon: Shield, text: "Annulation à tout moment" },
  { icon: Zap, text: "Activation instantanée" },
  { icon: Star, text: "Satisfait ou remboursé 30j" },
];

/* ── Component ───────────────────────────────────── */

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) {
        setCurrentPlan(data.subscription_status);
      }
    }
    loadProfile();
  }, []);

  async function handleCheckout(priceId: string, planId: string) {
    setLoadingPlan(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Erreur de paiement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setLoadingPlan("portal");
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
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <div className="text-center">
        <Badge variant="outline" className="mb-3">
          Tarifs simples et transparents
        </Badge>
        <h1 className="text-3xl font-bold">
          Choisissez le plan adapté à votre activité
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Commencez gratuitement. Évoluez quand vous êtes prêt.
          Sans engagement, sans surprise.
        </p>
      </div>

      {/* ── Annual/Monthly toggle ── */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Mensuel
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isAnnual ? "bg-primary" : "bg-muted"
          }`}
          aria-label="Basculer entre mensuel et annuel"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAnnual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Annuel
        </span>
        {isAnnual && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            -20%
          </Badge>
        )}
      </div>

      {/* ── Plan cards ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const savingsPercent =
            plan.monthlyPrice !== "0"
              ? Math.round(
                  (1 -
                    Number(plan.annualPrice) / Number(plan.monthlyPrice)) *
                    100
                )
              : 0;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-shadow hover:shadow-md ${
                plan.popular
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : isCurrent
                    ? "border-green-400 ring-1 ring-green-200"
                    : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary px-3 py-1 text-primary-foreground shadow-sm">
                    {plan.highlight}
                  </Badge>
                </div>
              )}
              {isCurrent && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500 px-3 py-1 text-white shadow-sm">
                    Votre plan actuel
                  </Badge>
                </div>
              )}

              <CardContent className="flex flex-1 flex-col pt-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-5">
                  <span className="text-4xl font-extrabold">{price}€</span>
                  {price !== "0" && (
                    <span className="text-muted-foreground">/mois HT</span>
                  )}
                  {price === "0" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Gratuit pour toujours
                    </p>
                  )}
                  {isAnnual && savingsPercent > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      soit {Number(plan.annualPrice) * 12}€/an{" "}
                      <span className="font-semibold text-green-600">
                        (-{savingsPercent}%)
                      </span>
                    </p>
                  )}
                  {!isAnnual && plan.monthlyPrice !== "0" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ou {plan.annualPrice}€/mois en annuel
                    </p>
                  )}
                </div>

                {/* Quick feature highlights */}
                <ul className="mt-6 flex-1 space-y-2.5">
                  <li className="flex items-center gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 shrink-0 text-green-600" />
                    {devisLimits[plan.id]} devis/mois
                  </li>
                  {comparisonFeatures.slice(1).map((f) => {
                    const included =
                      f[plan.id as keyof Pick<PlanFeature, "free" | "pro" | "business">];
                    return (
                      <li
                        key={f.text}
                        className="flex items-center gap-2 text-sm"
                      >
                        {included ? (
                          <Check className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span
                          className={included ? "" : "text-muted-foreground"}
                        >
                          {f.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  {isCurrent ? (
                    currentPlan !== "free" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={handlePortal}
                        disabled={loadingPlan === "portal"}
                      >
                        {loadingPlan === "portal" && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Gérer l&apos;abonnement
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled
                      >
                        Plan actuel
                      </Button>
                    )
                  ) : plan.priceId ? (
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleCheckout(plan.priceId!, plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      {plan.cta}
                    </Button>
                  )}
                  {plan.priceId && !isCurrent && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Sans engagement — annulez à tout moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Guarantees bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-lg border bg-slate-50 p-4">
        {guarantees.map((g) => (
          <div
            key={g.text}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <g.icon className="h-4 w-4 text-primary" />
            {g.text}
          </div>
        ))}
      </div>

      {/* ── Feature comparison table ── */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold">
          Comparaison détaillée des plans
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Fonctionnalité
                </th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className={`px-4 py-3 text-center font-semibold ${
                      p.popular ? "text-primary" : ""
                    }`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Devis limit row */}
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">
                  Devis par mois
                </td>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className="px-4 py-3 text-center font-medium"
                  >
                    {devisLimits[p.id]}
                  </td>
                ))}
              </tr>
              {/* Boolean feature rows */}
              {comparisonFeatures.slice(1).map((f, i) => (
                <tr
                  key={f.text}
                  className={i < comparisonFeatures.length - 2 ? "border-b" : ""}
                >
                  <td className="px-4 py-3 text-muted-foreground">{f.text}</td>
                  {(["free", "pro", "business"] as const).map((planId) => (
                    <td key={planId} className="px-4 py-3 text-center">
                      {f[planId] ? (
                        <Check className="mx-auto h-4 w-4 text-green-600" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Price row */}
              <tr className="border-t bg-slate-50">
                <td className="px-4 py-3 font-medium">Prix</td>
                {plans.map((p) => {
                  const price = isAnnual ? p.annualPrice : p.monthlyPrice;
                  return (
                    <td
                      key={p.id}
                      className={`px-4 py-3 text-center font-bold ${
                        p.popular ? "text-primary" : ""
                      }`}
                    >
                      {price}€
                      {price !== "0" ? "/mois" : ""}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      {/* ── FAQ ── */}
      <div>
        <div className="mb-6 flex items-center justify-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">Questions fréquentes</h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-lg border bg-white p-5"
            >
              <h3 className="text-sm font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
