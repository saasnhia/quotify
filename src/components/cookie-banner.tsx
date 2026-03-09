"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import Link from "next/link";

const COOKIE_KEY = "cookie-consent";
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { accepted: boolean; date: number };
        if (Date.now() - parsed.date < SIX_MONTHS_MS) {
          return; // consent still valid
        }
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ accepted: true, date: Date.now() })
    );
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:gap-4">
        <Cookie className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
        <p className="flex-1 text-center text-sm text-muted-foreground sm:text-left">
          Devizly utilise uniquement des cookies essentiels au fonctionnement du
          service (authentification). Aucun cookie publicitaire ou de tracking.{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-2 hover:text-foreground"
          >
            En savoir plus
          </Link>
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Compris
        </Button>
      </div>
    </div>
  );
}
