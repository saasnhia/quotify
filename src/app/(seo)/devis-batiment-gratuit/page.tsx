import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Devis Bâtiment Gratuit en Ligne",
  description:
    "Créez vos devis bâtiment gratuits en ligne en 2 minutes. TVA travaux 10%/20%, garantie décennale, acompte Stripe. Logiciel conforme pour entreprises du BTP.",
  alternates: { canonical: "https://devizly.fr/devis-batiment-gratuit" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Devis bâtiment",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de devis bâtiment gratuit pour entreprises du BTP.",
  url: "https://devizly.fr/devis-batiment-gratuit",
};

export default function DevisBatimentGratuitPage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Créez vos devis bâtiment gratuitement en ligne
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          Le secteur du bâtiment est l&apos;un des plus exigeants en matière de devis. Entre les
          différents taux de TVA, les assurances obligatoires, les conditions de retractation et les
          multiples corps de métier intervenant sur un chantier, rédiger un devis conforme peut
          prendre des heures. Devizly simplifie radicalement ce processus pour les professionnels du
          BTP : décrivez vos travaux, l&apos;IA génère un devis structuré avec tous les postes et
          mentions obligatoires.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le devis bâtiment est un document contractuel encadré par la loi. Il doit impérativement
          contenir : l&apos;identité complète de l&apos;entreprise (raison sociale, SIRET, adresse,
          numéro d&apos;assurance décennale et nom de l&apos;assureur), la date du devis et sa durée
          de validité, la description détaillée de chaque prestation (nature des travaux, matériaux
          utilisés, quantités, prix unitaires HT), les frais de déplacement éventuels, le taux de
          TVA applicable, le montant total HT et TTC, les conditions de paiement, et le droit de
          rétractation de 14 jours pour les travaux à domicile.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La TVA dans le bâtiment est particulièrement complexe. Le taux normal de 20&nbsp;%
          s&apos;applique aux constructions neuves. Le taux intermédiaire de 10&nbsp;% concerne les
          travaux d&apos;amélioration, de transformation et d&apos;entretien sur des logements achevés
          depuis plus de 2 ans. Le taux réduit de 5,5&nbsp;% s&apos;applique aux travaux
          d&apos;amélioration de la performance énergétique (isolation, chaudière, pompe à chaleur).
          Devizly gère automatiquement ces différents taux et vous aide à appliquer le bon taux selon
          la nature des travaux.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Les acomptes sont une pratique courante et recommandée dans le bâtiment. Devizly intègre
          le paiement d&apos;acompte directement dans le devis : votre client peut verser 30&nbsp;%
          ou 50&nbsp;% du montant total par carte bancaire lors de la signature. Les fonds sont
          versés sur votre compte via Stripe Connect sous 48 heures. Cette fonctionnalité sécurise
          votre trésorerie et engage le client avant le début des travaux.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La garantie décennale est obligatoire pour tous les professionnels du bâtiment. Son numéro
          et le nom de l&apos;assureur doivent figurer sur chaque devis. Devizly vous permet de
          renseigner ces informations une seule fois dans votre profil, et elles sont
          automatiquement ajoutées sur tous vos devis. De même, les mentions relatives à la
          médiation, aux pénalités de retard et aux conditions générales sont gérées automatiquement.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">TVA BTP automatique</h3>
            <p className="mt-2 text-sm text-slate-400">
              TVA 5,5&nbsp;%, 10&nbsp;% ou 20&nbsp;% selon la nature des travaux. Calcul automatique.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Acompte intégré</h3>
            <p className="mt-2 text-sm text-slate-400">
              Acompte 30/50&nbsp;% payable par carte bancaire directement dans le devis.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Décennale incluse</h3>
            <p className="mt-2 text-sm text-slate-400">
              Numéro de garantie décennale et assureur ajoutés automatiquement.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Que doit contenir un devis bâtiment ?
              </h3>
              <p className="mt-2 text-slate-400">
                Un devis bâtiment doit contenir : l&apos;identité de l&apos;entreprise (SIRET,
                adresse, assurance décennale), la date et durée de validité, le détail des travaux
                poste par poste (nature, matériaux, quantités, prix unitaires), le taux de TVA, les
                montants HT et TTC, les conditions de paiement et le droit de rétractation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quand s&apos;applique la TVA réduite pour travaux ?
              </h3>
              <p className="mt-2 text-slate-400">
                La TVA à 10&nbsp;% s&apos;applique aux travaux de rénovation sur des logements
                achevés depuis plus de 2 ans (résidence principale ou secondaire). La TVA à
                5,5&nbsp;% concerne spécifiquement les travaux d&apos;amélioration énergétique
                (isolation, fenêtres, chauffage performant).
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Un devis signé vaut-il contrat ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui. Un devis signé par le client avec la mention &laquo;&nbsp;bon pour accord&nbsp;&raquo;
                engage les deux parties. Il fait office de contrat et oblige le professionnel à
                réaliser les travaux aux conditions prévues, et le client à en payer le prix. Toute
                modification doit faire l&apos;objet d&apos;un avenant signé.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Des devis bâtiment conformes en 2 minutes
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Créez votre premier devis BTP maintenant. Gratuit, sans CB.
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
          <Link href="/logiciel-devis-artisan" className="text-violet-400 hover:text-violet-300">Logiciel devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/creer-devis-en-ligne" className="text-violet-400 hover:text-violet-300">Créer devis en ligne</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-facturation-freelance" className="text-violet-400 hover:text-violet-300">Facturation freelance</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/modele-devis-batiment-gratuit" className="text-emerald-400 hover:text-emerald-300">Modèle de devis bâtiment gratuit</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/tva-devis-facture-artisan" className="text-emerald-400 hover:text-emerald-300">TVA sur devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/acompte-devis-regles-2026" className="text-emerald-400 hover:text-emerald-300">Acompte sur devis : règles 2026</Link>
        </div>
      </article>
    </>
  );
}
