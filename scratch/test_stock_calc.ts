import { adminDb, normalizeOrgId, MASTER_PRODUCTS_CATALOG } from "../src/lib/db";

async function testStockCalculation() {
  const orgId = normalizeOrgId("org_01");
  const { data: ledgerRows, error } = await adminDb.from("inventory_ledger").select("product_id, quantity, movement_type").eq("organization_id", orgId);

  console.log("Ledger rows count:", ledgerRows?.length);

  const ledgerSums: Record<string, number> = {};
  for (const row of ledgerRows || []) {
    ledgerSums[row.product_id] = (ledgerSums[row.product_id] || 0) + Number(row.quantity || 0);
  }

  console.log("\nExact Ledger Sums by Product:");
  for (const prod of MASTER_PRODUCTS_CATALOG.filter(p => p.organization_id === "org_01")) {
    const liveStock = ledgerSums[prod.id] !== undefined ? ledgerSums[prod.id] : prod.current_stock;
    console.log(` - ${prod.name} (${prod.sku}): Live Stock = ${liveStock} (Catalog Default = ${prod.current_stock})`);
  }
}

testStockCalculation();
