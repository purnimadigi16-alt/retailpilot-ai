import { NextRequest, NextResponse } from "next/server";
import { adminDb, recordLedgerMovement, calculateCurrentStock } from "@/lib/db";
import { MovementType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";
    const storeId = searchParams.get("store_id");
    const productId = searchParams.get("product_id");

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
      product_id,
      movement_type,
      quantity,
      reference_id,
      notes,
    } = body;

    if (!organization_id || !store_id || !product_id || !movement_type || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields for inventory movement" },
        { status: 400 }
      );
    }

    // Record immutable movement
    const entry = await recordLedgerMovement({
      organization_id,
      store_id,
      product_id,
      movement_type: movement_type as MovementType,
      quantity: Number(quantity),
      reference_id,
      notes,
    });

    const newStock = await calculateCurrentStock(organization_id, product_id, store_id);

    return NextResponse.json(
      {
        success: true,
        entry,
        new_calculated_stock: newStock,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
