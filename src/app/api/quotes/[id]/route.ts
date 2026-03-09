import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tryAutoInvoice } from "@/lib/invoices/auto-invoice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { title, client_id, tva_rate, discount, notes, valid_until, status, items, total_ht, total_ttc } = body;

  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      title,
      client_id: client_id || null,
      tva_rate,
      discount,
      notes,
      valid_until,
      status,
      total_ht,
      total_ttc,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (items && Array.isArray(items)) {
    await supabase.from("quote_items").delete().eq("quote_id", id);

    if (items.length > 0) {
      const itemsToInsert = items.map((item: { description: string; quantity: number; unit_price: number; total: number }, index: number) => ({
        quote_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        position: index,
      }));

      await supabase.from("quote_items").insert(itemsToInsert);
    }
  }

  // Automation: auto-generate invoice when status changes to "signé" (non-blocking)
  if (status === "signé") {
    tryAutoInvoice("sign", { quoteId: id, userId: user.id });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
