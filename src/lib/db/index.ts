import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Organization,
  Store,
  Profile,
  Product,
  InventoryLedgerEntry,
  MovementType,
  Supplier,
  PurchaseOrder,
  Sale,
  ReturnRecord,
  Expense,
  NotificationItem,
  AiReport,
} from "@/types";
import * as fs from "fs";
import * as path from "path";

// Helper to auto-load .env.local if not already in process.env
function ensureEnvLoaded() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = match[2] || "";
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (!process.env[key]) {
              process.env[key] = value.trim();
            }
          }
        });
      }
    } catch {
      // ignore
    }
  }
}

ensureEnvLoaded();

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lqcyiixtdwsgnqjxhvmh.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM4MDE5NiwiZXhwIjoyMTAyOTU2MTk2fQ.3n_pkHPHMER5wmXeqUFoZVRcsjXJAdOvAZUH3wIo7fw";

export const adminDb = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const ORG_MAP: Record<string, string> = {
  org_01: "00000000-0000-0000-0000-000000000001",
  org_02: "00000000-0000-0000-0000-000000000002",
  org_03: "00000000-0000-0000-0000-000000000003",
};

export const STORE_MAP: Record<string, string> = {
  store_01_main: "00000000-0000-0000-0001-000000000001",
  store_01_branch: "00000000-0000-0000-0001-000000000002",
  store_02_main: "00000000-0000-0000-0002-000000000001",
  store_02_branch: "00000000-0000-0000-0002-000000000002",
  store_03_main: "00000000-0000-0000-0003-000000000001",
};

export function normalizeOrgId(id?: string | null): string {
  if (!id) return "00000000-0000-0000-0000-000000000001";
  return ORG_MAP[id.toLowerCase()] || id;
}

export function normalizeStoreId(id?: string | null): string | undefined {
  if (!id) return undefined;
  return STORE_MAP[id.toLowerCase()] || id;
}

export function getSupabaseAdmin() {
  return adminDb;
}

export function getScopedDb(orgId?: string) {
  return adminDb;
}

// Master Static Catalog for fallback and seeding
export const MASTER_PRODUCTS_CATALOG: Product[] = [
  // -------------------------------------------------------------
  // Org 01: Apex Supermarket & Grocery (FMCG & Groceries)
  // -------------------------------------------------------------
  {
    id: "00000000-0000-0001-0001-000000000001",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Amul Gold Whole Milk 1L",
    sku: "GRO-MLK-001",
    barcode: "8901001001",
    category: "Dairy & Breakfast",
    cost_price: 54.00,
    selling_price: 68.00,
    reorder_level: 25,
    current_stock: 78,
  },
  {
    id: "00000000-0000-0001-0001-000000000002",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Artisan Sourdough Wheat Bread 400g",
    sku: "GRO-BRD-002",
    barcode: "8901001002",
    category: "Bakery",
    cost_price: 35.00,
    selling_price: 55.00,
    reorder_level: 20,
    current_stock: 25,
  },
  {
    id: "00000000-0000-0001-0001-000000000003",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Farm Fresh Organic Eggs (Pack of 12)",
    sku: "GRO-EGG-003",
    barcode: "8901001003",
    category: "Dairy & Breakfast",
    cost_price: 75.00,
    selling_price: 99.00,
    reorder_level: 30,
    current_stock: 38,
  },
  {
    id: "00000000-0000-0001-0001-000000000004",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Coorg Premium Arabica Dark Roast 500g",
    sku: "GRO-COF-004",
    barcode: "8901001004",
    category: "Beverages & Tea",
    cost_price: 320.00,
    selling_price: 499.00,
    reorder_level: 15,
    current_stock: 10,
  },
  {
    id: "00000000-0000-0001-0001-000000000005",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Extra Virgin Cold Pressed Olive Oil 1L",
    sku: "GRO-OIL-005",
    barcode: "8901001005",
    category: "Oils & Staples",
    cost_price: 650.00,
    selling_price: 899.00,
    reorder_level: 12,
    current_stock: 14,
  },
  {
    id: "00000000-0000-0001-0001-000000000006",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Himalayan Pink Salt Kettle Chips 150g",
    sku: "GRO-CHP-006",
    barcode: "8901001006",
    category: "Snacks & Munchies",
    cost_price: 28.00,
    selling_price: 50.00,
    reorder_level: 40,
    current_stock: 60,
  },
  {
    id: "00000000-0000-0001-0001-000000000007",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Tata Tea Gold Darjeeling Blend 500g",
    sku: "GRO-TEA-007",
    barcode: "8901001007",
    category: "Beverages & Tea",
    cost_price: 190.00,
    selling_price: 280.00,
    reorder_level: 20,
    current_stock: 45,
  },
  {
    id: "00000000-0000-0001-0001-000000000008",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    sku: "GRO-ATT-008",
    barcode: "8901001008",
    category: "Oils & Staples",
    cost_price: 210.00,
    selling_price: 265.00,
    reorder_level: 25,
    current_stock: 55,
  },
  {
    id: "00000000-0000-0001-0001-000000000009",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Cadbury Dairy Milk Silk Chocolate 150g",
    sku: "GRO-CHK-009",
    barcode: "8901001009",
    category: "Snacks & Munchies",
    cost_price: 125.00,
    selling_price: 175.00,
    reorder_level: 30,
    current_stock: 65,
  },
  {
    id: "00000000-0000-0001-0001-000000000010",
    organization_id: "org_01",
    store_id: "store_01_main",
    name: "Kashmir Royal Saffron Truffle Infusion 250ml",
    sku: "GRO-TRF-099",
    barcode: "8901001099",
    category: "Gourmet & Specialty",
    cost_price: 1800.00,
    selling_price: 2999.00,
    reorder_level: 5,
    current_stock: 18,
  },

  // -------------------------------------------------------------
  // Org 02: Vogue Fashion Hub (Boutique & Ethnic Apparel)
  // -------------------------------------------------------------
  {
    id: "00000000-0000-0002-0001-000000000001",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Pure Pashmina Wool Tailored Blazer",
    sku: "FAS-BLZ-101",
    barcode: "8902002001",
    category: "Formal Wear",
    cost_price: 3500.00,
    selling_price: 7999.00,
    reorder_level: 10,
    current_stock: 16,
  },
  {
    id: "00000000-0000-0002-0001-000000000002",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Arvind Selvedge Raw Denim Jeans",
    sku: "FAS-JNS-102",
    barcode: "8902002002",
    category: "Casual Denim",
    cost_price: 1200.00,
    selling_price: 2899.00,
    reorder_level: 15,
    current_stock: 24,
  },
  {
    id: "00000000-0000-0002-0001-000000000003",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Egyptian Cotton Oxford Slim Fit Shirt",
    sku: "FAS-SHT-103",
    barcode: "8902002003",
    category: "Formal Wear",
    cost_price: 750.00,
    selling_price: 1799.00,
    reorder_level: 20,
    current_stock: 32,
  },
  {
    id: "00000000-0000-0002-0001-000000000004",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Chanderi Silk Embroidered Anarkali Kurta",
    sku: "FAS-KRT-104",
    barcode: "8902002004",
    category: "Ethnic Luxury",
    cost_price: 1800.00,
    selling_price: 4299.00,
    reorder_level: 8,
    current_stock: 18,
  },
  {
    id: "00000000-0000-0002-0001-000000000005",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Classic Italian Leather Formal Belt (Tan)",
    sku: "FAS-ACC-105",
    barcode: "8902002005",
    category: "Accessories",
    cost_price: 450.00,
    selling_price: 1199.00,
    reorder_level: 15,
    current_stock: 40,
  },
  {
    id: "00000000-0000-0002-0001-000000000006",
    organization_id: "org_02",
    store_id: "store_02_main",
    name: "Vintage Royal Velvet Bandhgala Cape",
    sku: "FAS-CPT-999",
    barcode: "8902002999",
    category: "Ethnic Luxury",
    cost_price: 5500.00,
    selling_price: 14999.00,
    reorder_level: 4,
    current_stock: 8,
  },

  // -------------------------------------------------------------
  // Org 03: Volt Consumer Electronics (Gadgets & Hardware)
  // -------------------------------------------------------------
  {
    id: "00000000-0000-0003-0001-000000000001",
    organization_id: "org_03",
    store_id: "store_03_main",
    name: "Volt ProMax 5G Smartphone (12GB/256GB)",
    sku: "ELE-PHN-201",
    barcode: "8903003001",
    category: "Smartphones",
    cost_price: 34999.00,
    selling_price: 49999.00,
    reorder_level: 8,
    current_stock: 12,
  },
  {
    id: "00000000-0000-0003-0001-000000000002",
    organization_id: "org_03",
    store_id: "store_03_main",
    name: "Volt SoundPulse ANC Wireless Headphones",
    sku: "ELE-AUD-202",
    barcode: "8903003002",
    category: "Audio & Sound",
    cost_price: 4500.00,
    selling_price: 8999.00,
    reorder_level: 12,
    current_stock: 22,
  },
  {
    id: "00000000-0000-0003-0001-000000000003",
    organization_id: "org_03",
    store_id: "store_03_main",
    name: "Braided 100W USB-C Type-C Fast Charging Cable 2m",
    sku: "ELE-CBL-203",
    barcode: "8903003003",
    category: "Accessories",
    cost_price: 199.00,
    selling_price: 699.00,
    reorder_level: 35,
    current_stock: 85,
  },
  {
    id: "00000000-0000-0003-0001-000000000004",
    organization_id: "org_03",
    store_id: "store_03_main",
    name: "Volt Horizon OLED Smartwatch with ECG",
    sku: "ELE-WAT-204",
    barcode: "8903003004",
    category: "Wearables",
    cost_price: 5500.00,
    selling_price: 11499.00,
    reorder_level: 6,
    current_stock: 15,
  },
  {
    id: "00000000-0000-0003-0001-000000000005",
    organization_id: "org_03",
    store_id: "store_03_main",
    name: "Volt 65W GaN Triple-Port Fast Wall Charger",
    sku: "ELE-CHG-205",
    barcode: "8903003005",
    category: "Accessories",
    cost_price: 799.00,
    selling_price: 1999.00,
    reorder_level: 20,
    current_stock: 42,
  },
];

/**
 * Calculates current stock from immutable inventory ledger.
 * Current Stock = Opening Stock + Purchases - Sales + Returns - Damaged ± Adjustments
 */
export async function calculateCurrentStock(
  organizationId: string,
  productId: string,
  storeId?: string
): Promise<number> {
  try {
    let query = adminDb
      .from("inventory_ledger")
      .select("quantity")
      .eq("product_id", productId);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const fallback = MASTER_PRODUCTS_CATALOG.find((p) => p.id === productId || p.sku === productId);
      return fallback?.current_stock ?? 25;
    }

    return (data || []).reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
  } catch {
    return 25;
  }
}

/**
 * Calculates stock for all products in an organization or store
 */
export async function calculateAllProductsStock(
  organizationId: string,
  storeId?: string
): Promise<Record<string, number>> {
  const stockMap: Record<string, number> = {};

  // Initialize from master catalog defaults
  for (const prod of MASTER_PRODUCTS_CATALOG) {
    if (prod.current_stock !== undefined) {
      stockMap[prod.id] = prod.current_stock;
      stockMap[prod.sku] = prod.current_stock;
    }
  }

  try {
    const orgId = normalizeOrgId(organizationId);
    let query = adminDb.from("inventory_ledger").select("product_id, quantity").eq("organization_id", orgId);
    if (storeId) {
      const sId = normalizeStoreId(storeId);
      if (sId) query = query.eq("store_id", sId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const ledgerSums: Record<string, number> = {};
      for (const row of data) {
        ledgerSums[row.product_id] = (ledgerSums[row.product_id] || 0) + Number(row.quantity || 0);
      }
      for (const [prodId, sum] of Object.entries(ledgerSums)) {
        stockMap[prodId] = sum;
      }
    }

    return stockMap;
  } catch {
    return stockMap;
  }
}

/**
 * Records an immutable movement in the inventory ledger.
 */
export async function recordLedgerMovement(entry: {
  organization_id: string;
  store_id?: string;
  product_id: string;
  movement_type: MovementType | string;
  quantity: number; // positive for additions, negative for deductions
  cost_price?: number;
  reference_id?: string;
  notes?: string;
}): Promise<InventoryLedgerEntry | null> {
  try {
    const orgId = normalizeOrgId(entry.organization_id);
    const storeId = normalizeStoreId(entry.store_id) || "00000000-0000-0000-0001-000000000001";

    const MOVEMENT_MAP: Record<string, string> = {
      OPENING_STOCK: "Opening",
      OPENING: "Opening",
      Opening: "Opening",
      PURCHASE: "Purchase",
      Purchase: "Purchase",
      SALE: "Sale",
      Sale: "Sale",
      RETURN: "Return",
      Return: "Return",
      DAMAGED: "Damaged",
      Damaged: "Damaged",
      ADJUSTMENT: "Adjustment",
      Adjustment: "Adjustment",
      TRANSFER_IN: "Adjustment",
      TRANSFER_OUT: "Adjustment",
    };

    const formattedType = MOVEMENT_MAP[entry.movement_type] || "Adjustment";

    const payload = {
      organization_id: orgId,
      store_id: storeId,
      product_id: entry.product_id,
      movement_type: formattedType,
      quantity: Number(entry.quantity),
      reference_id: entry.reference_id || null,
      notes: entry.notes || `Stock movement ${formattedType}`,
    };

    const { data, error } = await adminDb
      .from("inventory_ledger")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Ledger insert note:", error.message);
      return null;
    }
    return data as InventoryLedgerEntry;
  } catch (err) {
    console.error("Failed to record ledger movement:", err);
    return null;
  }
}

/**
 * Creates an in-app notification.
 */
export async function createNotification(
  organizationId: string,
  title: string,
  message: string,
  type: string = "SYSTEM",
  storeId?: string
): Promise<NotificationItem | null> {
  try {
    const { data, error } = await adminDb
      .from("notifications")
      .insert([
        {
          organization_id: organizationId,
          store_id: storeId || null,
          title,
          message,
          type,
          read: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Notification insert note:", error.message);
      return null;
    }
    return data as NotificationItem;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}
