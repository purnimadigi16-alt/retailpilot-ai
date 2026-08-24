import { adminDb, normalizeOrgId } from "../src/lib/db";

async function testLedgerStock() {
  const orgId = normalizeOrgId("org_01");
  const { data, error } = await adminDb.from("inventory_ledger").select("product_id, quantity, movement_type, notes").eq("organization_id", orgId);
  console.log("Total ledger rows in DB:", data?.length, error);

  const sumByProd: Record<string, number> = {};
  data?.forEach((r) => {
    sumByProd[r.product_id] = (sumByProd[r.product_id] || 0) + Number(r.quantity || 0);
    console.log(` - Prod: ${r.product_id}, Type: ${r.movement_type}, Qty: ${r.quantity}, Note: ${r.notes}`);
  });

  console.log("\nCalculated Sum by Product from Immutable Ledger:", sumByProd);
}

testLedgerStock();
