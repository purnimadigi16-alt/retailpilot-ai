import { NextRequest, NextResponse } from "next/server";
import { adminDb, recordLedgerMovement } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";

    const { data, error } = await adminDb
      .from("purchases")
      .select("*, suppliers ( name, phone, email, credit_days ), stores ( name ), purchase_items ( id, product_id, quantity, unit_cost, total, products ( name, sku ) )")
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
    const {
      organization_id,
      store_id,
      supplier_id,
      items = [], // Array<{ product_id: string, quantity: number, unit_cost: number }>
      po_number,
      status = "Draft",
    } = body;

    if (!organization_id || !store_id || !supplier_id || !items.length) {
      return NextResponse.json(
        { error: "Missing required PO fields: organization_id, store_id, supplier_id, items" },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + Number(item.quantity) * Number(item.unit_cost),
      0
    );

    const generatedPoNumber = po_number || `PO-${Date.now().toString().slice(-6)}`;

    // 1. Insert PO
    const { data: po, error: poErr } = await adminDb
      .from("purchases")
      .insert([
        {
          organization_id,
          store_id,
          supplier_id,
          po_number: generatedPoNumber,
          status,
          total_amount: Number(totalAmount.toFixed(2)),
        },
      ])
      .select()
      .single();

    if (poErr) {
      return NextResponse.json({ error: poErr.message }, { status: 500 });
    }

    // 2. Insert items
    const poItemsPayload = items.map((i: any) => ({
      purchase_id: po.id,
      product_id: i.product_id,
      quantity: Number(i.quantity),
      unit_cost: Number(i.unit_cost),
      total: Number((Number(i.quantity) * Number(i.unit_cost)).toFixed(2)),
    }));

    await adminDb.from("purchase_items").insert(poItemsPayload);

    // 3. If PO status is "Received" (GRN processed), add inventory to ledger!
    if (status === "Received") {
      for (const item of items) {
        await recordLedgerMovement({
          organization_id,
          store_id,
          product_id: item.product_id,
          movement_type: "PURCHASE",
          quantity: Math.abs(Number(item.quantity)),
          reference_id: po.id,
          notes: `PO Goods Receipt Note (GRN) received: ${generatedPoNumber}`,
        });
      }
    }

    return NextResponse.json({ success: true, purchase: po }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing PO id or new status" }, { status: 400 });
    }

    // Fetch existing PO
    const { data: existingPo, error: fErr } = await adminDb
      .from("purchases")
      .select("*, purchase_items ( product_id, quantity )")
      .eq("id", id)
      .single();

    if (fErr || !existingPo) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    // If moving to "Received", credit inventory ledger
    if (status === "Received" && existingPo.status !== "Received") {
      const items = (existingPo as any).purchase_items || [];
      for (const item of items) {
        await recordLedgerMovement({
          organization_id: existingPo.organization_id,
          store_id: existingPo.store_id,
          product_id: item.product_id,
          movement_type: "PURCHASE",
          quantity: Math.abs(Number(item.quantity)),
          reference_id: existingPo.id,
          notes: `GRN received status update for ${existingPo.po_number}`,
        });
      }
    }

    const { data: updated, error: uErr } = await adminDb
      .from("purchases")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, purchase: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
