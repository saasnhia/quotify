import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Logiciel de Devis Gratuit pour Artisans",
  description:
    "Créez vos devis artisan en 2 minutes avec l'IA. Mentions obligatoires, TVA, signature électronique. Logiciel gratuit pour électriciens, plombiers, maçons et tous les métiers du bâtiment.",
  alternates: { canonical: "https://devizly.fr/logiciel-devis-artisan" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Logiciel devis artisan",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de devis gratuit pour artisans du bâtiment.",
  url: "https://devizly.fr/logiciel-devis-artisan",
};

export default function LogicielDevisArtisanPage() {
  return (
    <>
      <JsonLd data={schema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Logiciel de devis gratuit pour artisans
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          En tant qu&apos;artisan — électricien, plombier, maçon, peintre, menuisier ou carreleur — vous
          savez que chaque minute passée sur la paperasse est une minute de perdue sur le chantier.
          Devizly est un logiciel de devis en ligne conçu pour les professionnels du bâtiment qui
          veulent créer des devis conformes à la réglementation française en quelques clics.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La loi française impose des mentions obligatoires strictes sur chaque devis : le numéro
          SIRET de l&apos;entreprise, la date de validité de l&apos;offre, le détail des prestations avec
          prix unitaires et quantités, le taux de TVA applicable (20&nbsp;% standard, 10&nbsp;% pour
          les travaux de rénovation sur des logements de plus de 2 ans, ou 5,5&nbsp;% pour les
          travaux d&apos;amélioration énergétique), ainsi que les conditions de paiement et les éventuels
          acomptes. Oublier une seule de ces mentions peut rendre votre devis contestable.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Avec Devizly, vous décrivez simplement votre prestation — par exemple &laquo;&nbsp;rénovation
          salle de bain complète, pose carrelage sol et murs, remplacement baignoire par douche
          italienne&nbsp;&raquo; — et l&apos;intelligence artificielle structure automatiquement votre devis
          avec toutes les lignes de postes, les prix marché comme point de départ, et les mentions
          légales obligatoires. Vous gardez bien sûr le contrôle total : chaque ligne, chaque tarif,
          chaque description est modifiable avant l&apos;envoi.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le devis est ensuite envoyé par email ou partagé par lien direct. Votre client peut le
          consulter sur son téléphone, le signer électroniquement sans créer de compte, et même verser
          un acompte par carte bancaire. Vous suivez tout depuis votre tableau de bord : devis en
          attente, signés, payés. Plus besoin de relancer manuellement — Devizly envoie des relances
          automatiques à J+2, J+5 et J+7 si le client n&apos;a pas répondu.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Que vous soyez artisan en micro-entreprise avec franchise de TVA ou entreprise au réel,
          Devizly s&apos;adapte à votre régime fiscal. Le logiciel gère la mention &laquo;&nbsp;TVA non
          applicable, article 293 B du CGI&nbsp;&raquo; pour les auto-entrepreneurs, et calcule
          automatiquement la TVA pour les autres régimes. Vos factures sont générées automatiquement
          après signature, avec une numérotation séquentielle conforme.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Devis en 2 minutes</h3>
            <p className="mt-2 text-sm text-slate-400">
              Décrivez votre prestation, l&apos;IA structure tout. Mentions légales incluses automatiquement.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Conforme loi française</h3>
            <p className="mt-2 text-sm text-slate-400">
              TVA 10&nbsp;%/20&nbsp;%, SIRET, conditions de paiement, garantie décennale — tout est inclus.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Signature + paiement</h3>
            <p className="mt-2 text-sm text-slate-400">
              Votre client signe et paie depuis son téléphone. Acompte Stripe intégré.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Un devis artisan est-il obligatoire ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui, pour tout travail dont le montant dépasse 150&nbsp;€ TTC, un devis écrit est
                obligatoire avant le début des travaux. Pour les dépannages et réparations, le devis
                est obligatoire au-delà de 150&nbsp;€. En dessous, le professionnel doit informer le
                client du caractère payant de la prestation et de son prix avant exécution.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quelle est la durée de validité d&apos;un devis ?
              </h3>
              <p className="mt-2 text-slate-400">
                La loi ne fixe pas de durée minimale, mais il est recommandé d&apos;indiquer une durée
                de validité de 30 à 90 jours. Devizly ajoute automatiquement une durée de validité de
                30 jours sur chaque devis. Passé ce délai, le professionnel n&apos;est plus engagé par
                les prix indiqués.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment faire signer un devis à distance ?
              </h3>
              <p className="mt-2 text-slate-400">
                Avec Devizly, envoyez votre devis par email ou partagez un lien. Votre client le
                consulte sur son navigateur et le signe électroniquement d&apos;un simple geste sur
                l&apos;écran. La signature a valeur juridique et est horodatée.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Prêt à gagner du temps sur vos devis ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Créez votre premier devis artisan en 2 minutes. Gratuit, sans CB.
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
          <Link href="/devis-batiment-gratuit" className="text-violet-400 hover:text-violet-300">Devis bâtiment gratuit</Link>
          <span className="text-slate-600">·</span>
          <Link href="/devis-auto-entrepreneur" className="text-violet-400 hover:text-violet-300">Devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/creer-devis-en-ligne" className="text-violet-400 hover:text-violet-300">Créer devis en ligne</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/mentions-obligatoires-devis-artisan" className="text-emerald-400 hover:text-emerald-300">Mentions obligatoires sur un devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/tva-devis-facture-artisan" className="text-emerald-400 hover:text-emerald-300">TVA sur devis et factures artisan</Link>
        </div>
      </article>
    </>
  );
}
