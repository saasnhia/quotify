import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Devizly — Conseils Devis et Facturation",
  description:
    "Conseils pratiques pour freelances, artisans et auto-entrepreneurs : devis, facturation, TVA, mentions légales, relances clients.",
  alternates: { canonical: "https://devizly.fr/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Artisans: "bg-amber-500/20 text-amber-300",
  Freelances: "bg-violet-500/20 text-violet-300",
  "Auto-entrepreneurs": "bg-emerald-500/20 text-emerald-300",
  Juridique: "bg-blue-500/20 text-blue-300",
  Comptabilité: "bg-rose-500/20 text-rose-300",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={130} height={34} className="text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Blog{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Devizly
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Conseils pratiques pour freelances, artisans et auto-entrepreneurs :
            devis, facturation, TVA, mentions légales et bonnes pratiques.
          </p>
        </div>

        {/* Posts grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-violet-400/40 hover:bg-white/[0.05]"
            >
              {/* Category */}
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[post.category] || "bg-slate-500/20 text-slate-300"
                }`}
              >
                <Tag className="h-3 w-3" />
                {post.category}
              </span>

              {/* Title */}
              <h2 className="mt-4 text-lg font-semibold leading-snug text-white group-hover:text-violet-300 transition-colors">
                {post.title}
              </h2>

              {/* Description */}
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {post.description}
              </p>

              {/* Meta */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>

              {/* Read more */}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                Lire l&apos;article
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-500 sm:px-6">
          <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
