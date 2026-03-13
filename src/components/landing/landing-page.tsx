"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { DevizlyLogo } from "@/components/devizly-logo";
import { BetaBanner } from "@/components/landing/beta-banner";
import {
  Sparkles,
  Check,
  ArrowRight,
  Shield,
  Zap,
  FileText,
  Receipt,
  LayoutDashboard,
  PenTool,
  Clock,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Bot,
  Send,
  Play,
  MessageCircle,
  BookOpen,
} from "lucide-react";

/* ══════════════════════════════════════════════════
   ANIMATION VARIANTS
   ══════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */

const professions = [
  "Développeurs Web",
  "Architectes",
  "Consultants",
  "Photographes",
  "Graphistes",
  "Artisans",
  "Coaches",
  "Formateurs",
  "Traducteurs",
  "Community Managers",
  "Rédacteurs",
  "Vidéastes",
];

const stats = [
  { value: 30, suffix: "s", label: "par devis" },
  { value: 3, suffix: "x", label: "plus de signatures" },
  { value: 48, suffix: "h", label: "paiement reçu" },
  { value: 100, suffix: "%", label: "conforme RGPD" },
];

const bentoFeatures = [
  {
    icon: Bot,
    title: "IA Mistral française",
    description:
      "Décrivez votre prestation en langage naturel. L'IA structure votre devis et propose des prix marché comme point de départ — vous ajustez librement chaque ligne, chaque tarif. 100% hébergé en France.",
    large: true,
    gradient: "from-violet-500/20 to-indigo-500/20",
    image: null,
  },
  {
    icon: PenTool,
    title: "Signature électronique",
    description:
      "Votre client signe depuis son téléphone. Valeur juridique, zéro friction.",
    large: false,
    gradient: "from-emerald-500/20 to-teal-500/20",
    image: null,
  },
  {
    icon: LayoutDashboard,
    title: "Pipeline Kanban",
    description:
      "Visualisez chaque opportunité : prospect → envoyé → signé → payé. Drag & drop intuitif.",
    large: false,
    gradient: "from-blue-500/20 to-cyan-500/20",
    image: null,
  },
  {
    icon: Receipt,
    title: "Facturation automatique",
    description:
      "À la signature, la facture est générée, numérotée et envoyée. Export CSV compatible comptable.",
    large: true,
    gradient: "from-orange-500/20 to-amber-500/20",
    image: null,
  },
  {
    icon: CreditCard,
    title: "Acompte Stripe intégré",
    description: "Acompte 30/50%, paiement par carte. Fonds sur votre compte en 48h via Stripe Connect.",
    large: false,
    gradient: "from-purple-500/20 to-pink-500/20",
    image: null,
  },
  {
    icon: Send,
    title: "Relances automatiques",
    description: "J+2, J+5, J+7 — vos clients sont relancés automatiquement. Vous ne levez pas le petit doigt.",
    large: false,
    gradient: "from-rose-500/20 to-red-500/20",
    image: null,
  },
];

const demoSteps = [
  {
    step: "01",
    title: "Décrivez votre prestation",
    description:
      "Tapez en langage naturel, par ex. \"Site vitrine 5 pages pour un restaurant\". L'IA comprend votre métier, structure le devis et propose des prix marché. Vous ajustez chaque ligne à vos tarifs.",
    icon: Sparkles,
    image: "/landing-screens/step-creation.webp",
    imageAlt: "Interface de création de devis avec l'IA Devizly",
    imageWidth: 1000,
    imageHeight: 414,
  },
  {
    step: "02",
    title: "Envoyez en un clic",
    description:
      "Partagez par email, lien direct ou QR code. Suivez chaque devis dans votre pipeline : prospect → envoyé → signé → payé.",
    icon: Send,
    image: "/landing-screens/step-pipeline.webp",
    imageAlt: "Pipeline Kanban de suivi des devis Devizly",
    imageWidth: 1000,
    imageHeight: 475,
  },
  {
    step: "03",
    title: "Encaissez automatiquement",
    description:
      "Votre client signe et paie depuis son navigateur — sans créer de compte. Facture générée, relances auto J+2, J+5, J+7.",
    icon: CreditCard,
    image: "/landing-screens/step-payment.webp",
    imageAlt: "Page de signature et paiement client Devizly",
    imageWidth: 500,
    imageHeight: 673,
  },
];

const plans = [
  {
    name: "Gratuit",
    price: 0,
    period: "",
    description: "Pour tester sans engagement",
    features: [
      "3 devis par mois",
      "Génération IA Mistral",
      "Templates professionnels",
      "QR Code + liens publics",
      "Versioning devis",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: 19,
    period: "/mois HT",
    description: "Pour les indépendants actifs",
    features: [
      "Devis illimités",
      "Tout le plan Gratuit",
      "Signature électronique",
      "Acompte Stripe (30/50%)",
      "Tracking ouvertures",
      "Analytics + relances auto",
      "Facturation PDF",
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Business",
    price: 39,
    period: "/mois HT",
    description: "Pour les agences et pros exigeants",
    features: [
      "Tout le plan Pro",
      "Lead forms (5+ types)",
      "Contrats récurrents",
      "Gestion d'équipe",
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
    a: "Oui. Devizly génère des devis avec toutes les mentions obligatoires : SIRET, TVA, conditions de paiement, date de validité. L'IA Mistral est hébergée en France — vos données ne quittent jamais l'UE.",
  },
  {
    q: "L'IA décide-t-elle de mes prix ?",
    a: "Non. L'IA propose une structure de devis avec des prix marché comme suggestion de départ. Vous gardez le contrôle total : modifiez chaque ligne, chaque tarif, chaque description avant d'envoyer. C'est vous le professionnel, l'IA est juste là pour vous faire gagner du temps.",
  },
  {
    q: "Combien de devis gratuits par mois ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro (19€/mois) pour un nombre illimité.",
  },
  {
    q: "Le client a-t-il besoin de créer un compte ?",
    a: "Non. Le client reçoit un lien unique et peut consulter, signer et payer le devis directement depuis son navigateur, sans inscription.",
  },
  {
    q: "Comment fonctionne le paiement intégré ?",
    a: "Devizly utilise Stripe Connect. Votre client paie par carte bancaire. Les fonds arrivent sur votre compte sous 48h. Vous n'avez rien à configurer côté facturation.",
  },
  {
    q: "Puis-je importer mes clients existants ?",
    a: "Vous pouvez ajouter vos clients manuellement ou les recevoir via le formulaire de capture intégré. L'import CSV est prévu prochainement.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD. L'IA Mistral est 100% hébergée en France.",
  },
  {
    q: "Devizly fonctionne-t-il avec mon logiciel comptable ?",
    a: "Vous pouvez exporter vos factures en CSV compatible avec la plupart des logiciels comptables (Pennylane, Indy, etc.). L'intégration directe arrive bientôt.",
  },
];

/* ══════════════════════════════════════════════════
   SEGMENT CTA MAPPING (A4)
   ══════════════════════════════════════════════════ */

const segmentCopy: Record<string, { hero: string; badge: string }> = {
  graphiste: { hero: "Devis pros pour graphistes", badge: "Designers & créatifs" },
  dev: { hero: "Devis pros pour développeurs", badge: "Développeurs web" },
  consultant: { hero: "Devis pros pour consultants", badge: "Consultants & coachs" },
  artisan: { hero: "Devis pros pour artisans", badge: "Artisans & BTP" },
  photographe: { hero: "Devis pros pour photographes", badge: "Photographes" },
  formateur: { hero: "Devis pros pour formateurs", badge: "Formateurs & coachs" },
};

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-semibold text-white transition-colors hover:text-violet-400 sm:text-lg"
      >
        {question}
        <ChevronDown
          className={`ml-4 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-slate-400 sm:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */

interface RecentPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

export function LandingPage({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
      <LandingPageInner recentPosts={recentPosts} />
    </Suspense>
  );
}

function LandingPageInner({ recentPosts }: { recentPosts: RecentPost[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quotesCount, setQuotesCount] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatShown, setChatShown] = useState(false);

  // Segment personalization (A4)
  const searchParams = useSearchParams();
  const segment = searchParams.get("for") || "";
  const copy = segmentCopy[segment] || null;

  // Stats section intersection observer
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  // Pricing section observer for proactive chat (A2)
  const [pricingRef, pricingInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  // Scroll detection for navbar
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch live quote count
  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((d: { quotes_count: number }) => setQuotesCount(d.quotes_count))
      .catch(() => {});
  }, []);

  // Proactive chat: show after 30s on pricing section
  useEffect(() => {
    if (!pricingInView || chatShown) return;
    const timer = setTimeout(() => {
      setChatShown(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [pricingInView, chatShown]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7C3AED", "#6366F1", "#8B5CF6", "#A78BFA", "#22D3A5"],
    });
  }, []);

  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === "true";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* ══════════════════════════════════════════════
          BETA BANNER
          ══════════════════════════════════════════════ */}
      <BetaBanner />

      {/* ══════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <DevizlyLogo width={130} height={34} className="text-white" />
            {isBeta && (
              <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                bêta
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a
              href="#fonctionnalites"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Fonctionnalités
            </a>
            <a
              href="#tarifs"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-slate-400 transition-colors hover:text-white"
            >
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Essayer gratuitement
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-white/10 bg-[#0A0A0F]/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a
                  href="#fonctionnalites"
                  className="text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a
                  href="#tarifs"
                  className="text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tarifs
                </a>
                <a
                  href="#faq"
                  className="text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-center text-sm font-medium text-white"
                >
                  Essayer gratuitement
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[128px]" />
        <div className="pointer-events-none absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[128px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[128px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
                {copy ? copy.badge : "Propulsé par l\u2019IA Mistral — hébergée en France"}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mx-auto mt-8 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {copy ? (
                <>
                  {copy.hero}.{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    Signez. Encaissez.
                  </span>
                </>
              ) : (
                <>
                  Créez des devis.{" "}
                  <br className="hidden sm:block" />
                  Signez. Encaissez.{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    En 2 minutes.
                  </span>
                </>
              )}
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
            >
              L&apos;IA structure vos devis et propose des prix marché — vous
              ajustez tout à vos tarifs. Vos clients signent et paient en ligne.
              Relances auto, facturation PDF, pipeline Kanban — tout est inclus.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/signup"
                onClick={fireConfetti}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-medium text-white transition-all hover:border-violet-400/40 hover:bg-white/10"
              >
                <Play className="h-4 w-4 text-violet-400 transition-transform group-hover:scale-110" />
                Voir la démo (90s)
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Plan gratuit inclus
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Annulable à tout moment
              </span>
            </motion.div>
          </motion.div>

          {/* Hero screenshot — browser chrome frame */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-16 sm:mt-20"
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-slate-500">
                  devizly.fr/dashboard
                </div>
              </div>
              {/* Screenshot */}
              <div className="overflow-hidden rounded-b-xl border border-t-0 border-white/10">
                <Image
                  src="/landing-screens/hero-dashboard.webp"
                  alt="Tableau de bord Devizly — KPIs, graphiques CA et conversion, liste des devis"
                  width={1400}
                  height={671}
                  className="w-full"
                  priority
                />
              </div>
              {/* Glow behind */}
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-b from-violet-500/15 via-indigo-500/10 to-transparent blur-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LOGO TICKER (professions)
          ══════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-white/[0.02] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
            Utilisé par les indépendants de tous métiers
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0A0A0F] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0A0A0F] to-transparent" />

            <div className="animate-ticker flex gap-12 whitespace-nowrap">
              {[...professions, ...professions].map((p, i) => (
                <span
                  key={i}
                  className="text-sm font-medium text-slate-500/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes ticker {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-ticker {
            animation: ticker 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════
          STATS
          ══════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 sm:py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {statsInView ? (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    suffix={stat.suffix}
                  />
                ) : (
                  `0${stat.suffix}`
                )}
              </p>
              <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          BENTO FEATURES
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-400"
            >
              Fonctionnalités
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Tout ce qu&apos;il faut pour{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                convertir plus vite
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-xl text-slate-400"
            >
              De la génération IA à l&apos;encaissement Stripe, Devizly couvre
              tout le cycle du devis.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {bentoFeatures.map((feat) => (
              <motion.div
                key={feat.title}
                variants={scaleIn}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-violet-400/40 hover:bg-white/[0.05] sm:p-8 ${
                  feat.large ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Gradient glow on hover */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                {/* Animated glow border */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-indigo-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                    <feat.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feat.description}
                  </p>
                  {/* No screenshots */}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DEMO 3 STEPS — Alternating rows
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-20 sm:py-28">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[128px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-400"
            >
              Comment ça marche
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-3xl font-bold sm:text-4xl"
            >
              3 étapes. Zéro prise de tête.
            </motion.h2>
          </motion.div>

          <div className="mt-20 space-y-24 sm:space-y-32">
            {demoSteps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                  i % 2 === 1 ? "md:[direction:rtl]" : ""
                }`}
              >
                {/* Text side */}
                <motion.div
                  variants={fadeUp}
                  className={i % 2 === 1 ? "md:[direction:ltr]" : ""}
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-violet-500/15 text-xl font-black text-white shadow-xl shadow-violet-500/20 backdrop-blur-xl">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </motion.div>

                {/* Screenshot side */}
                <motion.div
                  variants={scaleIn}
                  className={`${i % 2 === 1 ? "md:[direction:ltr]" : ""} ${
                    step.imageWidth < step.imageHeight
                      ? "flex justify-center"
                      : ""
                  }`}
                >
                  <div
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-violet-500/5 transition-all duration-500 hover:border-violet-400/30 hover:shadow-violet-500/15 ${
                      step.imageWidth < step.imageHeight
                        ? "max-w-[320px]"
                        : ""
                    }`}
                  >
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      width={step.imageWidth}
                      height={step.imageHeight}
                      className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {/* Subtle glow on hover */}
                    <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Link
              href="/signup"
              onClick={fireConfetti}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Essayer maintenant — c&apos;est gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF (live counter)
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/10 via-[#0A0A0F] to-indigo-500/10 p-8 text-center sm:p-14"
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 bg-violet-500/10 blur-[100px]" />

            <div className="relative">
              <Zap className="mx-auto mb-4 h-10 w-10 text-violet-400" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Gagnez 5 heures par semaine
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
                Un devis classique prend 30 à 45 minutes sous Excel. Avec
                Devizly, l&apos;IA propose une structure et des prix marché en
                30 secondes — vous personnalisez, ajustez vos tarifs, et envoyez.
              </p>

              {quotesCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium text-emerald-300">
                    {quotesCount.toLocaleString("fr-FR")}+ devis générés par la
                    communauté
                  </span>
                </motion.div>
              )}

              <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-extrabold text-white">30s</p>
                  <p className="mt-1 text-xs text-slate-500">par devis</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">3x</p>
                  <p className="mt-1 text-xs text-slate-500">
                    plus de signatures
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">48h</p>
                  <p className="mt-1 text-xs text-slate-500">paiement reçu</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════ */}
      <section id="tarifs" ref={pricingRef} className="border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-400"
            >
              Tarifs
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-3xl font-bold sm:text-4xl"
            >
              Commencez gratuitement, évoluez à votre rythme
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-lg text-slate-400"
            >
              Pas de surprise. Pas d&apos;engagement. Changez de plan à tout
              moment.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                  plan.popular
                    ? "border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-transparent shadow-xl shadow-violet-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
                      Populaire
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}€
                  </span>
                  {plan.period && (
                    <span className="text-slate-400">{plan.period}</span>
                  )}
                  {plan.price === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Gratuit pour toujours
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-slate-300"
                    >
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  onClick={plan.popular ? fireConfetti : undefined}
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110"
                      : "border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Sans carte bancaire
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-400"
            >
              FAQ
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-3xl font-bold sm:text-4xl"
            >
              Questions fréquentes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeIn}
            className="mt-12"
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DERNIERS ARTICLES
          ══════════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="border-t border-white/5 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-400"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Blog
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-6 text-3xl font-bold sm:text-4xl"
              >
                Derniers articles
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-lg text-slate-400"
              >
                Guides pratiques pour freelances, artisans et indépendants.
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {recentPosts.map((post) => (
                <motion.div key={post.slug} variants={fadeUp}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-violet-500/30 hover:bg-white/10"
                  >
                    <span className="inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-violet-400">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                      {post.description}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                      <span>·</span>
                      <span>{post.readingTime}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
              >
                Voir tous les articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          CTA FINAL
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-[#0F0F1A] to-indigo-500/20 p-10 text-center sm:p-16"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[80px]" />

            <div className="relative">
              <FileText className="mx-auto mb-4 h-10 w-10 text-violet-400" />
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                Prêt à arrêter de perdre du temps
                <br className="hidden sm:block" /> sur vos devis ?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
                Créez votre premier devis en 30 secondes avec l&apos;IA.
                Gratuit, sans engagement, sans carte bancaire.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  onClick={fireConfetti}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
                >
                  Commencer gratuitementement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Sans carte bancaire · Accès immédiat · Support français
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Link href="/" className="transition-transform hover:scale-105">
              <DevizlyLogo width={120} height={32} className="text-white" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <a
                href="#fonctionnalites"
                className="transition-colors hover:text-white"
              >
                Fonctionnalités
              </a>
              <a
                href="#tarifs"
                className="transition-colors hover:text-white"
              >
                Tarifs
              </a>
              <a href="#faq" className="transition-colors hover:text-white">
                FAQ
              </a>
              <Link
                href="/blog"
                className="transition-colors hover:text-white"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="transition-colors hover:text-white"
              >
                Connexion
              </Link>
            </div>

            {/* Solutions SEO */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              <span className="font-medium text-slate-500">Solutions :</span>
              <Link href="/logiciel-devis-artisan" className="transition-colors hover:text-slate-400">Logiciel devis artisan</Link>
              <Link href="/devis-auto-entrepreneur" className="transition-colors hover:text-slate-400">Devis auto-entrepreneur</Link>
              <Link href="/logiciel-facturation-freelance" className="transition-colors hover:text-slate-400">Facturation freelance</Link>
              <Link href="/devis-batiment-gratuit" className="transition-colors hover:text-slate-400">Devis bâtiment</Link>
              <Link href="/creer-devis-en-ligne" className="transition-colors hover:text-slate-400">Créer devis en ligne</Link>
              <Link href="/generateur-devis-ia" className="transition-colors hover:text-slate-400">Générateur devis IA</Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Hébergé en France</span>
            </div>
          </div>

          <div className="my-8 h-px bg-white/5" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              <Link
                href="/mentions-legales"
                className="transition-colors hover:text-slate-400"
              >
                Mentions légales
              </Link>
              <Link
                href="/cgv"
                className="transition-colors hover:text-slate-400"
              >
                CGV
              </Link>
              <Link
                href="/cgu"
                className="transition-colors hover:text-slate-400"
              >
                CGU
              </Link>
              <Link
                href="/confidentialite"
                className="transition-colors hover:text-slate-400"
              >
                Confidentialité
              </Link>
              <Link
                href="/cookies"
                className="transition-colors hover:text-slate-400"
              >
                Cookies
              </Link>
            </div>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          VIDEO DEMO MODAL (A1)
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0A0A0F] shadow-2xl shadow-violet-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
              <video
                autoPlay
                playsInline
                controls
                className="w-full"
              >
                <source src="/marketing/demo-devizly-90s.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          PROACTIVE CHAT WIDGET (A2)
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {chatShown && !chatOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-[#0F0F1A] px-5 py-3 shadow-xl shadow-violet-500/20 transition-all hover:border-violet-400/50 hover:shadow-violet-500/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
              <MessageCircle className="h-5 w-5 text-violet-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Une question sur les tarifs ?</p>
              <p className="text-xs text-slate-400">Je réponds en 2min</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setChatShown(false); }}
              className="ml-1 rounded-full p-1 text-slate-500 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F1A] shadow-2xl shadow-violet-500/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-violet-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20">
                  <MessageCircle className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Devizly</p>
                  <p className="text-xs text-slate-400">Support en ligne</p>
                </div>
              </div>
              <button
                onClick={() => { setChatOpen(false); setChatShown(false); }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-xl bg-white/5 px-4 py-3">
                <p className="text-sm text-slate-300">
                  Bonjour ! Une question sur les tarifs ou les fonctionnalités ? Envoyez-nous un message, on répond en moins de 2 minutes.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem("message") as HTMLInputElement;
                  const email = form.elements.namedItem("email") as HTMLInputElement;
                  if (!input.value.trim() || !email.value.trim()) return;
                  fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.value, message: input.value }),
                  }).then(() => {
                    form.reset();
                    setChatOpen(false);
                    setChatShown(false);
                  }).catch(() => {});
                }}
                className="space-y-3"
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Votre email"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50"
                />
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Votre question..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
