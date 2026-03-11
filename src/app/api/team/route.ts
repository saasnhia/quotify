import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import type { TeamRole } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("owner_id", user.id)
    .order("invited_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check subscription plan — Business only
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_status ?? "free") as keyof typeof PLANS;

  if (plan !== "business") {
    return NextResponse.json(
      { error: "La gestion d'équipe est réservée au plan Business" },
      { status: 403 }
    );
  }

  const teamLimit = PLANS[plan].teamLimit;

  // Count existing members (not rejected)
  const { count, error: countError } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .neq("status", "rejected");

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // teamLimit includes the owner, so members can be teamLimit - 1
  const maxMembers = teamLimit - 1;
  if ((count ?? 0) >= maxMembers) {
    return NextResponse.json(
      { error: `Limite atteinte (${maxMembers} membre${maxMembers > 1 ? "s" : ""} maximum sur le plan Business)` },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, role } = body as { email: string; role: TeamRole };

  // Validate email
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }

  // Validate role
  const validRoles: TeamRole[] = ["admin", "editor", "viewer"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  // Cannot invite yourself
  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas vous inviter vous-même" },
      { status: 400 }
    );
  }

  // Check not already invited
  const { data: existing } = await supabase
    .from("team_members")
    .select("id, status")
    .eq("owner_id", user.id)
    .eq("member_email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    if (existing.status !== "rejected") {
      return NextResponse.json(
        { error: "Cet email a déjà été invité" },
        { status: 409 }
      );
    }
    // Re-invite a rejected member by updating status back to pending
    const { data, error } = await supabase
      .from("team_members")
      .update({ role, status: "pending", invited_at: new Date().toISOString(), accepted_at: null })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      owner_id: user.id,
      member_email: email.toLowerCase(),
      role,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
