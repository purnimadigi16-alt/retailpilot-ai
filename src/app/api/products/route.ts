import { NextRequest, NextResponse } from "next/server";
import { adminDb, calculateAllProductsStock } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";
    const storeId = searchParams.get("store_id") || undefined;
    const barcode = searchParams.get("barcode");
    const search = searchParams.get("search");

    let query = adminDb.from("products").select("*").eq("organization_id", orgId);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }
    if (barcode) {
      query = query.eq("barcode", barcode);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: products, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach calculated current stock from immutable ledger
    const stockMap = await calculateAllProductsStock(orgId, storeId);
    const enriched = (products || []).map((p) => ({
      ...p,
      current_stock: stockMap[p.id] ?? 0,
    }));

    return NextResponse.json({ data: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization_id, store_id, name, sku, barcode, cost_price, selling_price, reorder_level } = body;

    if (!organization_id || !name || !sku || !barcode) {
      return NextResponse.json(
        { error: "Missing required product fields: organization_id, name, sku, barcode" },
        { status: 400 }
      );
    }

    const { data, error } = await adminDb
      .from("products")
      .insert([
        {
          organization_id,
          store_id: store_id || null,
          name,
          sku,
          barcode,
          cost_price: Number(cost_price || 0),
          selling_price: Number(selling_price || 0),
          reorder_level: Number(reorder_level || 10),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
