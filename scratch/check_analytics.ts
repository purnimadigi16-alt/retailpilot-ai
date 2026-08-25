import { adminDb, normalizeOrgId, normalizeStoreId } from "../src/lib/db";

async function testAnalytics() {
  const orgId = normalizeOrgId("org_01");
  console.log("Normalized orgId:", orgId);

  const { data: sales, error: sErr } = await adminDb.from("sales").select("*").eq("organization_id", orgId);
  console.log("Sales:", sales?.length, "| Error:", sErr?.message);

  const { data: products, error: pErr } = await adminDb.from("products").select("*").eq("organization_id", orgId);
  console.log("Products:", products?.length, "| Error:", pErr?.message);

  const { data: expenses, error: eErr } = await adminDb.from("expenses").select("*").eq("organization_id", orgId);
  console.log("Expenses:", expenses?.length, "| Error:", eErr?.message);
}

testAnalytics();
