import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Devizly — informations sur l'éditeur du site.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Mentions légales</h1>
      <p className="lead">
        Conformément aux dispositions des articles 6-III et 19 de la Loi n°
        2004-575 du 21 juin 2004 pour la Confiance dans l&apos;économie
        numérique (LCEN).
      </p>

      <h2>1. Éditeur du site</h2>
      <ul>
        <li>
          <strong>Raison sociale :</strong> [RAISON SOCIALE À COMPLÉTER]
        </li>
        <li>
          <strong>Forme juridique :</strong> SAS en cours d&apos;immatriculation
        </li>
        <li>
          <strong>Capital social :</strong> [À REMPLIR]
        </li>
        <li>
          <strong>Siège social :</strong> 55 rue Henri Clément, 71100 Saint-Rémy
        </li>
        <li>
          <strong>SIRET :</strong> [SIRET À COMPLÉTER APRÈS IMMATRICULATION]
        </li>
        <li>
          <strong>RCS :</strong> [À COMPLÉTER APRÈS IMMATRICULATION]
        </li>
        <li>
          <strong>Numéro de TVA intracommunautaire :</strong> [À COMPLÉTER APRÈS IMMATRICULATION]
        </li>
        <li>
          <strong>Directeur de la publication :</strong> [À REMPLIR]
        </li>
        <li>
          <strong>Email :</strong> privacy@devizly.fr
        </li>
        <li>
          <strong>Téléphone :</strong> [À REMPLIR]
        </li>
      </ul>

      <h2>2. Hébergement</h2>
      <ul>
        <li>
          <strong>Hébergeur :</strong> Vercel Inc.
        </li>
        <li>
          <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis
        </li>
        <li>
          <strong>Site web :</strong> vercel.com
        </li>
      </ul>
      <p>
        La base de données est hébergée par <strong>Supabase</strong> sur des
        serveurs situés dans l&apos;Union européenne (AWS eu-west).
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site Devizly (textes, images, logos,
        icônes, logiciels) est la propriété exclusive de l&apos;éditeur ou de
        ses partenaires et est protégé par les lois françaises et
        internationales relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification ou adaptation, totale
        ou partielle, est interdite sans l&apos;autorisation écrite préalable de
        l&apos;éditeur.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>5. Cookies</h2>
      <p>
        L&apos;utilisation des cookies est décrite dans notre{" "}
        <a href="/cookies">Politique de cookies</a>.
      </p>

      <h2>6. Médiation</h2>
      <p>
        Conformément aux articles L.616-1 et R.616-1 du Code de la
        consommation, en cas de litige non résolu, le consommateur peut recourir
        gratuitement au service de médiation :
      </p>
      <ul>
        <li>
          <strong>Médiateur :</strong> SAS Médiation Solution
        </li>
        <li>
          <strong>Site web :</strong> sasmediationsolution-conso.fr
        </li>
      </ul>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas
        de litige, les tribunaux français seront seuls compétents.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
