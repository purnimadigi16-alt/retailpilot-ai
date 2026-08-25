import {
  adminDb,
  calculateAllProductsStock,
  normalizeOrgId,
  normalizeStoreId,
  MASTER_PRODUCTS_CATALOG,
} from "@/lib/db";
import { LowStockProductResult } from "@/types";

export interface GetLowStockProductsParams {
  organization_id?: string;
  store_id?: string;
  threshold_days?: number;
}

/**
 * MCP Tool: get_low_stock_products
 * Queries SKUs where stock <= reorder threshold with velocity data and estimated runout days.
 */
export async function get_low_stock_products(
  params: GetLowStockProductsParams
): Promise<LowStockProductResult[]> {
  const { organization_id = "org_01", store_id, threshold_days = 30 } = params;
  const orgId = normalizeOrgId(organization_id);
  const sId = store_id ? normalizeStoreId(store_id) : undefined;

  // 1. Fetch products
  let products: any[] = [];
  try {
    let productQuery = adminDb.from("products").select("*").eq("organization_id", orgId);
    if (sId) {
      productQuery = productQuery.eq("store_id", sId);
    }
    const { data, error: prodErr } = await productQuery;
    if (!prodErr && data && data.length > 0) {
      products = data;
    }
  } catch {
    // fallback
  }

  if (products.length === 0) {
    products = MASTER_PRODUCTS_CATALOG.filter(
      (p) =>
        p.organization_id === orgId ||
        p.organization_id === organization_id.toLowerCase() ||
        (orgId === "00000000-0000-0000-0000-000000000001" && p.organization_id === "org_01")
    );
  }

  // 2. Fetch stock from ledger
  const stockMap = await calculateAllProductsStock(orgId, sId);

  // 3. Fetch sales in the past threshold_days to compute sales velocity
  const sinceDate = new Date(Date.now() - threshold_days * 24 * 60 * 60 * 1000).toISOString();
  const { data: salesData } = await adminDb
    .from("sales")
    .select("id, created_at, sale_items ( product_id, quantity )")
    .eq("organization_id", orgId)
    .gte("created_at", sinceDate);

  // Compute velocity per product
  const soldQuantities: Record<string, number> = {};
  for (const s of salesData || []) {
    const items = (s as any).sale_items || [];
    for (const item of items) {
      soldQuantities[item.product_id] =
        (soldQuantities[item.product_id] || 0) + Number(item.quantity || 0);
    }
  }

  const results: LowStockProductResult[] = [];

  for (const product of products) {
    const currentStock = stockMap[product.id] ?? stockMap[product.sku] ?? product.current_stock ?? 0;
    const reorderLevel = product.reorder_level || 10;

    // Filter where current stock is <= reorder threshold
    if (currentStock <= reorderLevel) {
      const unitsSold = soldQuantities[product.id] || 0;
      const velocityPerDay = Number((unitsSold / Math.max(1, threshold_days)).toFixed(2));
      const estimatedDaysLeft =
        velocityPerDay > 0
          ? Number((currentStock / velocityPerDay).toFixed(1))
          : currentStock === 0
          ? 0
          : 999;

      let urgency: "CRITICAL" | "HIGH" | "MEDIUM" = "MEDIUM";
      if (currentStock <= 0 || estimatedDaysLeft <= 2) {
        urgency = "CRITICAL";
      } else if (currentStock <= reorderLevel * 0.5 || estimatedDaysLeft <= 5) {
        urgency = "HIGH";
      }

      results.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        current_stock: currentStock,
        reorder_level: reorderLevel,
        sales_velocity_per_day: velocityPerDay,
        estimated_days_left: estimatedDaysLeft,
        urgency,
      });
    }
  }

  return results.sort((a, b) => a.estimated_days_left - b.estimated_days_left);
}
