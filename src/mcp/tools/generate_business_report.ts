import { adminDb, calculateAllProductsStock, normalizeOrgId } from "@/lib/db";
import { BusinessReportResult } from "@/types";
import { get_dead_stock } from "./get_dead_stock";
import { get_low_stock_products } from "./get_low_stock_products";

export interface GenerateBusinessReportParams {
  organization_id?: string;
  period_month?: string; // e.g. "2026-08"
}

/**
 * MCP Tool: generate_business_report
 * Generates structured JSON payload for executive AI business reports combining sales, COGS, dead stock, and recommendations.
 */
export async function generate_business_report(
  params: GenerateBusinessReportParams
): Promise<BusinessReportResult> {
  const { organization_id = "org_01", period_month = "2026-08" } = params;
  const orgId = normalizeOrgId(organization_id);

  // 1. Fetch organization sales
  const { data: sales } = await adminDb
    .from("sales")
    .select("id, subtotal, tax, discount, total, sale_items ( product_id, quantity, selling_price )")
    .eq("organization_id", orgId);

  // 2. Fetch products
  const { data: products } = await adminDb
    .from("products")
    .select("*")
    .eq("organization_id", orgId);

  const costMap: Record<string, number> = {};
  const nameMap: Record<string, string> = {};
  const skuMap: Record<string, string> = {};

  for (const p of products || []) {
    costMap[p.id] = Number(p.cost_price || 0);
    nameMap[p.id] = p.name;
    skuMap[p.id] = p.sku;
  }

  // 3. Compute Revenue, COGS, and Top SKUs
  let totalRevenue = 0;
  let totalCogs = 0;
  const skuSales: Record<string, { sku: string; name: string; units_sold: number; revenue: number }> = {};

  for (const s of sales || []) {
    totalRevenue += Number(s.subtotal || 0);
    const items = (s as any).sale_items || [];
    for (const item of items) {
      const itemCost = costMap[item.product_id] || 0;
      const units = Number(item.quantity || 0);
      const itemTotal = Number(item.selling_price || 0) * units;

      totalCogs += itemCost * units;

      if (!skuSales[item.product_id]) {
        skuSales[item.product_id] = {
          sku: skuMap[item.product_id] || "UNKNOWN",
          name: nameMap[item.product_id] || "Unknown Item",
          units_sold: 0,
          revenue: 0,
        };
      }
      skuSales[item.product_id].units_sold += units;
      skuSales[item.product_id].revenue += itemTotal;
    }
  }

  // 4. Fetch Operating Expenses
  const { data: expenses } = await adminDb
    .from("expenses")
    .select("amount")
    .eq("organization_id", orgId);

  const totalExpenses = (expenses || []).reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );

  const grossProfit = Number((totalRevenue - totalCogs).toFixed(2));
  const netProfit = Number((grossProfit - totalExpenses).toFixed(2));

  // 5. Compute Inventory Valuation & Dead Stock & Low Stock
  const stockMap = await calculateAllProductsStock(orgId);
  let inventoryValuation = 0;
  for (const p of products || []) {
    const stock = stockMap[p.id] || 0;
    inventoryValuation += stock * Number(p.cost_price || 0);
  }

  const deadStockItems = await get_dead_stock({ organization_id: orgId, min_days: 60 });
  const deadStockValue = deadStockItems.reduce(
    (acc, curr) => acc + curr.dead_capital_tied_up,
    0
  );

  const lowStockItems = await get_low_stock_products({ organization_id: orgId });

  const topSellingSkus = Object.values(skuSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const executiveInsights = [
    `Gross revenue for ${period_month} reached ₹${totalRevenue.toFixed(2)} with gross margin of ${(
      (totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0)
    ).toFixed(1)}%.`,
    `Identified ${deadStockItems.length} dead stock SKU(s) holding ₹${deadStockValue.toFixed(2)} in stagnant capital; markdown liquidation recommended.`,
    `Currently ${lowStockItems.length} SKU(s) are below reorder threshold and require purchase order replenishment to prevent stockouts.`,
    `Net operating profitability stands at ₹${netProfit.toFixed(2)} after deducting ₹${totalExpenses.toFixed(2)} in store expenses.`,
  ];

  return {
    organization_id,
    period_month,
    total_revenue: Number(totalRevenue.toFixed(2)),
    total_cogs: Number(totalCogs.toFixed(2)),
    gross_profit: grossProfit,
    total_expenses: Number(totalExpenses.toFixed(2)),
    net_profit: netProfit,
    inventory_valuation: Number(inventoryValuation.toFixed(2)),
    dead_stock_value: Number(deadStockValue.toFixed(2)),
    low_stock_count: lowStockItems.length,
    top_selling_skus: topSellingSkus,
    executive_insights: executiveInsights,
    disclaimer: "AI-generated recommendation — please verify all inventory figures, pricing adjustments, and ledger entries before executing commercial or financial decisions.",
  };
}
