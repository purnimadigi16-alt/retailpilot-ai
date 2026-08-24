import { adminDb } from "../src/lib/db";

async function checkColumns() {
  try {
    const s = await adminDb.from("sales").select("*").limit(1);
    console.log("Sales row columns:", s.data?.[0] ? Object.keys(s.data[0]) : "No sales rows");

    const r = await adminDb.from("returns").select("*").limit(1);
    console.log("Returns row columns:", r.data?.[0] ? Object.keys(r.data[0]) : "No return rows");

    const l = await adminDb.from("inventory_ledger").select("*").limit(1);
    console.log("Ledger row columns:", l.data?.[0] ? Object.keys(l.data[0]) : "No ledger rows");

    const e = await adminDb.from("expenses").select("*").limit(1);
    console.log("Expenses row columns:", e.data?.[0] ? Object.keys(e.data[0]) : "No expense rows");
  } catch (err) {
    console.error("Error checking columns:", err);
  }
}

checkColumns();
