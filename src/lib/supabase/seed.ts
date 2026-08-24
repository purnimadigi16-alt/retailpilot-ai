import { getSupabaseAdmin } from "../db";

export async function seedDatabase() {
  console.log("▶ Seeding multi-tenant demo data with Indian personas and INR pricing...");

  try {
    const adminDb = getSupabaseAdmin();

    // 1. Seed Organizations with valid UUIDs
    const organizations = [
      { id: "00000000-0000-0000-0000-000000000001", name: "Apex Supermarket & Grocery" },
      { id: "00000000-0000-0000-0000-000000000002", name: "Vogue Fashion Hub" },
      { id: "00000000-0000-0000-0000-000000000003", name: "Volt Consumer Electronics" },
    ];

    for (const org of organizations) {
      await adminDb.from("organizations").upsert(org, { onConflict: "id" });
    }

    // 2. Seed Stores
    const stores = [
      // Org 1 Stores
      { id: "00000000-0000-0000-0001-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", name: "Apex Connaught Place MegaStore, Delhi", address: "B-Block, Inner Circle, Connaught Place, New Delhi" },
      { id: "00000000-0000-0000-0001-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", name: "Apex Indiranagar Express, Bengaluru", address: "100 Feet Road, Indiranagar, Bengaluru" },

      // Org 2 Stores
      { id: "00000000-0000-0000-0002-000000000001", organization_id: "00000000-0000-0000-0000-000000000002", name: "Vogue Khan Market Flagship, Delhi", address: "45 Khan Market, New Delhi" },
      { id: "00000000-0000-0000-0002-000000000002", organization_id: "00000000-0000-0000-0000-000000000002", name: "Vogue Phoenix Palladium, Mumbai", address: "Lower Parel, Mumbai" },

      // Org 3 Stores
      { id: "00000000-0000-0000-0003-000000000001", organization_id: "00000000-0000-0000-0000-000000000003", name: "Volt Nehru Place MegaStore, Delhi", address: "G-12 Nehru Place Commercial Complex, New Delhi" },
    ];

    for (const store of stores) {
      await adminDb.from("stores").upsert(store, { onConflict: "id" });
    }

    // 3. Seed User Profiles (RBAC with Indian Names)
    const profiles: Array<{ id: string; organization_id: string; store_id: string | null; full_name: string; role: string }> = [
      // Super Admin
      { id: "00000000-0000-0000-0000-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", store_id: null, full_name: "Vikramaditya Roy (Super Admin)", role: "super_admin" },
      
      // Org 1 (Apex Supermarket)
      { id: "00000000-0000-0000-0000-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", store_id: null, full_name: "Purnima Verma (Business Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", full_name: "Rahul Mehra (Store Manager)", role: "store_manager" },
      { id: "00000000-0000-0000-0000-000000000004", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", full_name: "Priya Patel (Sales Staff)", role: "sales_staff" },
      { id: "00000000-0000-0000-0000-000000000005", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", full_name: "Amitabh Joshi (Inventory Staff)", role: "inventory_staff" },
      { id: "00000000-0000-0000-0000-000000000006", organization_id: "00000000-0000-0000-0000-000000000001", store_id: null, full_name: "Sneha Reddy (Customer)", role: "customer" },
      
      // Org 2 (Vogue Fashion Hub)
      { id: "00000000-0000-0000-0000-000000000012", organization_id: "00000000-0000-0000-0000-000000000002", store_id: null, full_name: "Aditi Singhania (Fashion Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000013", organization_id: "00000000-0000-0000-0000-000000000002", store_id: "00000000-0000-0000-0002-000000000001", full_name: "Karan Malhotra (Boutique Manager)", role: "store_manager" },
      
      // Org 3 (Volt Electronics)
      { id: "00000000-0000-0000-0000-000000000022", organization_id: "00000000-0000-0000-0000-000000000003", store_id: null, full_name: "Rajesh Sharma (Volt CEO)", role: "business_owner" },
    ];

    for (const p of profiles) {
      await adminDb.from("profiles").upsert(p, { onConflict: "id" });
    }

    // 4. Seed Suppliers (Indian Companies & Phone Numbers)
    const suppliers = [
      // Org 01 Suppliers
      { id: "00000000-0000-0000-0010-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", name: "Amrit Fresh Dairy & Agro Ltd", phone: "+91-98200-11223", email: "orders@amritfresh.in", credit_days: 15, outstanding_balance: 145000.00 },
      { id: "00000000-0000-0000-0010-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", name: "Himalayan Springs Beverages India", phone: "+91-98200-44556", email: "b2b@himalayansprings.in", credit_days: 30, outstanding_balance: 320000.00 },
      { id: "00000000-0000-0000-0010-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", name: "Haldiram & SunHarvest Agro Ltd", phone: "+91-98200-77889", email: "supply@haldiramsunharvest.in", credit_days: 45, outstanding_balance: 85000.00 },

      // Org 02 Suppliers
      { id: "00000000-0000-0000-0020-000000000001", organization_id: "00000000-0000-0000-0000-000000000002", name: "Bombay Textile & Silk Mills Ltd", phone: "+91-98100-22334", email: "sales@bombaytextiles.in", credit_days: 30, outstanding_balance: 420000.00 },
      { id: "00000000-0000-0000-0020-000000000002", organization_id: "00000000-0000-0000-0000-000000000002", name: "Arvind Indigo Denim Mills Ltd", phone: "+91-98100-55667", email: "b2b@arvinddenim.in", credit_days: 60, outstanding_balance: 210000.00 },

      // Org 03 Suppliers
      { id: "00000000-0000-0000-0030-000000000001", organization_id: "00000000-0000-0000-0000-000000000003", name: "Bangalore Silicon Components Pvt Ltd", phone: "+91-98450-99887", email: "b2b@bangaloresilicon.in", credit_days: 30, outstanding_balance: 1850000.00 },
    ];

    for (const sup of suppliers) {
      await adminDb.from("suppliers").upsert(sup, { onConflict: "id" });
    }

    // 5. Seed Products (INR Values)
    const products = [
      // Org 01 (Apex Supermarket) Products
      { id: "00000000-0000-0001-0001-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Amul Gold Organic Whole Milk 1L", sku: "GRO-MLK-001", barcode: "8901001001", cost_price: 54.00, selling_price: 68.00, reorder_level: 25 },
      { id: "00000000-0000-0001-0001-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Artisan Sourdough Wheat Bread 400g", sku: "GRO-BRD-002", barcode: "8901001002", cost_price: 35.00, selling_price: 55.00, reorder_level: 20 },
      { id: "00000000-0000-0001-0001-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Farm Fresh Organic Eggs (Pack of 12)", sku: "GRO-EGG-003", barcode: "8901001003", cost_price: 75.00, selling_price: 99.00, reorder_level: 30 },
      { id: "00000000-0000-0001-0001-000000000004", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Coorg Premium Arabica Dark Roast 500g", sku: "GRO-COF-004", barcode: "8901001004", cost_price: 320.00, selling_price: 499.00, reorder_level: 15 },
      { id: "00000000-0000-0001-0001-000000000005", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Extra Virgin Cold Pressed Olive Oil 1L", sku: "GRO-OIL-005", barcode: "8901001005", cost_price: 650.00, selling_price: 899.00, reorder_level: 12 },
      { id: "00000000-0000-0001-0001-000000000006", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Himalayan Pink Salt Kettle Cooked Chips 150g", sku: "GRO-CHP-006", barcode: "8901001006", cost_price: 28.00, selling_price: 50.00, reorder_level: 40 },
      { id: "00000000-0000-0001-0001-000000000010", organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", name: "Imported Kashmir Saffron Truffle Infusion 250ml", sku: "GRO-TRF-099", barcode: "8901001099", cost_price: 1800.00, selling_price: 2999.00, reorder_level: 5 }, // Dead stock

      // Org 02 (Vogue Fashion) Products
      { id: "00000000-0000-0002-0001-000000000001", organization_id: "00000000-0000-0000-0000-000000000002", store_id: "00000000-0000-0000-0002-000000000001", name: "Pure Pashmina Wool Tailored Blazer", sku: "FAS-BLZ-101", barcode: "8902002001", cost_price: 3500.00, selling_price: 7999.00, reorder_level: 10 },
      { id: "00000000-0000-0002-0001-000000000002", organization_id: "00000000-0000-0000-0000-000000000002", store_id: "00000000-0000-0000-0002-000000000001", name: "Arvind Selvedge Raw Denim Jeans", sku: "FAS-JNS-102", barcode: "8902002002", cost_price: 1200.00, selling_price: 2899.00, reorder_level: 15 },
      { id: "00000000-0000-0002-0001-000000000003", organization_id: "00000000-0000-0000-0000-000000000002", store_id: "00000000-0000-0000-0002-000000000001", name: "Egyptian Cotton Oxford Slim Fit Shirt", sku: "FAS-SHT-103", barcode: "8902002003", cost_price: 750.00, selling_price: 1799.00, reorder_level: 20 },
      { id: "00000000-0000-0002-0001-000000000006", organization_id: "00000000-0000-0000-0000-000000000002", store_id: "00000000-0000-0000-0002-000000000001", name: "Vintage Royal Velvet Bandhgala Cape", sku: "FAS-CPT-999", barcode: "8902002999", cost_price: 5500.00, selling_price: 14999.00, reorder_level: 4 }, // Dead stock

      // Org 03 (Volt Electronics) Products
      { id: "00000000-0000-0003-0001-000000000001", organization_id: "00000000-0000-0000-0000-000000000003", store_id: "00000000-0000-0000-0003-000000000001", name: "Volt ProMax 5G Smartphone (12GB/256GB)", sku: "ELE-PHN-201", barcode: "8903003001", cost_price: 34999.00, selling_price: 49999.00, reorder_level: 8 },
      { id: "00000000-0000-0003-0001-000000000002", organization_id: "00000000-0000-0000-0000-000000000003", store_id: "00000000-0000-0000-0003-000000000001", name: "Volt SoundPulse ANC Wireless Headphones", sku: "ELE-AUD-202", barcode: "8903003002", cost_price: 4500.00, selling_price: 8999.00, reorder_level: 12 },
      { id: "00000000-0000-0003-0001-000000000003", organization_id: "00000000-0000-0000-0000-000000000003", store_id: "00000000-0000-0000-0003-000000000001", name: "Braided 100W USB-C Type-C Fast Charging Cable 2m", sku: "ELE-CBL-203", barcode: "8903003003", cost_price: 199.00, selling_price: 699.00, reorder_level: 35 },
    ];

    for (const prod of products) {
      await adminDb.from("products").upsert(prod, { onConflict: "id" });
    }

    // 6. Seed Customers (Indian Personas)
    const customers = [
      { id: "00000000-0000-0000-0040-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", name: "Sneha Reddy", email: "sneha.reddy@gmail.com", phone: "+91-98765-43210", loyalty_points: 340 },
      { id: "00000000-0000-0000-0040-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", name: "Rohan Kulkarni", email: "rohan.kulkarni@yahoo.co.in", phone: "+91-98111-22334", loyalty_points: 180 },
      { id: "00000000-0000-0000-0040-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", name: "Kavya Nair", email: "kavya.nair@outlook.com", phone: "+91-99444-55667", loyalty_points: 520 },
    ];

    for (const cust of customers) {
      await adminDb.from("customers").upsert(cust, { onConflict: "id" });
    }

    // 7. Seed Initial Immutable Inventory Ledger Entries
    const ledgerEntries: Array<{
      organization_id: string;
      store_id: string;
      product_id: string;
      movement_type: string;
      quantity: number;
      reference_id?: string;
      notes: string;
    }> = [
      // Milk: Opening 50, Sale -2, Purchase +30 -> Stock = 78
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000001", movement_type: "Opening", quantity: 50, notes: "Initial store opening stock" },
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000001", movement_type: "Sale", quantity: -2, reference_id: "INV-2026-0089", notes: "POS Sale deduction" },
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000001", movement_type: "Purchase", quantity: 30, reference_id: "PO-APX-2026-001", notes: "GRN Receipt Intake" },

      // Bread: Opening 30, Sale -5 -> Stock = 25
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000002", movement_type: "Opening", quantity: 30, notes: "Initial opening stock" },
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000002", movement_type: "Sale", quantity: -5, notes: "POS Sale deduction" },

      // Eggs: Opening 40, Damaged -2 -> Stock = 38
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000003", movement_type: "Opening", quantity: 40, notes: "Initial opening stock" },
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000003", movement_type: "Damaged", quantity: -2, notes: "Transit breakage write-down" },

      // Coffee: Opening 10 -> Low stock trigger (reorder is 15) -> Stock = 10
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000004", movement_type: "Opening", quantity: 10, notes: "Initial opening stock" },

      // Olive Oil: Opening 14 -> Stock = 14
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000005", movement_type: "Opening", quantity: 14, notes: "Initial opening stock" },

      // Chips: Opening 60 -> Stock = 60
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000006", movement_type: "Opening", quantity: 60, notes: "Initial opening stock" },

      // Dead stock Truffle: Opening 18, 0 sales in 90 days
      { organization_id: "00000000-0000-0000-0000-000000000001", store_id: "00000000-0000-0000-0001-000000000001", product_id: "00000000-0000-0001-0001-000000000010", movement_type: "Opening", quantity: 18, notes: "Imported specialty intake - 90 days ago" },
    ];

    for (const entry of ledgerEntries) {
      await adminDb.from("inventory_ledger").insert(entry);
    }

    console.log("✔ Multi-tenant database seeded successfully with Indian personas & INR catalog!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}
