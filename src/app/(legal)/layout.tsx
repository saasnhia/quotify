import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <div className="ml-auto">
            <Link href="/">
              <DevizlyLogo width={100} height={28} />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>

      {/* Mini footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-foreground">
              CGV
            </Link>
            <Link href="/cgu" className="hover:text-foreground">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
