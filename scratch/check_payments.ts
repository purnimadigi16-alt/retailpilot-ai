import { adminDb } from "../src/lib/db";

async function checkPaymentMethods() {
  const { data, error } = await adminDb.from("payments").select("*").limit(10);
  console.log("Existing Payment Methods in DB:", data?.map((p) => p.method), error);

  // Test inserting with Cash, Card, UPI
  const testSale = await adminDb.from("sales").select("id").limit(1).single();
  if (testSale.data) {
    const t1 = await adminDb.from("payments").insert([{ sale_id: testSale.data.id, method: "UPI", amount: 10 }]);
    console.log("Test UPI insert:", t1.error ? t1.error.message : "SUCCESS");
    const t2 = await adminDb.from("payments").insert([{ sale_id: testSale.data.id, method: "Cash", amount: 10 }]);
    console.log("Test Cash insert:", t2.error ? t2.error.message : "SUCCESS");
    const t3 = await adminDb.from("payments").insert([{ sale_id: testSale.data.id, method: "CASH", amount: 10 }]);
    console.log("Test CASH insert:", t3.error ? t3.error.message : "SUCCESS");
    const t4 = await adminDb.from("payments").insert([{ sale_id: testSale.data.id, method: "CARD", amount: 10 }]);
    console.log("Test CARD insert:", t4.error ? t4.error.message : "SUCCESS");
    const t5 = await adminDb.from("payments").insert([{ sale_id: testSale.data.id, method: "Card", amount: 10 }]);
    console.log("Test Card insert:", t5.error ? t5.error.message : "SUCCESS");
  }
}

checkPaymentMethods();
