import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check Business plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status !== "business") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Business" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check Business plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status !== "business") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Business" },
      { status: 403 }
    );
  }

  const body = await request.json() as {
    title?: string;
    client_id?: string | null;
    template_id?: string | null;
    amount?: number;
    frequency?: string;
    start_date?: string;
    end_date?: string | null;
    notes?: string | null;
    description?: string | null;
    currency?: string;
  };

  const {
    title,
    client_id,
    template_id,
    amount,
    frequency,
    start_date,
    end_date,
    notes,
    description,
    currency,
  } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  if (!start_date) {
    return NextResponse.json(
      { error: "La date de début est requise" },
      { status: 400 }
    );
  }

  const validFrequencies = ["monthly", "quarterly", "yearly"];
  const freq = frequency || "monthly";
  if (!validFrequencies.includes(freq)) {
    return NextResponse.json(
      { error: "Fréquence invalide" },
      { status: 400 }
    );
  }

  // Compute next_invoice_date = start_date
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      client_id: client_id || null,
      template_id: template_id || null,
      amount: amount ?? 0,
      currency: currency || "EUR",
      frequency: freq,
      start_date,
      end_date: end_date || null,
      next_invoice_date: start_date,
      notes: notes || null,
      description: description || null,
      status: "active",
    })
    .select("*, clients(name, email)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
