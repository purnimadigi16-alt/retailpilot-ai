import { NextRequest, NextResponse } from "next/server";
import { adminDb, recordLedgerMovement } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";

    const { data, error } = await adminDb
      .from("returns")
      .select("*, products ( name, sku, cost_price, selling_price ), sales ( invoice_number, store_id )")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization_id, sale_id, product_id, quantity, reason } = body;

    if (!organization_id || !sale_id || !product_id || !quantity || !reason) {
      return NextResponse.json(
        { error: "Missing return fields: organization_id, sale_id, product_id, quantity, reason" },
        { status: 400 }
      );
    }

    // 1. Fetch sale to retrieve store_id
    const { data: sale, error: sErr } = await adminDb
      .from("sales")
      .select("store_id, invoice_number")
      .eq("id", sale_id)
      .single();

    if (sErr || !sale) {
      return NextResponse.json({ error: "Original sale invoice not found" }, { status: 404 });
    }

    // 2. Insert return record
    const { data: returnRec, error: rErr } = await adminDb
      .from("returns")
      .insert([
        {
          organization_id,
          sale_id,
          product_id,
          quantity: Number(quantity),
          reason,
        },
      ])
      .select()
      .single();

    if (rErr) {
      return NextResponse.json({ error: rErr.message }, { status: 500 });
    }

    // 3. Restock inventory in immutable ledger (+quantity)
    await recordLedgerMovement({
      organization_id,
      store_id: sale.store_id,
      product_id,
      movement_type: "RETURN",
      quantity: Math.abs(Number(quantity)),
      reference_id: returnRec.id,
      notes: `Customer return restock for invoice ${sale.invoice_number} (Reason: ${reason})`,
    });

    return NextResponse.json({ success: true, return: returnRec }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
