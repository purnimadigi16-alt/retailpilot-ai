import { adminDb, normalizeOrgId, normalizeStoreId } from "../src/lib/db";

async function testTitleCases() {
  const orgId = normalizeOrgId("org_01");
  const storeId = normalizeStoreId("store_01_main");
  const prodId = "00000000-0000-0001-0001-000000000001";

  const candidates = [
    "Sale", "Purchase", "Return", "Damaged", "Adjustment", "Transfer_In", "Transfer_Out",
    "Opening_Stock", "Opening Stock", "Opening", "Initial", "Restock"
  ];

  for (const c of candidates) {
    const res = await adminDb.from("inventory_ledger").insert([{
      organization_id: orgId,
      store_id: storeId,
      product_id: prodId,
      movement_type: c,
      quantity: 1,
      notes: "Test " + c,
    }]).select();

    console.log(`Candidate '${c}' -> Success: ${!res.error}, Error: ${res.error?.message}`);
  }
}

testTitleCases();
