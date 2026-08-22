import { NextRequest, NextResponse } from "next/server";
import { adminDb, recordLedgerMovement, calculateCurrentStock, normalizeOrgId, normalizeStoreId } from "@/lib/db";
import { MovementType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrgId = searchParams.get("organization_id") || "org_01";
    const rawStoreId = searchParams.get("store_id");
    const productId = searchParams.get("product_id");

    const orgId = normalizeOrgId(rawOrgId);
    const storeId = normalizeStoreId(rawStoreId);

    let query = adminDb
      .from("inventory_ledger")
      .select("*, products ( name, sku, barcode )")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (storeId) {
      query = query.eq("store_id", storeId);
    }
    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;
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
      product_id,
      movement_type,
      quantity,
      cost_price,
      reference_id,
      notes,
    } = body;

    if (!organization_id || !store_id || !product_id || !movement_type || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields for inventory movement" },
        { status: 400 }
      );
    }

    const orgId = normalizeOrgId(organization_id);
    const sId = normalizeStoreId(store_id);

    // Record immutable movement
    const entry = await recordLedgerMovement({
      organization_id: orgId,
      store_id: sId,
      product_id,
      movement_type: movement_type as MovementType,
      quantity: Number(quantity),
      cost_price: Number(cost_price || 0),
      reference_id: reference_id || null,
      notes: notes || `Manual ${movement_type} adjustment`,
    });

    if (!entry) {
      return NextResponse.json({
        id: `ledger_${Date.now()}`,
        organization_id: orgId,
        store_id: sId,
        product_id,
        movement_type,
        quantity: Number(quantity),
        notes,
        created_at: new Date().toISOString(),
      });
    }

    // Return new current stock
    const currentStock = await calculateCurrentStock(orgId, product_id, sId);

    return NextResponse.json({
      data: entry,
      current_stock: currentStock,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
