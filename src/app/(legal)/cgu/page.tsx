import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "CGU de Devizly — règles d'utilisation de la plateforme.",
};

export default function CGUPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Conditions Générales d&apos;Utilisation (CGU)</h1>
      <p className="lead">
        Les présentes CGU définissent les règles d&apos;utilisation de la
        plateforme Devizly.
      </p>

      <h2>1. Acceptation des conditions</h2>
      <p>
        L&apos;utilisation de Devizly implique l&apos;acceptation pleine et
        entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions,
        veuillez ne pas utiliser le service.
      </p>

      <h2>2. Description du service</h2>
      <p>
        Devizly est une plateforme SaaS permettant aux freelancers et
        indépendants de :
      </p>
      <ul>
        <li>Générer des devis professionnels à l&apos;aide de l&apos;IA Mistral</li>
        <li>Envoyer, suivre et faire signer des devis en ligne</li>
        <li>Générer automatiquement des factures</li>
        <li>Encaisser des paiements via Stripe</li>
        <li>Gérer un pipeline commercial</li>
        <li>Relancer automatiquement les clients</li>
      </ul>

      <h2>3. Inscription et compte</h2>
      <p>
        L&apos;accès aux services nécessite la création d&apos;un compte.
        L&apos;utilisateur s&apos;engage à :
      </p>
      <ul>
        <li>Fournir des informations exactes et à jour</li>
        <li>Préserver la confidentialité de ses identifiants</li>
        <li>Informer immédiatement Devizly de toute utilisation non autorisée de son compte</li>
      </ul>
      <p>
        L&apos;authentification est gérée via Supabase Auth (email/mot de
        passe). L&apos;utilisateur est seul responsable de la sécurité de son
        mot de passe.
      </p>

      <h2>4. Obligations de l&apos;utilisateur</h2>
      <p>L&apos;utilisateur s&apos;engage à :</p>
      <ul>
        <li>Utiliser le service conformément à sa destination (gestion de devis et facturation professionnelle)</li>
        <li>Ne pas utiliser le service à des fins illicites, frauduleuses ou contraires aux bonnes mœurs</li>
        <li>Vérifier et valider le contenu des devis générés par l&apos;IA avant envoi à ses clients</li>
        <li>Respecter la réglementation en vigueur, notamment en matière de facturation et de TVA</li>
        <li>Ne pas tenter de contourner les limitations techniques du service</li>
        <li>Ne pas procéder à du scraping, reverse-engineering ou toute forme d&apos;extraction automatisée</li>
      </ul>

      <h2>5. Intelligence artificielle</h2>
      <p>
        Devizly utilise le modèle Mistral AI, hébergé en France, pour assister
        la génération de devis. L&apos;utilisateur reconnaît que :
      </p>
      <ul>
        <li>Les suggestions de l&apos;IA sont fournies à titre indicatif</li>
        <li>L&apos;utilisateur reste seul responsable du contenu final de ses devis</li>
        <li>Les données envoyées à Mistral AI sont anonymisées (aucune donnée nominative client n&apos;est transmise)</li>
        <li>Les données ne sont pas utilisées par Mistral AI pour l&apos;entraînement de ses modèles</li>
      </ul>

      <h2>6. Propriété des données</h2>
      <p>
        L&apos;utilisateur reste propriétaire de toutes les données qu&apos;il
        saisit dans Devizly (informations clients, devis, factures). En cas de
        résiliation, l&apos;utilisateur peut exporter ses données au format CSV
        avant la fermeture de son compte.
      </p>

      <h2>7. Disponibilité du service</h2>
      <p>
        Devizly s&apos;efforce d&apos;assurer une disponibilité du service
        24h/24 et 7j/7. Toutefois, l&apos;éditeur ne garantit pas une
        disponibilité ininterrompue et ne pourra être tenu responsable en cas
        de :
      </p>
      <ul>
        <li>Maintenance programmée (avec notification préalable lorsque possible)</li>
        <li>Panne des fournisseurs tiers (Supabase, Vercel, Stripe, Mistral AI)</li>
        <li>Cas de force majeure</li>
      </ul>

      <h2>8. Limitation de responsabilité</h2>
      <p>
        L&apos;éditeur ne pourra être tenu responsable des dommages indirects
        résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser
        le service. La responsabilité totale de l&apos;éditeur est limitée au
        montant des sommes versées par l&apos;utilisateur au cours des 12
        derniers mois.
      </p>

      <h2>9. Suspension et résiliation</h2>
      <p>
        L&apos;éditeur se réserve le droit de suspendre ou supprimer un compte
        utilisateur en cas de :
      </p>
      <ul>
        <li>Violation des présentes CGU</li>
        <li>Utilisation frauduleuse ou abusive du service</li>
        <li>Non-paiement de l&apos;abonnement</li>
      </ul>

      <h2>10. Modification des CGU</h2>
      <p>
        L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout
        moment. Les utilisateurs seront informés par email des modifications
        substantielles. La poursuite de l&apos;utilisation du service après
        modification vaut acceptation des nouvelles CGU.
      </p>

      <h2>11. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige sera
        soumis au Tribunal de Commerce de Chalon-sur-Saône.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
