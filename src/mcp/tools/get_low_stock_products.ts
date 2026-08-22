import { adminDb, calculateAllProductsStock } from "@/lib/db";
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
  const { organization_id, store_id, threshold_days = 30 } = params;

  // 1. Fetch products
  let productQuery = adminDb.from("products").select("*");
  if (organization_id) {
    productQuery = productQuery.eq("organization_id", organization_id);
  }
  if (store_id) {
    productQuery = productQuery.eq("store_id", store_id);
  }

  const { data: products, error: prodErr } = await productQuery;
  if (prodErr || !products) {
    console.error("Error fetching products in get_low_stock_products:", prodErr);
    return [];
  }

  // 2. Fetch stock from ledger
  const effectiveOrgId = organization_id || products[0]?.organization_id || "org_01";
  const stockMap = await calculateAllProductsStock(effectiveOrgId, store_id);

  // 3. Fetch sales in the past threshold_days to compute sales velocity
  const sinceDate = new Date(Date.now() - threshold_days * 24 * 60 * 60 * 1000).toISOString();
  const { data: salesData } = await adminDb
    .from("sales")
    .select("id, created_at, sale_items ( product_id, quantity )")
    .eq("organization_id", effectiveOrgId)
    .gte("created_at", sinceDate);

  // Compute velocity per product
  const soldQuantities: Record<string, number> = {};
  for (const s of salesData || []) {
    const items = (s as any).sale_items || [];
    for (const item of items) {
      soldQuantities[item.product_id] = (soldQuantities[item.product_id] || 0) + Number(item.quantity || 0);
    }
  }

  const results: LowStockProductResult[] = [];

  for (const product of products) {
    const currentStock = stockMap[product.id] ?? 0;
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
