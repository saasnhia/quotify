import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devizly.fr";

export const metadata: Metadata = {
  title: {
    default: "Devizly — Devis professionnels par IA pour freelancers",
    template: "%s — Devizly",
  },
  description:
    "Générez vos devis en 30 secondes avec l'IA, relancez automatiquement et encaissez plus vite. Essai gratuit.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Devizly",
    title: "Devizly - Devis pro en 30 secondes avec l'IA",
    description:
      "Générez, envoyez et faites signer vos devis professionnels en quelques clics. IA Mistral hébergée en France.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devizly - Devis pro en 30 secondes avec l'IA",
    description:
      "Générez, envoyez et faites signer vos devis en quelques clics. Gratuit.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
