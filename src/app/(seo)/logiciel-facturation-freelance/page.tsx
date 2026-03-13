import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Logiciel de Facturation pour Freelance Gratuit",
  description:
    "Logiciel de facturation gratuit pour freelances. Devis, factures, relances automatiques, paiement Stripe intégré. Conforme loi française. Essai gratuit sans CB.",
  alternates: { canonical: "https://devizly.fr/logiciel-facturation-freelance" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Facturation freelance",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de facturation gratuit pour freelances et indépendants français.",
  url: "https://devizly.fr/logiciel-facturation-freelance",
};

export default function LogicielFacturationFreelancePage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Logiciel de facturation freelance — simple et gratuit
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          Être freelance, c&apos;est conjuguer expertise métier et gestion administrative. Entre la
          prospection, la réalisation des missions et le suivi client, la facturation est souvent
          reléguée en fin de journée — quand elle n&apos;est pas tout simplement oubliée. Devizly est
          un logiciel de facturation conçu pour les freelances français qui veulent être payés plus
          vite, sans y passer des heures.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le processus est simple : vous créez un devis à partir d&apos;une description en langage
          naturel, l&apos;IA structure les lignes de postes et ajoute les mentions légales
          obligatoires. Votre client reçoit le devis par email, le consulte et le signe
          électroniquement. Dès la signature, Devizly génère automatiquement la facture
          correspondante avec une numérotation séquentielle conforme aux exigences fiscales françaises.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La loi française impose des mentions strictes sur chaque facture de freelance : nom ou
          raison sociale, adresse, SIRET, numéro de facture séquentiel, date d&apos;émission, détail
          des prestations, prix unitaire HT, montant total HT et TTC, taux de TVA (ou mention de
          franchise de TVA pour les auto-entrepreneurs), conditions et délais de paiement, et
          pénalités de retard. Les factures doivent être conservées pendant 10 ans. Devizly gère
          toutes ces obligations automatiquement.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Les relances client sont un point de friction majeur pour les freelances. Selon une étude
          de la Fédération des auto-entrepreneurs, 30&nbsp;% des factures de freelances sont payées
          en retard. Devizly automatise les relances : à J+2, J+5 et J+7 après l&apos;envoi, votre
          client reçoit un rappel poli par email. Vous pouvez aussi activer les relances par SMS
          pour les clients qui ne répondent pas aux emails.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le paiement est intégré directement dans le devis grâce à Stripe Connect. Votre client
          paie par carte bancaire en un clic, et les fonds arrivent sur votre compte sous 48 heures.
          Plus besoin de communiquer votre RIB ou d&apos;attendre un virement. Pour les missions
          récurrentes, vous pouvez programmer des factures mensuelles automatiques avec Devizly.
          L&apos;export CSV compatible avec les logiciels comptables (Pennylane, Indy, etc.) facilite
          votre déclaration fiscale.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Devis → facture auto</h3>
            <p className="mt-2 text-sm text-slate-400">
              Dès la signature du devis, la facture est générée avec numérotation conforme.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Relances automatiques</h3>
            <p className="mt-2 text-sm text-slate-400">
              J+2, J+5, J+7 — vos clients sont relancés par email et SMS sans effort.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Paiement en 48h</h3>
            <p className="mt-2 text-sm text-slate-400">
              Paiement par carte intégré via Stripe Connect. Fonds sous 48h.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment facturer en freelance ?
              </h3>
              <p className="mt-2 text-slate-400">
                Après acceptation de votre devis, vous émettez une facture comportant les mentions
                obligatoires (SIRET, numéro séquentiel, détail des prestations, TVA, conditions de
                paiement). Devizly automatise ce processus : la facture est générée dès la signature
                du devis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Faut-il facturer avec ou sans TVA ?
              </h3>
              <p className="mt-2 text-slate-400">
                Si vous êtes en franchise de TVA (auto-entrepreneur sous les seuils), vos factures
                sont en HT uniquement avec la mention &laquo;&nbsp;TVA non applicable, art. 293 B du
                CGI&nbsp;&raquo;. Au-delà des seuils ou si vous avez opté pour la TVA, vous facturez
                TTC avec le taux applicable (20&nbsp;% pour les services).
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quel est le délai de paiement légal ?
              </h3>
              <p className="mt-2 text-slate-400">
                Le délai de paiement légal entre professionnels est de 30 jours à compter de la
                réception de la facture, extensible à 60 jours ou 45 jours fin de mois par accord
                contractuel. Au-delà, des pénalités de retard sont dues de plein droit.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Facturez sans friction, encaissez plus vite
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Créez votre premier devis freelance en 2 minutes. Gratuit, sans CB.
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
          <Link href="/devis-auto-entrepreneur" className="text-violet-400 hover:text-violet-300">Devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/creer-devis-en-ligne" className="text-violet-400 hover:text-violet-300">Créer devis en ligne</Link>
          <span className="text-slate-600">·</span>
          <Link href="/generateur-devis-ia" className="text-violet-400 hover:text-violet-300">Générateur devis IA</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/facturation-freelance-guide-2026" className="text-emerald-400 hover:text-emerald-300">Facturation freelance : guide 2026</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/relance-client-devis-non-repondu" className="text-emerald-400 hover:text-emerald-300">Relancer un client après un devis</Link>
        </div>
      </article>
    </>
  );
}
