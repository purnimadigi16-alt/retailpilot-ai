import { NextRequest, NextResponse } from "next/server";
import { adminDb, recordLedgerMovement, normalizeOrgId, normalizeStoreId } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrgId = searchParams.get("organization_id") || "org_01";
    const orgId = normalizeOrgId(rawOrgId);

    const { data, error } = await adminDb
      .from("purchases")
      .select("*, suppliers ( name, phone, email, credit_days ), stores ( name ), purchase_items ( id, product_id, quantity, unit_cost, total, products ( name, sku ) )")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
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

    const orgId = normalizeOrgId(organization_id);
    const sId = normalizeStoreId(store_id);

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
          organization_id: orgId,
          store_id: sId || null,
          supplier_id,
          po_number: generatedPoNumber,
          status,
          total_amount: totalAmount,
        },
      ])
      .select()
      .single();

    if (poErr) {
      return NextResponse.json({ error: poErr.message }, { status: 500 });
    }

    // 2. Insert PO items
    const poItemsPayload = items.map((i: any) => ({
      purchase_id: po.id,
      product_id: i.product_id,
      quantity: Number(i.quantity),
      unit_cost: Number(i.unit_cost),
    }));

    await adminDb.from("purchase_items").insert(poItemsPayload);

    // 3. If immediately marked "Received", add positive stock movement in ledger
    if (status === "Received") {
      for (const item of items) {
        await recordLedgerMovement({
          organization_id: orgId,
          store_id: sId,
          product_id: item.product_id,
          movement_type: "PURCHASE",
          quantity: Math.abs(Number(item.quantity)),
          cost_price: Number(item.unit_cost),
          reference_id: po.id,
          notes: `GRN Intake from PO ${generatedPoNumber}`,
        });
      }
    }

    return NextResponse.json({ data: po }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const purchase_id = body.purchase_id || body.id;
    const status = body.status;

    if (!purchase_id || !status) {
      return NextResponse.json({ error: "Missing purchase_id or status" }, { status: 400 });
    }

    // Fetch PO and items
    const { data: po, error: fetchErr } = await adminDb
      .from("purchases")
      .select("*, purchase_items (*)")
      .eq("id", purchase_id)
      .single();

    if (fetchErr || !po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    // If transitioning to "Received", add stock movements in ledger
    if (status === "Received" && po.status !== "Received") {
      for (const item of po.purchase_items || []) {
        await recordLedgerMovement({
          organization_id: po.organization_id,
          store_id: po.store_id,
          product_id: item.product_id,
          movement_type: "PURCHASE",
          quantity: Math.abs(Number(item.quantity)),
          cost_price: Number(item.unit_cost),
          reference_id: po.id,
          notes: `GRN Receipt Intake for PO ${po.po_number}`,
        });
      }
    }

    // Update status
    const { data: updated, error: updateErr } = await adminDb
      .from("purchases")
      .update({ status })
      .eq("id", purchase_id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
