import { adminDb, createNotification } from "@/lib/db";

export interface DailyReportResult {
  date: string;
  grossRevenue: number;
  refundsTotal: number;
  netRevenue: number;
  totalOrders: number;
  topSkus: Array<{ name: string; quantity: number; revenue: number }>;
  reportId?: string;
}

/**
 * Mandatory Automation #4: Daily End-of-Day Sales Dossier
 * Trigger: Midnight trigger / end-of-day scheduled job.
 * Action: Aggregates day gross revenue, refunds, top SKUs, and pushes summary to Business Owner.
 */
export async function runDailySalesDossier(
  organizationId: string = "org_01"
): Promise<DailyReportResult> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Query today's sales
  const { data: sales } = await adminDb
    .from("sales")
    .select("id, total, subtotal, tax, discount, sale_items ( product_id, quantity, selling_price )")
    .eq("organization_id", organizationId)
    .gte("created_at", todayStart.toISOString());

  // 2. Query today's returns
  const { data: returns } = await adminDb
    .from("returns")
    .select("id, quantity, product_id")
    .eq("organization_id", organizationId)
    .gte("created_at", todayStart.toISOString());

  // 3. Query product details
  const { data: products } = await adminDb
    .from("products")
    .select("id, name, sku, cost_price")
    .eq("organization_id", organizationId);

  const prodMap = new Map((products || []).map((p) => [p.id, p]));

  let grossRevenue = 0;
  const skuMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

  for (const s of sales || []) {
    grossRevenue += Number(s.total || 0);
    const items = (s as any).sale_items || [];
    for (const item of items) {
      const p = prodMap.get(item.product_id);
      const name = p?.name || "Item";
      const q = Number(item.quantity || 0);
      const rev = Number(item.selling_price || 0) * q;

      if (!skuMap[item.product_id]) {
        skuMap[item.product_id] = { name, quantity: 0, revenue: 0 };
      }
      skuMap[item.product_id].quantity += q;
      skuMap[item.product_id].revenue += rev;
    }
  }

  const refundsTotal = (returns || []).reduce((acc, curr) => {
    const p = prodMap.get(curr.product_id);
    return acc + Number(curr.quantity || 0) * Number(p?.cost_price || 0);
  }, 0);

  const topSkus = Object.values(skuMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const netRevenue = Math.max(0, grossRevenue - refundsTotal);

  // Push notification to Owner
  const title = `📊 Daily End-of-Day Sales Dossier`;
  const message = `Today's Gross Sales: $${grossRevenue.toFixed(2)} across ${(sales || []).length} orders. Refunds: $${refundsTotal.toFixed(2)}. Net Revenue: $${netRevenue.toFixed(2)}.`;
  await createNotification(organizationId, title, message);

  // Store in ai_reports table
  const { data: rep } = await adminDb
    .from("ai_reports")
    .insert([
      {
        organization_id: organizationId,
        report_type: "daily_dossier",
        report_json: {
          date: todayStart.toISOString().split("T")[0],
          gross_revenue: grossRevenue,
          refunds_total: refundsTotal,
          net_revenue: netRevenue,
          total_orders: (sales || []).length,
          top_skus: topSkus,
          disclaimer: "AI-generated recommendation — please verify all accounting reconciliations against merchant gateway settlements.",
        },
      },
    ])
    .select()
    .single();

  return {
    date: todayStart.toISOString().split("T")[0],
    grossRevenue: Number(grossRevenue.toFixed(2)),
    refundsTotal: Number(refundsTotal.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    totalOrders: (sales || []).length,
    topSkus,
    reportId: rep?.id,
  };
}
