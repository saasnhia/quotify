import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Générateur de Devis IA Gratuit",
  description:
    "Générez vos devis professionnels par intelligence artificielle en 2 minutes. L'IA structure vos prestations, ajoute les mentions légales. Gratuit, hébergé en France.",
  alternates: { canonical: "https://devizly.fr/generateur-devis-ia" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Générateur devis IA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Générateur de devis par intelligence artificielle, gratuit et hébergé en France.",
  url: "https://devizly.fr/generateur-devis-ia",
};

export default function GenerateurDevisIAPage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Générateur de devis par intelligence artificielle
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          Et si vous pouviez créer un devis complet simplement en décrivant votre prestation en
          quelques mots ? C&apos;est exactement ce que propose Devizly : un générateur de devis
          propulsé par l&apos;intelligence artificielle qui transforme une description en langage
          naturel en un devis professionnel structuré, conforme et prêt à envoyer.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le fonctionnement est simple et intuitif. Vous tapez une description de votre prestation
          dans la zone de texte — par exemple &laquo;&nbsp;développement d&apos;une application
          mobile iOS et Android pour une startup fintech, authentification biométrique, dashboard
          admin, intégration API bancaire, maintenance 6 mois&nbsp;&raquo;. L&apos;IA analyse votre
          description, identifie les différentes composantes de la prestation, et génère
          automatiquement un devis structuré avec des lignes de postes détaillées.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Chaque ligne comprend une description claire, une quantité (en jours, heures ou unités)
          et un prix unitaire basé sur les tarifs marché observés pour ce type de prestation. Ces
          prix sont des suggestions de départ : vous gardez le contrôle total et pouvez modifier
          chaque ligne, chaque tarif, chaque description. L&apos;IA est un assistant, pas un
          décideur. C&apos;est vous le professionnel, vous fixez vos prix.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          L&apos;IA de Devizly comprend les spécificités de nombreux métiers : développement web et
          mobile, design graphique, architecture, photographie, conseil, formation, BTP, services
          à la personne, communication, marketing digital, rédaction, traduction, et bien d&apos;autres.
          Elle adapte la structure du devis au contexte du métier : un devis de développement web
          aura des postes différents d&apos;un devis de rénovation de salle de bain.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Côté technique, l&apos;IA est hébergée en France, conformément aux exigences RGPD. Vos
          descriptions de prestations et les données de vos clients sont anonymisées avant d&apos;être
          envoyées au modèle. Aucune donnée personnelle n&apos;est utilisée pour entraîner le modèle.
          La génération prend entre 10 et 30 secondes selon la complexité de la prestation. Vous
          pouvez régénérer le devis autant de fois que nécessaire, ou partir d&apos;un template
          existant et demander à l&apos;IA de l&apos;adapter.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Devis en 30 secondes</h3>
            <p className="mt-2 text-sm text-slate-400">
              Décrivez en langage naturel, l&apos;IA génère un devis structuré instantanément.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">100% personnalisable</h3>
            <p className="mt-2 text-sm text-slate-400">
              Modifiez chaque ligne, chaque tarif. L&apos;IA propose, vous décidez.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Hébergé en France</h3>
            <p className="mt-2 text-sm text-slate-400">
              IA conforme RGPD. Données anonymisées. Aucune utilisation pour l&apos;entraînement.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment fonctionne l&apos;IA de Devizly ?
              </h3>
              <p className="mt-2 text-slate-400">
                Vous décrivez votre prestation en langage naturel (comme vous le feriez par email).
                L&apos;IA analyse la description, identifie les composantes de la prestation, et
                génère un devis structuré avec des lignes de postes détaillées, des quantités et des
                prix marché comme point de départ. Tout est modifiable ensuite.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Le devis généré par IA est-il personnalisable ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui, à 100&nbsp;%. L&apos;IA génère une première version que vous pouvez entièrement
                modifier : descriptions, quantités, prix unitaires, remises, conditions. Vous pouvez
                ajouter ou supprimer des lignes. Le devis final reflète exactement ce que vous
                souhaitez proposer à votre client.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Le générateur de devis IA est-il gratuit ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui. Le plan gratuit de Devizly inclut la génération IA pour 3 devis par mois, sans
                carte bancaire et sans engagement. Les plans payants offrent un nombre illimité de
                devis et des fonctionnalités avancées (signature électronique, relances automatiques,
                paiement intégré).
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Testez le générateur de devis IA
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Créez votre premier devis avec l&apos;IA en 30 secondes. Gratuit, sans CB.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Internal links */}
        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Voir aussi :</span>
          <Link href="/creer-devis-en-ligne" className="text-violet-400 hover:text-violet-300">Créer devis en ligne</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-facturation-freelance" className="text-violet-400 hover:text-violet-300">Facturation freelance</Link>
          <span className="text-slate-600">·</span>
          <Link href="/devis-auto-entrepreneur" className="text-violet-400 hover:text-violet-300">Devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/relance-client-devis-non-repondu" className="text-emerald-400 hover:text-emerald-300">Relancer un client après un devis</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/devis-signe-valeur-juridique" className="text-emerald-400 hover:text-emerald-300">Valeur juridique d&apos;un devis signé</Link>
        </div>
      </article>
    </>
  );
}
