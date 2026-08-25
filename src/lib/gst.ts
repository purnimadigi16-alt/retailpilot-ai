/**
 * Statutory Indian GST Rates (0%, 5%, 12%, 18%, 28%)
 * Standard statutory categorization under Indian Goods and Services Tax Act.
 */

export const GST_SLABS = [0, 5, 12, 18, 28] as const;
export type GstSlab = typeof GST_SLABS[number];

/**
 * Resolves the statutory Indian GST slab rate (0%, 5%, 12%, 18%, 28%) for any product or category.
 */
export function getEffectiveGstRate(product: { category?: string; gst_rate?: number }): number {
  if (product.gst_rate !== undefined && product.gst_rate !== null && !isNaN(Number(product.gst_rate))) {
    return Number(product.gst_rate);
  }
  const cat = (product.category || "").toLowerCase();
  if (cat.includes("dairy") || cat.includes("egg") || cat.includes("fresh produce") || cat.includes("milk")) return 0;
  if (cat.includes("bakery") || cat.includes("bread") || cat.includes("oil") || cat.includes("staple") || cat.includes("beverage") || cat.includes("tea") || cat.includes("coffee") || cat.includes("atta")) return 5;
  if (cat.includes("snack") || cat.includes("formal") || cat.includes("denim") || cat.includes("apparel") || cat.includes("shirt") || cat.includes("kurta")) return 12;
  if (cat.includes("choc") || cat.includes("accessories") || cat.includes("smart") || cat.includes("audio") || cat.includes("wearable") || cat.includes("charging") || cat.includes("gadget")) return 18;
  if (cat.includes("gourmet") || cat.includes("luxury") || cat.includes("specialty") || cat.includes("truffle") || cat.includes("velvet")) return 28;
  return 5; // standard FMCG default slab
}

export interface GstTaxBreakdown {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  items: Array<{
    product_id: string;
    name: string;
    selling_price: number;
    quantity: number;
    gst_rate: number;
    lineSubtotal: number;
    discountedLine: number;
    lineTax: number;
    cgst: number;
    sgst: number;
  }>;
}

export function calculateCartGst(
  items: Array<{ product_id: string; name?: string; selling_price: number; quantity: number; gst_rate?: number; category?: string }>,
  discountAmount: number = 0
): GstTaxBreakdown {
  const subtotal = items.reduce((acc, curr) => acc + Number(curr.selling_price) * Number(curr.quantity), 0);
  const discountRatio = subtotal > 0 ? Math.min(1, Math.max(0, discountAmount) / subtotal) : 0;

  const itemDetails = items.map((item) => {
    const rate = getEffectiveGstRate(item);
    const lineSubtotal = Number(item.selling_price) * Number(item.quantity);
    const discountedLine = lineSubtotal * (1 - discountRatio);
    const lineTax = Number(((discountedLine * rate) / 100).toFixed(2));
    const halfTax = Number((lineTax / 2).toFixed(2));
    return {
      product_id: item.product_id,
      name: item.name || "Item",
      selling_price: Number(item.selling_price),
      quantity: Number(item.quantity),
      gst_rate: rate,
      lineSubtotal,
      discountedLine,
      lineTax,
      cgst: halfTax,
      sgst: Number((lineTax - halfTax).toFixed(2)),
    };
  });

  const totalGst = Number(itemDetails.reduce((acc, curr) => acc + curr.lineTax, 0).toFixed(2));
  const cgst = Number((totalGst / 2).toFixed(2));
  const sgst = Number((totalGst - cgst).toFixed(2));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const grandTotal = Number((taxableAmount + totalGst).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    totalGst,
    cgst,
    sgst,
    grandTotal,
    items: itemDetails,
  };
}
