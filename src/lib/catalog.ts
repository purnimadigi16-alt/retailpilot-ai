import { Product } from "@/types";

export const CLIENT_PRODUCTS_CATALOG: Product[] = [
  // --- Apex Supermarket (org_01) ---
  {
    id: "00000000-0000-0001-0001-000000000001",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-MLK-001",
    barcode: "8901001001",
    name: "Amul Gold Organic Whole Milk 1L",
    category: "Fresh Produce & Dairy",
    cost_price: 54.0,
    selling_price: 68.0,
    current_stock: 78,
    reorder_level: 20,
    gst_rate: 0, // 0% GST (Fresh milk)
  },
  {
    id: "00000000-0000-0001-0001-000000000002",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-BRD-002",
    barcode: "8901001002",
    name: "Sourdough Artisanal Bread 400g",
    category: "Bakery & Staples",
    cost_price: 38.0,
    selling_price: 55.0,
    current_stock: 25,
    reorder_level: 10,
    gst_rate: 5, // 5% GST (Packaged bread)
  },
  {
    id: "00000000-0000-0001-0001-000000000003",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-EGG-003",
    barcode: "8901001003",
    name: "Farm Fresh Free-Range Eggs (Pack of 12)",
    category: "Fresh Produce & Dairy",
    cost_price: 85.0,
    selling_price: 110.0,
    current_stock: 42,
    reorder_level: 15,
    gst_rate: 0, // 0% GST (Unprocessed eggs)
  },
  {
    id: "00000000-0000-0001-0001-000000000004",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-COF-004",
    barcode: "8901001004",
    name: "Coorg Premium Arabica Dark Roast 500g",
    category: "Packaged Beverages",
    cost_price: 320.0,
    selling_price: 450.0,
    current_stock: 10,
    reorder_level: 15,
    gst_rate: 5, // 5% GST (Coffee)
  },
  {
    id: "00000000-0000-0001-0001-000000000005",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-OIL-005",
    barcode: "8901001005",
    name: "Cold Pressed Virgin Coconut Oil 1L",
    category: "Bakery & Staples",
    cost_price: 240.0,
    selling_price: 340.0,
    current_stock: 30,
    reorder_level: 8,
    gst_rate: 5, // 5% GST (Edible oil)
  },
  {
    id: "00000000-0000-0001-0001-000000000006",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-CHP-006",
    barcode: "8901001006",
    name: "Kerala Tapioca Spiced Crisps 200g",
    category: "Processed Snacks",
    cost_price: 32.0,
    selling_price: 50.0,
    current_stock: 85,
    reorder_level: 25,
    gst_rate: 12, // 12% GST (Processed snacks)
  },
  {
    id: "00000000-0000-0001-0001-000000000007",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-TEA-007",
    barcode: "8901001007",
    name: "Darjeeling First Flush Black Tea 250g",
    category: "Packaged Beverages",
    cost_price: 280.0,
    selling_price: 420.0,
    current_stock: 18,
    reorder_level: 10,
    gst_rate: 5, // 5% GST (Tea)
  },
  {
    id: "00000000-0000-0001-0001-000000000008",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-ATT-008",
    barcode: "8901001008",
    name: "Organic Whole Wheat Atta 5kg",
    category: "Bakery & Staples",
    cost_price: 210.0,
    selling_price: 285.0,
    current_stock: 45,
    reorder_level: 15,
    gst_rate: 5, // 5% GST (Atta)
  },
  {
    id: "00000000-0000-0001-0001-000000000009",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-CHK-009",
    barcode: "8901001009",
    name: "Cadbury Dairy Milk Silk Roasted Almond 143g",
    category: "Confectionery & Chocolates",
    cost_price: 130.0,
    selling_price: 175.0,
    current_stock: 65,
    reorder_level: 20,
    gst_rate: 18, // 18% GST (Chocolates)
  },
  {
    id: "00000000-0000-0001-0001-000000000010",
    organization_id: "00000000-0000-0000-0000-000000000001",
    store_id: "00000000-0000-0001-0000-000000000001",
    sku: "GRO-TRF-099",
    barcode: "8901001099",
    name: "Kashmir Saffron Truffle Gourmet Infusion 50g",
    category: "Luxury Specialty Gourmet",
    cost_price: 2200.0,
    selling_price: 2999.0,
    current_stock: 12,
    reorder_level: 5,
    gst_rate: 28, // 28% GST (Luxury Gourmet)
  },

  // --- Vogue Fashion (org_02) ---
  {
    id: "00000000-0000-0002-0001-000000000001",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-BLZ-101",
    barcode: "8902001001",
    name: "Italian Wool Slim Fit Blazer Navy 40R",
    category: "Tailored Formalwear",
    cost_price: 4200.0,
    selling_price: 7999.0,
    current_stock: 14,
    reorder_level: 5,
    gst_rate: 12, // 12% GST (Apparel)
  },
  {
    id: "00000000-0000-0002-0001-000000000002",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-JNS-102",
    barcode: "8902001002",
    name: "Japanese Selvedge Denim Jeans 32W",
    category: "Casual Denim",
    cost_price: 1800.0,
    selling_price: 3499.0,
    current_stock: 28,
    reorder_level: 8,
    gst_rate: 12, // 12% GST (Apparel)
  },
  {
    id: "00000000-0000-0002-0001-000000000003",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-SHT-103",
    barcode: "8902001003",
    name: "Egyptian Cotton Oxford Formal Shirt 42",
    category: "Tailored Formalwear",
    cost_price: 950.0,
    selling_price: 1999.0,
    current_stock: 35,
    reorder_level: 12,
    gst_rate: 12, // 12% GST (Apparel)
  },
  {
    id: "00000000-0000-0002-0001-000000000004",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-KRT-104",
    barcode: "8902001004",
    name: "Handwoven Chanderi Silk Kurta Set M",
    category: "Ethnic Festive Wear",
    cost_price: 2100.0,
    selling_price: 4499.0,
    current_stock: 19,
    reorder_level: 6,
    gst_rate: 12, // 12% GST (Apparel)
  },
  {
    id: "00000000-0000-0002-0001-000000000005",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-ACC-105",
    barcode: "8902001005",
    name: "Full Grain Leather Belt & Cardholder Combo",
    category: "Leather Accessories",
    cost_price: 650.0,
    selling_price: 1299.0,
    current_stock: 45,
    reorder_level: 10,
    gst_rate: 18, // 18% GST (Leather accessories)
  },
  {
    id: "00000000-0000-0002-0001-000000000006",
    organization_id: "00000000-0000-0000-0000-000000000002",
    store_id: "00000000-0000-0002-0000-000000000001",
    sku: "FAS-CPT-999",
    barcode: "8902001099",
    name: "Haute Couture Gold Embroidered Velvet Cape",
    category: "Luxury Designer Couture",
    cost_price: 8500.0,
    selling_price: 18999.0,
    current_stock: 4,
    reorder_level: 2,
    gst_rate: 28, // 28% GST (Luxury Couture)
  },

  // --- Volt Electronics (org_03) ---
  {
    id: "00000000-0000-0003-0001-000000000001",
    organization_id: "00000000-0000-0000-0000-000000000003",
    store_id: "00000000-0000-0003-0000-000000000001",
    sku: "ELE-PHN-201",
    barcode: "8903001001",
    name: "Apex 5G Flagship Smartphone 256GB Midnight Black",
    category: "Smartphones & Tablets",
    cost_price: 38000.0,
    selling_price: 49999.0,
    current_stock: 15,
    reorder_level: 4,
    gst_rate: 18, // 18% GST (Electronics)
  },
  {
    id: "00000000-0000-0003-0001-000000000002",
    organization_id: "00000000-0000-0000-0000-000000000003",
    store_id: "00000000-0000-0003-0000-000000000001",
    sku: "ELE-HDP-202",
    barcode: "8903001002",
    name: "Pro ANC Wireless Over-Ear Headphones Silver",
    category: "Audio & Acoustics",
    cost_price: 8500.0,
    selling_price: 14499.0,
    current_stock: 22,
    reorder_level: 6,
    gst_rate: 18, // 18% GST (Audio Electronics)
  },
  {
    id: "00000000-0000-0003-0001-000000000003",
    organization_id: "00000000-0000-0000-0000-000000000003",
    store_id: "00000000-0000-0003-0000-000000000001",
    sku: "ELE-CBL-203",
    barcode: "8903001003",
    name: "Braided 100W USB-C PD Fast Charge Cable 2M",
    category: "Cables & Power Accessories",
    cost_price: 350.0,
    selling_price: 799.0,
    current_stock: 90,
    reorder_level: 25,
    gst_rate: 18, // 18% GST (Tech cables)
  },
  {
    id: "00000000-0000-0003-0001-000000000004",
    organization_id: "00000000-0000-0000-0000-000000000003",
    store_id: "00000000-0000-0003-0000-000000000001",
    sku: "ELE-WAT-204",
    barcode: "8903001004",
    name: "OLED Smartwatch Pro with ECG & GPS 44mm",
    category: "Wearables & IoT",
    cost_price: 11000.0,
    selling_price: 18999.0,
    current_stock: 16,
    reorder_level: 5,
    gst_rate: 18, // 18% GST (Smartwatch)
  },
  {
    id: "00000000-0000-0003-0001-000000000005",
    organization_id: "00000000-0000-0000-0000-000000000003",
    store_id: "00000000-0000-0003-0000-000000000001",
    sku: "ELE-CHG-205",
    barcode: "8903001005",
    name: "65W GaN Dual USB-C Fast Wall Charger",
    category: "Cables & Power Accessories",
    cost_price: 1100.0,
    selling_price: 2199.0,
    current_stock: 40,
    reorder_level: 10,
    gst_rate: 18, // 18% GST (Charger)
  },
];

export function getClientProductsForOrg(orgId: string): Product[] {
  const normalized = (orgId || "org_01").toLowerCase();
  return CLIENT_PRODUCTS_CATALOG.filter((p) => {
    if (normalized === "org_01" || normalized === "00000000-0000-0000-0000-000000000001") {
      return p.organization_id === "00000000-0000-0000-0000-000000000001";
    }
    if (normalized === "org_02" || normalized === "00000000-0000-0000-0000-000000000002") {
      return p.organization_id === "00000000-0000-0000-0000-000000000002";
    }
    if (normalized === "org_03" || normalized === "00000000-0000-0000-0000-000000000003") {
      return p.organization_id === "00000000-0000-0000-0000-000000000003";
    }
    return p.organization_id === "00000000-0000-0000-0000-000000000001";
  });
}
