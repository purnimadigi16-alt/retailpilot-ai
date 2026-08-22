import { adminDb, calculateAllProductsStock } from "@/lib/db";
import { DeadStockResult } from "@/types";

export interface GetDeadStockParams {
  organization_id: string;
  min_days?: number;
}

/**
 * MCP Tool: get_dead_stock
 * Identifies high-value inventory with zero recorded sales in 60+ days to highlight stagnant capital.
 */
export async function get_dead_stock(
  params: GetDeadStockParams
): Promise<DeadStockResult[]> {
  const { organization_id, min_days = 60 } = params;

  // 1. Fetch organization products
  const { data: products, error } = await adminDb
    .from("products")
    .select("*")
    .eq("organization_id", organization_id);

  if (error || !products) {
    console.error("Error fetching products in get_dead_stock:", error);
    return [];
  }

  // 2. Fetch current stock
  const stockMap = await calculateAllProductsStock(organization_id);

  // 3. Fetch sales in the past min_days
  const cutoffDate = new Date(Date.now() - min_days * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSales } = await adminDb
    .from("sales")
    .select("created_at, sale_items ( product_id )")
    .eq("organization_id", organization_id)
    .gte("created_at", cutoffDate);

  // Set of product IDs sold within cutoff window
  const activeProductIds = new Set<string>();
  for (const s of recentSales || []) {
    for (const item of (s as any).sale_items || []) {
      activeProductIds.add(item.product_id);
    }
  }

  const deadStock: DeadStockResult[] = [];

  for (const product of products) {
    const currentStock = stockMap[product.id] ?? 0;
    // Only consider items currently holding positive physical stock
    if (currentStock > 0 && !activeProductIds.has(product.id)) {
      const costPrice = Number(product.cost_price || 0);
      const deadCapital = Number((costPrice * currentStock).toFixed(2));
      
      // Determine recommended markdown based on dead capital & days stagnant
      let recommendedMarkdown = 20;
      if (min_days >= 90) recommendedMarkdown = 35;
      else if (min_days >= 60) recommendedMarkdown = 25;

      deadStock.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        current_stock: currentStock,
        cost_price: costPrice,
        dead_capital_tied_up: deadCapital,
        days_since_last_sale: min_days,
        recommended_markdown_pct: recommendedMarkdown,
      });
    }
  }

  return deadStock.sort((a, b) => b.dead_capital_tied_up - a.dead_capital_tied_up);
}
