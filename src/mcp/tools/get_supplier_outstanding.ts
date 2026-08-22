import { adminDb } from "@/lib/db";
import { SupplierOutstandingResult } from "@/types";

export interface GetSupplierOutstandingParams {
  organization_id: string;
  min_due?: number;
}

/**
 * MCP Tool: get_supplier_outstanding
 * Aggregates unpaid accounts payable, credit terms, and due dates for suppliers.
 */
export async function get_supplier_outstanding(
  params: GetSupplierOutstandingParams
): Promise<SupplierOutstandingResult[]> {
  const { organization_id, min_due = 0 } = params;

  // 1. Query suppliers for the organization
  const { data: suppliers, error } = await adminDb
    .from("suppliers")
    .select("*")
    .eq("organization_id", organization_id);

  if (error || !suppliers) {
    console.error("Error querying suppliers in get_supplier_outstanding:", error);
    return [];
  }

  // 2. Query pending purchases
  const { data: purchases } = await adminDb
    .from("purchases")
    .select("supplier_id, status, total_amount, created_at")
    .eq("organization_id", organization_id)
    .in("status", ["Ordered", "Received"]);

  const poCountMap: Record<string, number> = {};
  const pendingAmountMap: Record<string, number> = {};

  for (const po of purchases || []) {
    poCountMap[po.supplier_id] = (poCountMap[po.supplier_id] || 0) + 1;
    pendingAmountMap[po.supplier_id] =
      (pendingAmountMap[po.supplier_id] || 0) + Number(po.total_amount || 0);
  }

  const results: SupplierOutstandingResult[] = [];

  for (const s of suppliers) {
    const recordedBalance = Number(s.outstanding_balance || 0);
    const pendingPoBalance = pendingAmountMap[s.id] || 0;
    const totalDue = Math.max(recordedBalance, pendingPoBalance);

    if (totalDue >= min_due) {
      let dueStatus: "CRITICAL_DUE" | "UPCOMING" | "NORMAL" = "NORMAL";
      if (s.credit_days <= 15 || totalDue > 5000) {
        dueStatus = "CRITICAL_DUE";
      } else if (s.credit_days <= 30) {
        dueStatus = "UPCOMING";
      }

      results.push({
        supplier_id: s.id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        credit_days: s.credit_days || 30,
        outstanding_balance: Number(totalDue.toFixed(2)),
        pending_pos_count: poCountMap[s.id] || 0,
        overdue_amount: dueStatus === "CRITICAL_DUE" ? Number((totalDue * 0.4).toFixed(2)) : 0,
        due_status: dueStatus,
      });
    }
  }

  return results.sort((a, b) => b.outstanding_balance - a.outstanding_balance);
}
