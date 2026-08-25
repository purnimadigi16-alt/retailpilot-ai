import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  calculateAllProductsStock,
  MASTER_PRODUCTS_CATALOG,
  normalizeOrgId,
  normalizeStoreId,
  getEffectiveGstRate,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrgId = searchParams.get("organization_id");
    const rawStoreId = searchParams.get("store_id");
    const barcode = searchParams.get("barcode");
    const search = searchParams.get("search");

    const orgId = normalizeOrgId(rawOrgId || "org_01");
    const storeId = rawStoreId ? normalizeStoreId(rawStoreId) : undefined;

    let items: any[] = [];

    // 1. Try querying remote Supabase PostgreSQL
    try {
      let query = adminDb.from("products").select("*").eq("organization_id", orgId);

      if (barcode) {
        query = query.eq("barcode", barcode);
      }
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch {
      // fallback to master catalog
    }

    // 2. If DB has 0 rows for this tenant, fallback to enriched Master Catalog
    if (items.length === 0) {
      items = MASTER_PRODUCTS_CATALOG.filter((p) => {
        const matchesOrg =
          p.organization_id === orgId ||
          p.organization_id === (rawOrgId || "org_01").toLowerCase() ||
          (orgId === "00000000-0000-0000-0000-000000000001" && p.organization_id === "org_01") ||
          (orgId === "00000000-0000-0000-0000-000000000002" && p.organization_id === "org_02") ||
          (orgId === "00000000-0000-0000-0000-000000000003" && p.organization_id === "org_03");

        if (!matchesOrg) return false;
        if (barcode && p.barcode !== barcode) return false;
        if (
          search &&
          !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.sku.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
    }

    // 3. Attach calculated current stock from immutable ledger and statutory GST slab
    const stockMap = await calculateAllProductsStock(orgId, storeId);
    const enriched = items.map((p) => ({
      ...p,
      current_stock: stockMap[p.id] ?? stockMap[p.sku] ?? p.current_stock ?? 25,
      gst_rate: getEffectiveGstRate(p),
    }));

    return NextResponse.json({ data: enriched });
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
      name,
      sku,
      barcode,
      category,
      cost_price,
      selling_price,
      reorder_level,
      gst_rate,
    } = body;

    if (!organization_id || !name || !sku || !barcode) {
      return NextResponse.json(
        { error: "Missing required product fields: organization_id, name, sku, barcode" },
        { status: 400 }
      );
    }

    const orgId = normalizeOrgId(organization_id);
    const sId = store_id ? normalizeStoreId(store_id) : null;
    const effectiveGst = getEffectiveGstRate({ category, gst_rate });

    const { data, error } = await adminDb
      .from("products")
      .insert([
        {
          organization_id: orgId,
          store_id: sId,
          name,
          sku,
          barcode,
          category: category || "General",
          cost_price: Number(cost_price) || 0,
          selling_price: Number(selling_price) || 0,
          reorder_level: Number(reorder_level) || 10,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { ...data, gst_rate: effectiveGst } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
