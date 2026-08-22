import { NextRequest, NextResponse } from "next/server";
import { adminDb, calculateAllProductsStock } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";
    const storeId = searchParams.get("store_id");

    // 1. Fetch Sales
    let salesQuery = adminDb
      .from("sales")
      .select("id, subtotal, tax, discount, total, created_at, sale_items ( product_id, quantity, selling_price )")
      .eq("organization_id", orgId);

    if (storeId) {
      salesQuery = salesQuery.eq("store_id", storeId);
    }

    const { data: sales } = await salesQuery;

    // 2. Fetch Products
    const { data: products } = await adminDb
      .from("products")
      .select("*")
      .eq("organization_id", orgId);

    const costMap: Record<string, number> = {};
    for (const p of products || []) {
      costMap[p.id] = Number(p.cost_price || 0);
    }

    // 3. Compute Gross Sales & COGS
    let grossSales = 0;
    let cogs = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    for (const s of sales || []) {
      grossSales += Number(s.subtotal || 0);
      totalDiscount += Number(s.discount || 0);
      totalTax += Number(s.tax || 0);
      const items = (s as any).sale_items || [];
      for (const item of items) {
        cogs += (costMap[item.product_id] || 0) * Number(item.quantity || 0);
      }
    }

    // 4. Fetch Operating Expenses
    let expQuery = adminDb
      .from("expenses")
      .select("amount, category")
      .eq("organization_id", orgId);

    if (storeId) {
      expQuery = expQuery.eq("store_id", storeId);
    }

    const { data: expenses } = await expQuery;
    const totalExpenses = (expenses || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const grossProfit = Number((grossSales - cogs).toFixed(2));
    const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
    const grossMarginPct = grossSales > 0 ? Number(((grossProfit / grossSales) * 100).toFixed(1)) : 0;
    const netMarginPct = grossSales > 0 ? Number(((netProfit / grossSales) * 100).toFixed(1)) : 0;

    // 5. Stock valuation from immutable ledger
    const stockMap = await calculateAllProductsStock(orgId, storeId || undefined);
    let totalInventoryValuation = 0;
    let totalUnits = 0;
    let lowStockCount = 0;

    for (const p of products || []) {
      const stock = stockMap[p.id] || 0;
      totalUnits += stock;
      totalInventoryValuation += stock * Number(p.cost_price || 0);
      if (stock <= (p.reorder_level || 10)) {
        lowStockCount++;
      }
    }

    // 6. Expense breakdown by category
    const expenseByCategory: Record<string, number> = {};
    for (const e of expenses || []) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount || 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue: Number(grossSales.toFixed(2)),
        cogs: Number(cogs.toFixed(2)),
        gross_profit: grossProfit,
        gross_margin_pct: grossMarginPct,
        expenses: Number(totalExpenses.toFixed(2)),
        net_profit: netProfit,
        net_margin_pct: netMarginPct,
        inventory_valuation: Number(totalInventoryValuation.toFixed(2)),
        total_inventory_units: totalUnits,
        total_sales_count: (sales || []).length,
        low_stock_count: lowStockCount,
        expense_breakdown: expenseByCategory,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
