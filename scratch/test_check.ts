import { adminDb } from "../src/lib/db";

async function checkLedger() {
  const { data, error } = await adminDb.from("inventory_ledger").select("*");
  console.log("Existing rows in inventory_ledger:", data?.length, error);
  if (data && data.length > 0) {
    console.log("Sample rows:", data);
  }
}

checkLedger();
