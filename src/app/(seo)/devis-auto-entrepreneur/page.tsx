import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un Devis Auto-Entrepreneur Gratuit",
  description:
    "Créez vos devis auto-entrepreneur conformes en 2 minutes. Franchise TVA, mentions obligatoires, SIRET. Logiciel gratuit et simple pour micro-entrepreneurs.",
  alternates: { canonical: "https://devizly.fr/devis-auto-entrepreneur" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Devis auto-entrepreneur",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de devis gratuit pour auto-entrepreneurs et micro-entreprises.",
  url: "https://devizly.fr/devis-auto-entrepreneur",
};

export default function DevisAutoEntrepreneurPage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Devis auto-entrepreneur : créez vos devis gratuitement
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          En tant qu&apos;auto-entrepreneur (micro-entrepreneur), vous devez fournir des devis
          conformes à vos clients avant chaque prestation. Mais entre la gestion administrative, la
          prospection et la réalisation des missions, le temps manque souvent pour créer des devis
          professionnels. Devizly vous permet de générer des devis conformes en quelques minutes,
          directement depuis votre navigateur.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le statut d&apos;auto-entrepreneur implique des spécificités comptables importantes pour
          vos devis. Si vous bénéficiez de la franchise en base de TVA (chiffre d&apos;affaires
          inférieur à 36&nbsp;800&nbsp;€ pour les prestations de services ou 91&nbsp;900&nbsp;€ pour
          les activités commerciales), vous devez impérativement mentionner sur chaque devis et
          facture : &laquo;&nbsp;TVA non applicable, article 293&nbsp;B du CGI&nbsp;&raquo;. Cette
          mention est automatiquement ajoutée par Devizly lorsque vous configurez votre profil en
          micro-entreprise.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Un devis d&apos;auto-entrepreneur doit obligatoirement comporter : votre nom et prénom (ou
          raison sociale), votre numéro SIRET, votre adresse professionnelle, la date du devis, sa
          durée de validité, le détail des prestations avec prix unitaires, le montant total HT
          (identique au TTC en franchise de TVA), les conditions et délais de paiement, ainsi que les
          conditions de révision du prix. Ces mentions sont encadrées par le Code de la consommation
          et le Code de commerce.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Avec Devizly, il vous suffit de décrire votre prestation en langage naturel — par exemple
          &laquo;&nbsp;création d&apos;un site vitrine 5 pages pour un restaurant, avec formulaire de
          réservation&nbsp;&raquo; — et l&apos;IA génère automatiquement un devis structuré avec
          toutes les lignes de postes et les mentions légales obligatoires. Vous personnalisez ensuite
          chaque ligne à vos tarifs. Le devis est envoyé par email avec un lien de signature
          électronique : votre client signe depuis son téléphone sans créer de compte.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La facturation est tout aussi simple. Dès que votre client signe le devis, Devizly génère
          automatiquement la facture correspondante avec une numérotation séquentielle conforme aux
          exigences de l&apos;administration fiscale. Vous pouvez exporter vos factures en CSV pour
          votre comptabilité ou votre déclaration URSSAF. Le paiement par carte bancaire est intégré
          via Stripe Connect : votre client paie directement depuis le devis, et les fonds arrivent
          sur votre compte sous 48 heures.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Franchise TVA gérée</h3>
            <p className="mt-2 text-sm text-slate-400">
              Mention &laquo;&nbsp;Article 293 B du CGI&nbsp;&raquo; ajoutée automatiquement sur chaque devis.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Mentions obligatoires</h3>
            <p className="mt-2 text-sm text-slate-400">
              SIRET, conditions de paiement, durée de validité — tout est conforme automatiquement.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Facture auto</h3>
            <p className="mt-2 text-sm text-slate-400">
              Facture générée après signature. Numérotation séquentielle conforme.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Un auto-entrepreneur doit-il faire des devis ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui, le devis est obligatoire pour toute prestation de services dont le montant
                dépasse 150&nbsp;€ TTC. Même en dessous de ce seuil, il est fortement recommandé
                pour se protéger en cas de litige. Le devis signé par le client fait office de
                contrat et engage les deux parties.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quelles sont les mentions obligatoires ?
              </h3>
              <p className="mt-2 text-slate-400">
                Un devis de micro-entrepreneur doit comporter : vos nom et prénom, adresse, SIRET, la
                date, la description détaillée des prestations, les prix unitaires et total, la
                mention de franchise de TVA (&laquo;&nbsp;TVA non applicable, art. 293 B du
                CGI&nbsp;&raquo;), les conditions de paiement et la durée de validité de l&apos;offre.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment facturer en auto-entrepreneur ?
              </h3>
              <p className="mt-2 text-slate-400">
                Après acceptation du devis, vous émettez une facture avec les mêmes mentions
                obligatoires, plus un numéro de facture séquentiel unique. Devizly génère
                automatiquement la facture après signature du devis, avec la bonne numérotation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Simplifiez vos devis d&apos;auto-entrepreneur
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Créez votre premier devis conforme en 2 minutes. Gratuit, sans CB.
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
          <Link href="/logiciel-facturation-freelance" className="text-violet-400 hover:text-violet-300">Facturation freelance</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis-artisan" className="text-violet-400 hover:text-violet-300">Devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/generateur-devis-ia" className="text-violet-400 hover:text-violet-300">Générateur devis IA</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/devis-auto-entrepreneur-guide-complet" className="text-emerald-400 hover:text-emerald-300">Guide complet du devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/facturation-freelance-guide-2026" className="text-emerald-400 hover:text-emerald-300">Facturation freelance 2026</Link>
        </div>
      </article>
    </>
  );
}
