import { generate_business_report } from "@/mcp/tools/generate_business_report";
import { adminDb, createNotification } from "@/lib/db";
import { BusinessReportResult } from "@/types";

export interface MonthlyReportAutomationResult {
  report: BusinessReportResult;
  savedReportId?: string;
}

/**
 * Mandatory Automation #5: Monthly Executive AI Report
 * Trigger: 1st of every month (or on-demand).
 * Action: Invokes full MCP data pipeline and compiles comprehensive executive diagnostic report.
 */
export async function runMonthlyExecutiveReportAutomation(
  organizationId: string = "org_01",
  periodMonth: string = "2026-08"
): Promise<MonthlyReportAutomationResult> {
  // 1. Invoke full MCP pipeline tool
  const report = await generate_business_report({
    organization_id: organizationId,
    period_month: periodMonth,
  });

  // 2. Push notification
  const title = `📑 Monthly Executive AI Report Ready (${periodMonth})`;
  const message = `Monthly diagnostic compiled: Gross Revenue ₹${report.total_revenue.toFixed(2)}, Net Profit ₹${report.net_profit.toFixed(2)}, Inventory Valuation ₹${report.inventory_valuation.toFixed(2)}.`;
  await createNotification(organizationId, title, message);

  // 3. Persist to ai_reports table
  const { data: savedReport } = await adminDb
    .from("ai_reports")
    .insert([
      {
        organization_id: organizationId,
        report_type: "monthly_diagnostic",
        report_json: report,
      },
    ])
    .select()
    .single();

  return {
    report,
    savedReportId: savedReport?.id,
  };
}
