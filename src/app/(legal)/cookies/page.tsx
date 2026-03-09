import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Politique de cookies de Devizly — cookies essentiels uniquement.",
};

export default function CookiesPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Politique de cookies</h1>
      <p className="lead">
        Devizly utilise uniquement des cookies strictement nécessaires au
        fonctionnement du service. Aucun cookie publicitaire ou de tracking
        n&apos;est déposé.
      </p>

      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte stocké sur votre navigateur
        lorsque vous visitez un site web. Les cookies permettent au site de
        mémoriser vos préférences et de fonctionner correctement.
      </p>

      <h2>2. Cookies utilisés par Devizly</h2>

      <h3>2.1 Cookies strictement nécessaires</h3>
      <p>
        Ces cookies sont indispensables au fonctionnement du site et ne peuvent
        pas être désactivés. Conformément à la directive ePrivacy et aux
        recommandations de la CNIL, ils ne nécessitent pas de consentement.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Finalité</th>
            <th>Durée</th>
            <th>Émetteur</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-*-auth-token</td>
            <td>Session d&apos;authentification Supabase</td>
            <td>Session / 7 jours</td>
            <td>Supabase</td>
          </tr>
          <tr>
            <td>cookie-consent</td>
            <td>Mémorisation du choix de consentement cookies</td>
            <td>6 mois</td>
            <td>Devizly</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Cookies tiers</h3>
      <p>
        Devizly n&apos;utilise <strong>aucun</strong> cookie de :
      </p>
      <ul>
        <li>Publicité ou remarketing</li>
        <li>Tracking cross-site</li>
        <li>Réseaux sociaux</li>
        <li>Analytics (Google Analytics, etc.)</li>
      </ul>

      <h3>2.3 Cookies Stripe</h3>
      <p>
        Lors d&apos;un paiement, Stripe peut déposer des cookies techniques
        nécessaires à la sécurité de la transaction (détection de fraude). Ces
        cookies sont soumis à la{" "}
        <a
          href="https://stripe.com/fr/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          politique de confidentialité de Stripe
        </a>
        .
      </p>

      <h2>3. Gestion des cookies</h2>
      <p>
        Vous pouvez à tout moment gérer ou supprimer les cookies via les
        paramètres de votre navigateur :
      </p>
      <ul>
        <li>Chrome : Paramètres → Confidentialité et sécurité → Cookies</li>
        <li>Firefox : Paramètres → Vie privée et sécurité → Cookies</li>
        <li>Safari : Préférences → Confidentialité → Cookies</li>
        <li>Edge : Paramètres → Cookies et autorisations de site</li>
      </ul>
      <p>
        <strong>Note :</strong> la suppression des cookies d&apos;authentification
        nécessitera une reconnexion à votre compte.
      </p>

      <h2>4. Base légale</h2>
      <p>
        Conformément à l&apos;article 82 de la loi Informatique et Libertés et
        aux lignes directrices de la CNIL du 17 septembre 2020 :
      </p>
      <ul>
        <li>
          Les cookies strictement nécessaires sont exemptés de consentement
          (article 82 alinéa 2)
        </li>
        <li>
          Aucun cookie soumis à consentement n&apos;est déposé sur Devizly
        </li>
      </ul>

      <h2>5. Contact</h2>
      <p>
        Pour toute question relative aux cookies, contactez-nous à :{" "}
        <strong>privacy@devizly.fr</strong>
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
