import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Logiciel Devis Gratuit en Ligne",
  description:
    "Créez vos devis professionnels en 2 minutes avec l'IA. Signature électronique, paiement Stripe, relances automatiques. Essai gratuit — sans CB.",
  alternates: { canonical: "https://devizly.fr" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Devizly est-il gratuit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, plan gratuit avec 3 devis/mois, sans CB.",
      },
    },
    {
      "@type": "Question",
      name: "Comment créer un devis en ligne ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inscrivez-vous sur devizly.fr, renseignez les infos client et l'IA génère le devis en 2 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Devizly fonctionne-t-il sur mobile ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, accessible sur tout navigateur mobile.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je envoyer des factures ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, facturation automatique après signature du devis.",
      },
    },
    {
      "@type": "Question",
      name: "Est-ce conforme à la loi française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, mentions légales obligatoires, TVA, numérotation séquentielle.",
      },
    },
    {
      "@type": "Question",
      name: "Comment recevoir un paiement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Via Stripe Connect intégré directement dans le devis.",
      },
    },
  ],
};

export default async function Page() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    readingTime: p.readingTime,
  }));

  return (
    <>
      <JsonLd data={faqSchema} />
      <LandingPage recentPosts={recentPosts} />
    </>
  );
}
