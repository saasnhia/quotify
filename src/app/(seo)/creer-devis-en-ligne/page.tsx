import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un Devis en Ligne Gratuit et Professionnel",
  description:
    "Créez un devis professionnel en ligne gratuitement en 2 minutes. Mentions légales automatiques, signature électronique, envoi par email. Sans inscription longue, sans CB.",
  alternates: { canonical: "https://devizly.fr/creer-devis-en-ligne" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Créer devis en ligne",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Outil gratuit pour créer des devis professionnels en ligne.",
  url: "https://devizly.fr/creer-devis-en-ligne",
};

export default function CreerDevisEnLignePage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Créer un devis en ligne gratuit et professionnel
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          Vous cherchez un moyen rapide et fiable de créer des devis en ligne ? Que vous soyez
          freelance, artisan, consultant ou dirigeant de PME, Devizly vous permet de générer des
          devis professionnels conformes à la réglementation française en quelques minutes, sans
          installation de logiciel et sans connaissances techniques.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Créer un devis avec Devizly se fait en trois étapes simples. Première étape : décrivez
          votre prestation en langage naturel. Par exemple, tapez &laquo;&nbsp;refonte graphique
          d&apos;un site e-commerce, 15 pages, avec charte graphique et déclinaison mobile&nbsp;&raquo;.
          L&apos;intelligence artificielle analyse votre description et structure automatiquement le
          devis en lignes de postes détaillées, avec des prix marché comme suggestion de départ.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Deuxième étape : personnalisez le devis. Vous ajustez chaque ligne — description,
          quantité, prix unitaire — selon vos tarifs. Ajoutez les coordonnées de votre client
          (ou sélectionnez-le dans votre base clients existante). Les mentions légales obligatoires
          sont automatiquement renseignées : votre SIRET, le taux de TVA applicable, les conditions
          de paiement, la durée de validité de l&apos;offre (30 jours par défaut), les pénalités de
          retard et l&apos;indemnité forfaitaire de recouvrement.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Troisième étape : envoyez et suivez. Le devis est envoyé par email avec un lien de
          consultation personnalisé. Votre client peut le consulter depuis son ordinateur ou son
          téléphone, sans créer de compte. Il signe électroniquement d&apos;un geste sur l&apos;écran.
          Vous recevez une notification instantanée. Si le client ne répond pas, Devizly envoie
          automatiquement des relances à J+2, J+5 et J+7. Le paiement par carte bancaire est
          intégré : votre client peut verser un acompte de 30 ou 50&nbsp;% directement depuis le devis.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Un devis professionnel est un outil commercial puissant. Il reflète votre sérieux et votre
          professionnalisme. Avec Devizly, chaque devis est visuellement soigné, structuré et
          conforme. Votre logo, vos couleurs et vos coordonnées apparaissent en en-tête. Le PDF
          généré est exportable et imprimable. Vous pouvez également partager le devis par QR code,
          idéal lors de rendez-vous clients ou de salons professionnels.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">3 étapes, 2 minutes</h3>
            <p className="mt-2 text-sm text-slate-400">
              Décrivez, personnalisez, envoyez. Votre devis est prêt en 2 minutes chrono.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Mentions légales auto</h3>
            <p className="mt-2 text-sm text-slate-400">
              SIRET, TVA, conditions de paiement, validité — tout est conforme automatiquement.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Suivi en temps réel</h3>
            <p className="mt-2 text-sm text-slate-400">
              Notifications d&apos;ouverture, relances auto, pipeline de suivi Kanban.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quelles mentions obligatoires sur un devis ?
              </h3>
              <p className="mt-2 text-slate-400">
                Un devis doit comporter : la date, l&apos;identité du professionnel (nom, SIRET,
                adresse), l&apos;identité du client, le détail des prestations avec prix unitaires et
                quantités, le taux de TVA, les montants HT et TTC, les conditions de paiement, la
                durée de validité et les pénalités de retard.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment envoyer un devis par email ?
              </h3>
              <p className="mt-2 text-slate-400">
                Avec Devizly, cliquez sur &laquo;&nbsp;Envoyer&nbsp;&raquo; après avoir créé votre
                devis. Le client reçoit un email avec un lien de consultation. Il peut visualiser,
                signer et payer directement depuis son navigateur. Vous pouvez aussi copier le lien
                pour l&apos;envoyer via WhatsApp ou autre messagerie.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Un devis engage-t-il le professionnel ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui. Un devis signé par le client engage le professionnel à réaliser la prestation
                aux conditions et prix indiqués, pendant la durée de validité du devis. Le
                professionnel ne peut modifier le prix ou les conditions sans l&apos;accord du client.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Créez votre premier devis maintenant
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Inscription en 30 secondes. Premier devis en 2 minutes. Gratuit.
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
          <Link href="/generateur-devis-ia" className="text-violet-400 hover:text-violet-300">Générateur devis IA</Link>
          <span className="text-slate-600">·</span>
          <Link href="/devis-auto-entrepreneur" className="text-violet-400 hover:text-violet-300">Devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis-artisan" className="text-violet-400 hover:text-violet-300">Devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/devis-signe-valeur-juridique" className="text-emerald-400 hover:text-emerald-300">Valeur juridique d&apos;un devis signé</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/mentions-obligatoires-devis-artisan" className="text-emerald-400 hover:text-emerald-300">Mentions obligatoires sur un devis</Link>
        </div>
      </article>
    </>
  );
}
