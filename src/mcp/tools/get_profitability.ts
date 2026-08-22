import { adminDb } from "@/lib/db";
import { ProfitabilityResult } from "@/types";

export interface GetProfitabilityParams {
  organization_id?: string;
  store_id: string;
  start_date?: string;
  end_date?: string;
}

/**
 * MCP Tool: get_profitability
 * Computes Gross Sales - COGS - Store Operating Expenses for a given store.
 */
export async function get_profitability(
  params: GetProfitabilityParams
): Promise<ProfitabilityResult> {
  const {
    store_id,
    start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date = new Date().toISOString(),
  } = params;

  // 1. Fetch Sales with items
  let salesQuery = adminDb
    .from("sales")
    .select("id, subtotal, tax, discount, total, sale_items ( product_id, quantity, selling_price )")
    .eq("store_id", store_id)
    .gte("created_at", start_date)
    .lte("created_at", end_date);

  const { data: sales, error: salesErr } = await salesQuery;
  if (salesErr) {
    console.error("Error querying sales for profitability:", salesErr);
  }

  // 2. Fetch products to get cost prices for COGS
  const { data: products } = await adminDb.from("products").select("id, cost_price");
  const costMap: Record<string, number> = {};
  for (const p of products || []) {
    costMap[p.id] = Number(p.cost_price || 0);
  }

  // Calculate Gross Sales & COGS
  let grossSales = 0;
  let cogs = 0;

  for (const s of sales || []) {
    grossSales += Number(s.subtotal || 0);
    const items = (s as any).sale_items || [];
    for (const item of items) {
      const itemCost = costMap[item.product_id] || 0;
      cogs += itemCost * Number(item.quantity || 0);
    }
  }

  // 3. Fetch Store Operating Expenses
  let expQuery = adminDb
    .from("expenses")
    .select("amount")
    .eq("store_id", store_id)
    .gte("created_at", start_date)
    .lte("created_at", end_date);

  const { data: expenses } = await expQuery;
  const operatingExpenses = (expenses || []).reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );

  const grossProfit = Number((grossSales - cogs).toFixed(2));
  const grossMarginPct =
    grossSales > 0 ? Number(((grossProfit / grossSales) * 100).toFixed(1)) : 0;
  const netProfit = Number((grossProfit - operatingExpenses).toFixed(2));
  const netMarginPct =
    grossSales > 0 ? Number(((netProfit / grossSales) * 100).toFixed(1)) : 0;

  return {
    store_id,
    start_date,
    end_date,
    gross_sales: Number(grossSales.toFixed(2)),
    cogs: Number(cogs.toFixed(2)),
    gross_profit: grossProfit,
    gross_margin_pct: grossMarginPct,
    operating_expenses: Number(operatingExpenses.toFixed(2)),
    net_profit: netProfit,
    net_margin_pct: netMarginPct,
  };
}
