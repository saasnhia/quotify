import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("contracts")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  }

  const body = await request.json() as {
    title?: string;
    status?: string;
    amount?: number;
    notes?: string | null;
    description?: string | null;
    end_date?: string | null;
    next_invoice_date?: string | null;
    frequency?: string;
    client_id?: string | null;
    currency?: string;
  };

  const validStatuses = ["draft", "active", "paused", "ended"];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const validFrequencies = ["monthly", "quarterly", "yearly"];
  if (body.frequency && !validFrequencies.includes(body.frequency)) {
    return NextResponse.json({ error: "Fréquence invalide" }, { status: 400 });
  }

  // Build update object — only include provided fields
  const updates: Record<string, string | number | null> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) updates.title = body.title;
  if (body.status !== undefined) updates.status = body.status;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.description !== undefined) updates.description = body.description;
  if (body.end_date !== undefined) updates.end_date = body.end_date;
  if (body.next_invoice_date !== undefined)
    updates.next_invoice_date = body.next_invoice_date;
  if (body.frequency !== undefined) updates.frequency = body.frequency;
  if (body.client_id !== undefined) updates.client_id = body.client_id;
  if (body.currency !== undefined) updates.currency = body.currency;

  const { data, error } = await supabase
    .from("contracts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, clients(name, email)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Verify ownership and check status
  const { data: existing } = await supabase
    .from("contracts")
    .select("id, user_id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  }

  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Seuls les contrats en brouillon peuvent être supprimés" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
