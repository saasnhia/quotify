import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DevizlyLogo } from "@/components/devizly-logo";
import {
  Sparkles,
  Check,
  X,
  ArrowRight,
  Shield,
  Zap,
  LayoutDashboard,
  FileText,
  Receipt,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Devizly — Devis professionnels par IA pour freelancers",
  description:
    "Générez vos devis en 30 secondes avec l'IA, relancez automatiquement et encaissez plus vite. Essai gratuit 14 jours.",
};

/* ── Data ─────────────────────────────────────────── */

const beforeAfter = [
  { before: "Devis sous Excel ou Word", after: "Devis généré par IA en 30s" },
  { before: "Relances manuelles par email", after: "Relances automatiques J+3 / J+7" },
  { before: "Factures oubliées", after: "Facture créée à la signature" },
  { before: "Pas de visibilité", after: "Pipeline Kanban en temps réel" },
  { before: "Paiement par virement 30 jours", after: "Paiement Stripe intégré" },
];

const features = [
  {
    badge: "IA Française",
    title: "Vos devis en 30 secondes",
    description:
      "Décrivez votre prestation en français, l'IA Mistral génère un devis structuré avec des prix ajustés au marché. Vous gardez le contrôle total.",
    image: "/marketing/screenshot-nouveau.png",
    imageAlt: "Formulaire de création de devis avec IA",
    icon: Sparkles,
  },
  {
    badge: "Pipeline CRM",
    title: "Suivez chaque opportunité",
    description:
      "Visualisez tous vos devis en un coup d'oeil : prospects, envoyés, signés, payés. Déplacez-les en drag & drop.",
    image: "/marketing/final dashboard.png",
    imageAlt: "Dashboard avec pipeline kanban",
    icon: LayoutDashboard,
  },
  {
    badge: "Facturation auto",
    title: "Signez, facturez, encaissez",
    description:
      "Votre client signe depuis son téléphone. La facture est générée et envoyée automatiquement. Le paiement arrive sur votre compte Stripe.",
    image: "/marketing/portail client .png",
    imageAlt: "Portail client avec signature et paiement",
    icon: Receipt,
  },
  {
    badge: "Portail client",
    title: "Un devis pro que vos clients adorent",
    description:
      "Vos clients reçoivent un lien unique vers un portail moderne. Ils consultent le devis, signent et paient — le tout sans créer de compte.",
    image: "/marketing/devis client.png",
    imageAlt: "Portail de consultation du devis côté client",
    icon: FileText,
  },
];

const steps = [
  {
    step: "1",
    title: "Décrivez votre prestation",
    description:
      "En langage naturel : \"Site vitrine 5 pages pour un restaurant\". L'IA comprend votre métier.",
  },
  {
    step: "2",
    title: "Envoyez en un clic",
    description:
      "Par email, WhatsApp ou lien direct. Le client consulte, signe et paie — sans créer de compte.",
  },
  {
    step: "3",
    title: "Facture envoyée automatiquement",
    description:
      "À la signature, Devizly génère la facture, l'envoie et encaisse le paiement Stripe. Vous ne levez pas le petit doigt.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "",
    description: "Pour tester sans engagement",
    features: [
      "3 devis par mois",
      "Génération IA",
      "Templates Devizly (10+)",
      "QR Code + liens publics",
      "Versioning devis",
    ],
    cta: "Commencer gratuit",
    popular: false,
  },
  {
    name: "Pro",
    price: "19",
    period: "/mois HT",
    description: "Pour les indépendants actifs",
    features: [
      "Devis illimités",
      "Tout le plan Gratuit",
      "Signature électronique",
      "Acompte Stripe (30/50%)",
      "Tracking ouvertures",
      "Calendly intégré",
      "Analytics + relances auto",
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "39",
    period: "/mois HT",
    description: "Pour les agences et pros exigeants",
    features: [
      "Devis illimités",
      "Tout le plan Pro",
      "Lead forms (5+ types)",
      "Export CSV comptable",
      "Branding personnalisé",
      "Support prioritaire 24h",
    ],
    cta: "Choisir Business",
    popular: false,
  },
];

const faqs = [
  {
    q: "Est-ce conforme aux exigences légales françaises ?",
    a: "Oui. Devizly génère des devis avec toutes les mentions obligatoires : SIRET, TVA, conditions de paiement, date de validité. L'IA Mistral est hébergée en France.",
  },
  {
    q: "Puis-je importer mes clients existants ?",
    a: "Vous pouvez ajouter vos clients manuellement ou les recevoir via le formulaire de capture intégré. L'import CSV est prévu prochainement.",
  },
  {
    q: "Devizly fonctionne-t-il avec mon logiciel comptable ?",
    a: "Vous pouvez exporter vos factures en CSV compatible avec la plupart des logiciels comptables (Pennylane, Indy, etc.). L'intégration directe arrive bientôt.",
  },
  {
    q: "Combien de devis gratuits par mois ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro (19\u20ac/mois) pour un nombre illimité de devis.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Absolument. Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD. L'IA Mistral est 100% hébergée en France — vos données ne quittent jamais l'UE.",
  },
  {
    q: "Le client a-t-il besoin de créer un compte ?",
    a: "Non. Le client reçoit un lien unique et peut consulter, signer et payer le devis directement depuis son navigateur, sans inscription.",
  },
  {
    q: "Comment fonctionne le paiement intégré ?",
    a: "Devizly utilise Stripe Connect. Votre client paie par carte bancaire. Les fonds arrivent sur votre compte sous 48h. Vous n'avez rien à configurer côté facturation.",
  },
];

/* ── Component ────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Announcement Bar ── */}
      <div className="border-b bg-primary/5 py-2 text-center text-sm">
        <span className="text-muted-foreground">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
          3 devis gratuits/mois &middot; Templates pros inclus &middot; Acompte Stripe
        </span>
      </div>

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={140} height={36} />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#fonctionnalites" className="text-muted-foreground transition-colors hover:text-foreground">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-muted-foreground transition-colors hover:text-foreground">
              Tarifs
            </a>
            <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Essayer gratuitement
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO (above the fold)
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(99,102,241,0.08),transparent)]" />

        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <div>
              <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
                <Sparkles className="mr-1.5 h-3 w-3" />
                IA Mistral — 100% hébergée en France
              </Badge>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                Des devis aux paiements{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  en 2 minutes.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                3 devis gratuits ce mois. Templates pros inclus. Signature
                électronique et acompte Stripe en un clic.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="text-base" asChild>
                  <Link href="/signup">
                    Commencer gratuit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#tarifs">Pricing &mdash; 19€ illimité</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Sans carte bancaire
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Plan gratuit inclus
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Annulable à tout moment
                </span>
              </div>
            </div>

            {/* Right — Product screenshot */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border bg-slate-50 shadow-2xl">
                <Image
                  src="/marketing/final dashboard.png"
                  alt="Dashboard Devizly — pipeline et statistiques"
                  width={800}
                  height={500}
                  className="w-full"
                  priority
                  unoptimized
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 rounded-lg border bg-white px-4 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">Temps moyen</p>
                <p className="text-lg font-bold text-primary">30 secondes</p>
                <p className="text-xs text-muted-foreground">par devis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — SOCIAL PROOF BAR
          ══════════════════════════════════════════════ */}
      <section className="border-y bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Rejoignez les freelancers et indépendants qui gagnent du temps sur leurs devis
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 font-medium">4.9/5</span>
            </div>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              RGPD · Hébergé en France
            </span>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              IA Mistral française
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — BEFORE / AFTER
          ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Le problème</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Les devis vous prennent trop de temps
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Excel, relances manuelles, factures oubliées... Voici ce qui change avec Devizly.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-2">
              <div className="bg-slate-100 px-6 py-3 text-center text-sm font-semibold text-slate-500">
                Avant Devizly
              </div>
              <div className="bg-primary/10 px-6 py-3 text-center text-sm font-semibold text-primary">
                Avec Devizly
              </div>
            </div>
            {/* Rows */}
            {beforeAfter.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${i < beforeAfter.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-center gap-2 px-4 py-3.5 text-sm text-slate-500 sm:px-6">
                  <X className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{row.before}</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/[0.03] px-4 py-3.5 text-sm font-medium sm:px-6">
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  <span>{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — FEATURES SHOWCASE (alternating)
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Tout ce qu&apos;il faut pour convertir plus vite
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              De la génération IA à l&apos;encaissement, Devizly couvre tout le cycle du devis.
            </p>
          </div>

          <div className="mt-16 space-y-20">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:direction-rtl" : ""
                }`}
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <Badge variant="secondary" className="mb-4 text-xs">
                    <feature.icon className="mr-1.5 h-3 w-3" />
                    {feature.badge}
                  </Badge>
                  <h3 className="text-2xl font-bold sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <Button className="mt-6" variant="outline" asChild>
                    <Link href="/signup">
                      Essayer gratuitement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Screenshot */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      width={700}
                      height={440}
                      className="w-full"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — HOW IT WORKS (3 steps)
          ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Comment ça marche</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              3 étapes. Zéro prise de tête.
            </h2>
          </div>

          <div className="relative mt-14">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-6 hidden h-0.5 w-[60%] -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block" />

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.step} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
                    {s.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Essayer maintenant — c&apos;est gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — SOCIAL PROOF (results, not testimonials)
          ══════════════════════════════════════════════ */}
      <section className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white md:p-14">
            <Zap className="mx-auto mb-4 h-10 w-10 opacity-80" />
            <h2 className="text-3xl font-bold md:text-4xl">
              Gagnez 5 heures par semaine
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-300">
              Un devis classique prend 30 à 45 minutes sous Excel. Avec
              Devizly, il est prêt en 30 secondes — avec prix marché, TVA et
              mentions légales. Sur 10 devis par semaine, c&apos;est 5 heures
              récupérées pour vos clients.
            </p>

            <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-extrabold">30s</p>
                <p className="mt-1 text-xs text-slate-400">par devis</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">3x</p>
                <p className="mt-1 text-xs text-slate-400">plus de signatures</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">48h</p>
                <p className="mt-1 text-xs text-slate-400">paiement reçu</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100"
                asChild
              >
                <Link href="/signup">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-slate-400">Sans carte bancaire</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — PRICING
          ══════════════════════════════════════════════ */}
      <section id="tarifs" className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Tarifs</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Commencez gratuitement, évoluez à votre rythme
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Pas de surprise. Pas d&apos;engagement. Changez de plan à tout moment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-1 text-primary-foreground shadow-sm">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col pt-8">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="mt-5">
                    <span className="text-4xl font-extrabold">
                      {plan.price}€
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                    {plan.price === "0" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Gratuit pour toujours
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-8 w-full"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Sans carte bancaire
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — FAQ (accordion)
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold">Questions fréquentes</h2>
          </div>

          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — FINAL CTA
          ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-primary opacity-80" />
          <h2 className="text-3xl font-bold md:text-4xl">
            Prêt à arrêter de perdre du temps sur vos devis ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Créez votre premier devis en 30 secondes avec l&apos;IA. Gratuit,
            sans engagement, sans carte bancaire.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full text-base sm:w-auto" asChild>
              <Link href="/signup">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sans carte bancaire · Accès immédiat · Support français
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="transition-transform hover:scale-105">
              <DevizlyLogo width={120} height={32} />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#fonctionnalites" className="hover:text-foreground">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="hover:text-foreground">
                Tarifs
              </a>
              <a href="#faq" className="hover:text-foreground">
                FAQ
              </a>
              <Link href="/login" className="hover:text-foreground">
                Connexion
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Hébergé en France</span>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-foreground">
              CGV
            </Link>
            <Link href="/cgu" className="hover:text-foreground">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
