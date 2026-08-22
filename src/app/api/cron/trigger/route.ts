import { NextRequest, NextResponse } from "next/server";
import { runLowStockAlertAutomation } from "@/agents/automation/low-stock";
import { runDeadStockAuditAutomation } from "@/agents/automation/dead-stock";
import { runSupplierPaymentEscalation } from "@/agents/automation/supplier-alert";
import { runDailySalesDossier } from "@/agents/automation/daily-report";
import { runMonthlyExecutiveReportAutomation } from "@/agents/automation/monthly-report";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow, organization_id = "org_01", store_id } = body;

    let result: any = null;

    switch (workflow) {
      case "low_stock":
        result = await runLowStockAlertAutomation(organization_id, store_id);
        break;
      case "dead_stock":
        result = await runDeadStockAuditAutomation(organization_id);
        break;
      case "supplier_escalation":
        result = await runSupplierPaymentEscalation(organization_id);
        break;
      case "daily_sales":
        result = await runDailySalesDossier(organization_id);
        break;
      case "monthly_report":
        result = await runMonthlyExecutiveReportAutomation(organization_id, "2026-08");
        break;
      default:
        return NextResponse.json(
          {
            error: `Unknown workflow: ${workflow}. Supported workflows: 'low_stock', 'dead_stock', 'supplier_escalation', 'daily_sales', 'monthly_report'`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      workflow,
      organization_id,
      executed_at: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Automation execution error" },
      { status: 500 }
    );
  }
}
