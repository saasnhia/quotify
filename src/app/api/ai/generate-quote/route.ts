import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMistral } from "@/lib/mistral";
import { checkRateLimit } from "@/lib/ratelimit";
import { canCreateDevis, type PlanId } from "@/lib/stripe";

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Quota check — prevent free users from generating beyond their limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, devis_used")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;

  if (!canCreateDevis(plan, devisUsed)) {
    return NextResponse.json(
      {
        error: "Quota de devis atteint. Passez au plan supérieur.",
        code: "QUOTA_EXCEEDED",
      },
      { status: 403 }
    );
  }

  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Le prompt est requis" }, { status: 400 });
  }

  try {
    const mistral = getMistral();
    const completion = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant qui génère des devis professionnels français.
Retourne un JSON avec: title (string), items (array of {description: string, quantity: number, unit_price: number}), notes (string).
Réponds uniquement en JSON valide, sans markdown ni backticks.
Les prix doivent être en euros HT, réalistes pour le marché français.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Réponse vide de l'IA" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur IA";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
