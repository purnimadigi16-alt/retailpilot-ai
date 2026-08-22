import { get_dead_stock } from "@/mcp/tools/get_dead_stock";
import { adminDb, createNotification } from "@/lib/db";

export interface DeadStockAutomationResult {
  deadStockCount: number;
  totalDeadCapital: number;
  liquidationPlan: {
    sku: string;
    name: string;
    units: number;
    capital: number;
    recommendedDiscount: number;
  }[];
  reportId?: string;
}

/**
 * Mandatory Automation #2: Dead Stock Bi-Weekly Audit
 * Trigger: Bi-weekly cron schedule.
 * Action: Identifies 60+ day stagnant capital and generates markdown liquidation plan.
 */
export async function runDeadStockAuditAutomation(
  organizationId: string = "org_01"
): Promise<DeadStockAutomationResult> {
  const deadItems = await get_dead_stock({
    organization_id: organizationId,
    min_days: 60,
  });

  const totalDeadCapital = deadItems.reduce((acc, curr) => acc + curr.dead_capital_tied_up, 0);

  const liquidationPlan = deadItems.map((item) => ({
    sku: item.sku,
    name: item.name,
    units: item.current_stock,
    capital: item.dead_capital_tied_up,
    recommendedDiscount: item.recommended_markdown_pct,
  }));

  if (deadItems.length > 0) {
    const title = `🧊 Bi-Weekly Dead Stock Audit: $${totalDeadCapital.toFixed(2)} Stagnant Capital`;
    const message = `Identified ${deadItems.length} stagnant SKUs with 60+ days zero sales. Recommended markdown liquidation promotions generated.`;
    await createNotification(organizationId, title, message);

    // Save report in ai_reports
    const { data: rep } = await adminDb
      .from("ai_reports")
      .insert([
        {
          organization_id: organizationId,
          report_type: "dead_stock_audit",
          report_json: {
            audit_date: new Date().toISOString(),
            total_dead_capital: totalDeadCapital,
            items_count: deadItems.length,
            liquidation_plan: liquidationPlan,
            disclaimer: "AI-generated recommendation — please verify inventory counts before launching promotional discounts.",
          },
        },
      ])
      .select()
      .single();

    return {
      deadStockCount: deadItems.length,
      totalDeadCapital: Number(totalDeadCapital.toFixed(2)),
      liquidationPlan,
      reportId: rep?.id,
    };
  }

  return {
    deadStockCount: 0,
    totalDeadCapital: 0,
    liquidationPlan: [],
  };
}
