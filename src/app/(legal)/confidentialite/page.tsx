import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Devizly — traitement des données personnelles conforme RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Politique de confidentialité</h1>
      <p className="lead">
        Devizly s&apos;engage à protéger la vie privée de ses utilisateurs
        conformément au Règlement Général sur la Protection des Données (RGPD)
        et à la loi Informatique et Libertés.
      </p>

      <h2>1. Responsable du traitement</h2>
      <ul>
        <li>
          <strong>Raison sociale :</strong> [RAISON SOCIALE À COMPLÉTER]
        </li>
        <li>
          <strong>Siège social :</strong> 55 rue Henri Clément, 71100 Saint-Rémy
        </li>
        <li>
          <strong>Email DPO :</strong> privacy@devizly.fr
        </li>
      </ul>

      <h2>2. Données collectées</h2>

      <h3>2.1 Données des utilisateurs (freelancers)</h3>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email, nom, prénom</td>
            <td>Création et gestion du compte</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>SIRET, adresse professionnelle</td>
            <td>Mentions obligatoires sur devis/factures</td>
            <td>Obligation légale</td>
          </tr>
          <tr>
            <td>Données de connexion (IP, user-agent)</td>
            <td>Sécurité, détection de fraude</td>
            <td>Intérêt légitime</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Données des clients finaux</h3>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nom, email, téléphone</td>
            <td>Envoi de devis et factures</td>
            <td>Intérêt légitime du freelancer</td>
          </tr>
          <tr>
            <td>Adresse</td>
            <td>Mentions obligatoires facturation</td>
            <td>Obligation légale</td>
          </tr>
          <tr>
            <td>Signature électronique</td>
            <td>Preuve d&apos;acceptation du devis</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Consultation de devis (date, IP)</td>
            <td>Suivi de lecture</td>
            <td>Intérêt légitime</td>
          </tr>
        </tbody>
      </table>

      <h3>2.3 Données de paiement</h3>
      <p>
        Les données de carte bancaire sont traitées exclusivement par{" "}
        <strong>Stripe</strong> (certifié PCI-DSS niveau 1). Devizly ne stocke
        jamais de numéro de carte bancaire.
      </p>

      <h2>3. Intelligence artificielle — Mistral AI</h2>
      <p>
        Devizly utilise l&apos;API Mistral AI pour la génération de devis. Voici
        les garanties appliquées :
      </p>
      <ul>
        <li>
          <strong>Hébergement :</strong> 100% en France (serveurs Mistral AI)
        </li>
        <li>
          <strong>Anonymisation :</strong> les données envoyées à Mistral sont
          anonymisées — aucun nom de client, email ou donnée nominative n&apos;est
          transmis. Seules les descriptions de prestations et paramètres
          commerciaux sont envoyés.
        </li>
        <li>
          <strong>Pas d&apos;entraînement :</strong> les données transmises à
          Mistral AI ne sont <strong>pas utilisées pour l&apos;entraînement</strong>{" "}
          de ses modèles, conformément aux conditions de leur API professionnelle.
        </li>
        <li>
          <strong>Rétention :</strong> Mistral AI ne conserve pas les données
          au-delà du traitement de la requête.
        </li>
      </ul>

      <h2>4. Sous-traitants</h2>
      <p>
        Devizly fait appel aux sous-traitants suivants pour le traitement de
        données personnelles. Des <strong>clauses contractuelles types</strong>{" "}
        (CCT) sont en place pour chaque sous-traitant situé hors de l&apos;UE.
      </p>
      <table>
        <thead>
          <tr>
            <th>Sous-traitant</th>
            <th>Fonction</th>
            <th>Localisation</th>
            <th>Garanties</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Base de données, authentification</td>
            <td>UE (AWS eu-west)</td>
            <td>DPA, chiffrement au repos et en transit</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Hébergement application</td>
            <td>International (CDN)</td>
            <td>DPA, clauses contractuelles types</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Paiement en ligne</td>
            <td>International</td>
            <td>PCI-DSS niveau 1, DPA, clauses contractuelles types</td>
          </tr>
          <tr>
            <td>Mistral AI</td>
            <td>Génération de devis par IA</td>
            <td>France</td>
            <td>API professionnelle, pas d&apos;entraînement sur les données</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Envoi d&apos;emails transactionnels</td>
            <td>International</td>
            <td>DPA, clauses contractuelles types</td>
          </tr>
          <tr>
            <td>Upstash</td>
            <td>Rate limiting (Redis)</td>
            <td>UE</td>
            <td>DPA, données éphémères uniquement</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Durée de conservation</h2>
      <table>
        <thead>
          <tr>
            <th>Données</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Compte utilisateur</td>
            <td>Durée du compte + 3 ans après suppression</td>
          </tr>
          <tr>
            <td>Devis et factures</td>
            <td>10 ans (obligation légale comptable)</td>
          </tr>
          <tr>
            <td>Données de paiement</td>
            <td>13 mois (Stripe, obligation PCI)</td>
          </tr>
          <tr>
            <td>Logs de connexion</td>
            <td>12 mois</td>
          </tr>
          <tr>
            <td>Données de prospects (formulaire)</td>
            <td>3 ans sans interaction</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Accès :</strong> obtenir une copie de vos données personnelles
        </li>
        <li>
          <strong>Rectification :</strong> corriger des données inexactes
        </li>
        <li>
          <strong>Effacement :</strong> demander la suppression de vos données
          (sous réserve des obligations légales de conservation)
        </li>
        <li>
          <strong>Portabilité :</strong> recevoir vos données dans un format
          structuré (CSV)
        </li>
        <li>
          <strong>Opposition :</strong> vous opposer au traitement fondé sur
          l&apos;intérêt légitime
        </li>
        <li>
          <strong>Limitation :</strong> demander la limitation du traitement
        </li>
      </ul>
      <p>
        Pour exercer vos droits, contactez-nous à : <strong>privacy@devizly.fr</strong>
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la CNIL :{" "}
        <a
          href="https://www.cnil.fr/fr/plaintes"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.cnil.fr
        </a>
      </p>

      <h2>7. Sécurité</h2>
      <p>Devizly met en œuvre les mesures techniques suivantes :</p>
      <ul>
        <li>Chiffrement HTTPS/TLS pour toutes les communications</li>
        <li>Chiffrement au repos des données en base (Supabase/AWS)</li>
        <li>Row Level Security (RLS) — chaque utilisateur n&apos;accède qu&apos;à ses propres données</li>
        <li>Authentification sécurisée (Supabase Auth, hachage bcrypt)</li>
        <li>Rate limiting sur les endpoints publics (Upstash Redis)</li>
        <li>Tokens de partage à usage unique pour les devis partagés</li>
      </ul>

      <h2>8. Transferts hors UE</h2>
      <p>
        Certains sous-traitants (Vercel, Stripe, Resend) opèrent
        internationalement. Des <strong>clauses contractuelles types</strong>{" "}
        (CCT) approuvées par la Commission européenne encadrent ces transferts
        conformément aux articles 46 et 49 du RGPD.
      </p>

      <h2>9. Modifications</h2>
      <p>
        Cette politique peut être mise à jour. En cas de modification
        substantielle, les utilisateurs seront informés par email. La date de
        dernière mise à jour figure en bas de cette page.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
