import { adminDb, normalizeOrgId, normalizeStoreId, MASTER_PRODUCTS_CATALOG } from "../src/lib/db";

async function testMovementTypes() {
  const orgId = normalizeOrgId("org_01");
  const storeId = normalizeStoreId("store_01_main");
  const prodId = "00000000-0000-0001-0001-000000000001";

  const types = ["OPENING_STOCK", "PURCHASE", "SALE", "RETURN", "DAMAGED", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT", "sale", "purchase", "return", "damaged", "adjustment"];

  for (const t of types) {
    const res = await adminDb.from("inventory_ledger").insert([{
      organization_id: orgId,
      store_id: storeId,
      product_id: prodId,
      movement_type: t,
      quantity: 1,
      notes: "Test movement " + t,
    }]).select();

    console.log(`Type: ${t} -> Success: ${!res.error}, Error: ${res.error?.message}`);
  }
}

testMovementTypes();
