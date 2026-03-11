import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TeamRole } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { role } = body as { role: TeamRole };

  const validRoles: TeamRole[] = ["admin", "editor", "viewer"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Membre introuvable ou accès refusé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
