import { get_supplier_outstanding } from "@/mcp/tools/get_supplier_outstanding";
import { createNotification } from "@/lib/db";

export interface SupplierAlertResult {
  escalationsCount: number;
  totalPendingAmount: number;
  escalatedSuppliers: any[];
}

/**
 * Mandatory Automation #3: Supplier Payment Escalation
 * Trigger: PO payment due in < 48 hours.
 * Action: Verifies pending invoices and pushes escalation alerts to Accounts and Store Manager.
 */
export async function runSupplierPaymentEscalation(
  organizationId: string = "org_01"
): Promise<SupplierAlertResult> {
  const suppliers = await get_supplier_outstanding({
    organization_id: organizationId,
    min_due: 0,
  });

  const escalated = suppliers.filter(
    (s) => s.due_status === "CRITICAL_DUE" || s.outstanding_balance > 1000
  );

  let totalPending = 0;

  for (const sup of escalated) {
    totalPending += sup.outstanding_balance;
    const title = `🚨 Supplier Payment Escalation: ${sup.name}`;
    const message = `PO invoice payment ($${sup.outstanding_balance.toFixed(2)}) is due within 48 hours (Credit terms: ${sup.credit_days} days). Please review and release funds.`;
    await createNotification(organizationId, title, message);
  }

  return {
    escalationsCount: escalated.length,
    totalPendingAmount: Number(totalPending.toFixed(2)),
    escalatedSuppliers: escalated,
  };
}
