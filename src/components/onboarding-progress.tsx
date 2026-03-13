"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

interface OnboardingStep {
  label: string;
  done: boolean;
  href?: string;
}

interface OnboardingProgressProps {
  hasProfile: boolean;
  hasQuote: boolean;
  hasStripe: boolean;
  hasSentQuote: boolean;
}

export function OnboardingProgress({
  hasProfile,
  hasQuote,
  hasStripe,
  hasSentQuote,
}: OnboardingProgressProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const steps: OnboardingStep[] = [
    { label: "Compte créé", done: true },
    { label: "Remplir votre profil", done: hasProfile, href: "/parametres" },
    { label: "Créer votre 1er devis", done: hasQuote, href: "/devis/nouveau" },
    { label: "Connecter Stripe", done: hasStripe, href: "/parametres#stripe" },
    { label: "Envoyer un devis", done: hasSentQuote },
  ];

  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / steps.length) * 100);

  if (percent === 100) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-700/40 via-indigo-700/35 to-violet-700/40 p-5">
      <button
        onClick={() => {
          setDismissed(true);
          fetch("/api/settings/automations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ onboarding_dismissed: true }),
          }).catch(() => {});
        }}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Votre compte est prêt à {percent}%
        </h3>
        <span className="text-xs text-white/70">
          {completed}/{steps.length} étapes
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-violet-200 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
              step.done
                ? "text-white"
                : "text-white/70"
            }`}
          >
            {step.done ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <div className="h-4 w-4 shrink-0 rounded-full border border-white/40" />
            )}
            {step.href && !step.done ? (
              <Link
                href={step.href}
                className="flex items-center gap-1 font-medium text-white transition-colors hover:text-violet-200"
              >
                {step.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className={step.done ? "line-through opacity-70" : ""}>
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
