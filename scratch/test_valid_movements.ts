import { adminDb, normalizeOrgId, normalizeStoreId } from "../src/lib/db";

async function testValidMovements() {
  const orgId = normalizeOrgId("org_01");
  const storeId = normalizeStoreId("store_01_main");

  // Fetch a real product from DB
  const { data: prods } = await adminDb.from("products").select("*").eq("organization_id", orgId).limit(1);
  if (!prods || prods.length === 0) {
    console.log("No product found");
    return;
  }
  const prodId = prods[0].id;
  console.log("Testing with real product:", prodId, prods[0].name);

  const movements = ["Opening", "Purchase", "Sale", "Return", "Damaged", "Adjustment"];

  for (const m of movements) {
    const res = await adminDb.from("inventory_ledger").insert([{
      organization_id: orgId,
      store_id: storeId,
      product_id: prodId,
      movement_type: m,
      quantity: m === "Sale" || m === "Damaged" ? -1 : 1,
      notes: `Test ledger movement ${m}`,
    }]).select();

    console.log(`Movement '${m}' -> Success: ${!res.error}, Error: ${res.error?.message}`);
  }
}

testValidMovements();
