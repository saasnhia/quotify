import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { JsonLd } from "@/components/seo/json-ld";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowLeft, ArrowRight, Clock, Tag, ChevronRight } from "lucide-react";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    try {
      const post = getPostBySlug(slug);
      return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `https://devizly.fr/blog/${slug}` },
        openGraph: {
          title: post.title,
          description: post.description,
          type: "article",
          publishedTime: post.date,
          url: `https://devizly.fr/blog/${slug}`,
        },
      };
    } catch {
      return { title: "Article introuvable" };
    }
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Devizly" },
    publisher: {
      "@type": "Organization",
      name: "Devizly",
      url: "https://devizly.fr",
    },
    mainEntityOfPage: `https://devizly.fr/blog/${slug}`,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <JsonLd data={articleSchema} />

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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="hover:text-white transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-400">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300"
          >
            <Tag className="h-3 w-3" />
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
        </header>

        {/* MDX content */}
        <article className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300 prose-strong:text-white prose-li:text-slate-300 prose-ul:text-slate-300 prose-ol:text-slate-300">
          <MDXRemote source={post.content} />
        </article>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold">
            Créez vos devis gratuitement avec Devizly
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            L&apos;IA structure votre devis en 2 minutes. Mentions légales
            conformes, signature électronique, paiement intégré.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Back to blog */}
        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold">Articles similaires</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-violet-400/40 hover:bg-white/[0.05]"
                >
                  <h3 className="text-sm font-semibold leading-snug text-white group-hover:text-violet-300 transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(r.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-500 sm:px-6">
          <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
