import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the prospect belongs to the authenticated user
  const { data: existing, error: fetchError } = await supabase
    .from("prospects")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, company, notes, estimated_amount } = body;

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
  }

  const updates: Record<string, string | number | null> = {};
  if (name !== undefined) updates.name = name.trim();
  if (email !== undefined) updates.email = email?.trim() || null;
  if (company !== undefined) updates.company = company?.trim() || null;
  if (notes !== undefined) updates.notes = notes?.trim() || null;
  if (estimated_amount !== undefined) updates.estimated_amount = estimated_amount || 0;

  const { data, error } = await supabase
    .from("prospects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, prospect: data });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the prospect belongs to the authenticated user
  const { data: existing, error: fetchError } = await supabase
    .from("prospects")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error } = await supabase.from("prospects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
