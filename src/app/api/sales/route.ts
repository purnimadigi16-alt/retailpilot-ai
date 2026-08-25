import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  normalizeOrgId,
  normalizeStoreId,
  recordLedgerMovement,
  getEffectiveGstRate,
  MASTER_PRODUCTS_CATALOG,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = normalizeOrgId(searchParams.get("organization_id") || "org_01");
    const storeId = searchParams.get("store_id");

    let query = adminDb
      .from("sales")
      .select(
        "*, customers ( name, phone ), sale_items ( id, product_id, quantity, selling_price, total, products ( name, sku, category ) ), payments ( id, method, amount )"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organization_id,
      store_id,
      customer_id,
      items = [], // Array<{ product_id: string, quantity: number, selling_price: number, gst_rate?: number }>
      payments = [], // Array<{ method: string, amount: number }>
      discount = 0,
      notes,
    } = body;

    if (!organization_id || !store_id || !items.length) {
      return NextResponse.json(
        { error: "Invalid checkout request. Organization, store, and items are required." },
        { status: 400 }
      );
    }

    const orgId = normalizeOrgId(organization_id);
    const sId = normalizeStoreId(store_id);

    // Fetch products to retrieve statutory GST rates per item
    const { data: dbProducts } = await adminDb
      .from("products")
      .select("id, category, selling_price")
      .eq("organization_id", orgId);

    const productMap = new Map<string, any>();
    for (const p of dbProducts || []) {
      productMap.set(p.id, p);
    }
    for (const p of MASTER_PRODUCTS_CATALOG) {
      if (!productMap.has(p.id)) productMap.set(p.id, p);
    }

    // Compute subtotal and itemized statutory GST
    let subtotal = 0;
    let rawTax = 0;
    const discountNum = Number(discount) || 0;

    for (const item of items) {
      const itemQty = Number(item.quantity) || 1;
      const itemPrice = Number(item.selling_price) || 0;
      const lineSubtotal = itemPrice * itemQty;
      subtotal += lineSubtotal;

      const prodMeta = productMap.get(item.product_id) || {};
      const itemGstRate =
        item.gst_rate !== undefined ? Number(item.gst_rate) : getEffectiveGstRate(prodMeta);

      const itemTax = (lineSubtotal * itemGstRate) / 100;
      rawTax += itemTax;
    }

    // Adjust tax proportionally if bill-level discount is applied
    const discountRatio = subtotal > 0 ? Math.min(1, discountNum / subtotal) : 0;
    const calculatedTax = Number((rawTax * (1 - discountRatio)).toFixed(2));
    const finalTotal = Number((Math.max(0, subtotal - discountNum) + calculatedTax).toFixed(2));

    // Verify split payments equal total amount
    const paymentsTotal = payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
    if (Math.abs(paymentsTotal - finalTotal) > 0.05 && payments.length > 0) {
      return NextResponse.json(
        {
          error: `Payment amount mismatch: payments total (₹${paymentsTotal.toFixed(2)}) must equal invoice total (₹${finalTotal.toFixed(2)})`,
        },
        { status: 422 }
      );
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // 1. Insert Sale record
    const { data: sale, error: saleErr } = await adminDb
      .from("sales")
      .insert([
        {
          organization_id: orgId,
          store_id: sId || null,
          customer_id: customer_id || null,
          invoice_number: invoiceNumber,
          subtotal: Number(subtotal.toFixed(2)),
          tax: calculatedTax,
          discount: Number(discount.toFixed(2)),
          total: finalTotal,
        },
      ])
      .select()
      .single();

    if (saleErr) {
      return NextResponse.json({
        id: `sale_${Date.now()}`,
        invoice_number: invoiceNumber,
        subtotal,
        tax: calculatedTax,
        total: finalTotal,
        payments,
        items,
      });
    }

    // 2. Insert Sale Items & Record Stock Ledger Deductions
    const saleItemsPayload = items.map((i: any) => ({
      sale_id: sale.id,
      product_id: i.product_id,
      quantity: Number(i.quantity),
      selling_price: Number(i.selling_price),
    }));

    await adminDb.from("sale_items").insert(saleItemsPayload);

    // Record immutable ledger movement for each item sold (negative quantity)
    for (const item of items) {
      await recordLedgerMovement({
        organization_id: orgId,
        store_id: sId,
        product_id: item.product_id,
        movement_type: "Sale",
        quantity: -Math.abs(Number(item.quantity)),
        reference_id: sale.id,
        notes: notes ? `POS sale - ${invoiceNumber} (${notes})` : `POS sale - ${invoiceNumber}`,
      });
    }

    // 3. Insert Split Payments (Map to TitleCase for payments_method_check constraint)
    const PAYMENT_METHOD_MAP: Record<string, string> = {
      CASH: "Cash",
      cash: "Cash",
      Cash: "Cash",
      CARD: "Card",
      card: "Card",
      Card: "Card",
      UPI: "UPI",
      upi: "UPI",
      LOYALTY_POINTS: "Points",
      points: "Points",
      Points: "Points",
    };

    if (payments.length > 0) {
      const paymentsPayload = payments.map((p: any) => ({
        sale_id: sale.id,
        method: PAYMENT_METHOD_MAP[p.method] || p.method || "Cash",
        amount: Number(p.amount),
      }));
      await adminDb.from("payments").insert(paymentsPayload);
    }

    // 4. Update Loyalty Points if Customer exists (1 point per ₹10 spent)
    if (customer_id) {
      const earnedPoints = Math.floor(finalTotal / 10);
      const { data: cust } = await adminDb
        .from("customers")
        .select("loyalty_points")
        .eq("id", customer_id)
        .single();

      if (cust) {
        const pointsPayment = payments.find((p: any) => p.method === "LOYALTY_POINTS");
        const pointsSpent = pointsPayment ? Math.floor(Number(pointsPayment.amount) * 10) : 0;
        const newPoints = Math.max(0, Number(cust.loyalty_points) - pointsSpent + earnedPoints);

        await adminDb
          .from("customers")
          .update({ loyalty_points: newPoints })
          .eq("id", customer_id);
      }
    }

    return NextResponse.json({
      ...sale,
      items,
      payments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
