import { adminDb } from "@/lib/db";

export interface SeedResult {
  success: boolean;
  message: string;
  counts?: Record<string, number>;
}

export async function runDatabaseSeed(): Promise<SeedResult> {
  try {
    console.log("Starting RetailPilot AI multi-tenant database seed...");

    // 1. Seed Organizations
    const organizations = [
      { id: "org_01", name: "Apex Supermarket & Grocery" },
      { id: "org_02", name: "Vogue Fashion Hub" },
      { id: "org_03", name: "Volt Consumer Electronics" },
    ];

    for (const org of organizations) {
      await adminDb.from("organizations").upsert(org, { onConflict: "id" });
    }

    // 2. Seed Stores
    const stores = [
      { id: "store_01_main", organization_id: "org_01", name: "Apex Downtown Superstore", address: "100 Market St, Metro City" },
      { id: "store_01_west", organization_id: "org_01", name: "Apex Westside Express", address: "450 West Ave, Metro City" },
      { id: "store_02_main", organization_id: "org_02", name: "Vogue Flagship Boutique", address: "78 Fashion Blvd, Midtown" },
      { id: "store_02_mall", organization_id: "org_02", name: "Vogue Galleria Mall Outlet", address: "Galleria Mall, 2nd Fl, Metro City" },
      { id: "store_03_main", organization_id: "org_03", name: "Volt Tech World MegaStore", address: "102 Silicon Park Blvd" },
    ];

    for (const store of stores) {
      await adminDb.from("stores").upsert(store, { onConflict: "id" });
    }

    // 3. Seed User Profiles (RBAC)
    const profiles: Array<{ id: string; organization_id: string; store_id: string | null; full_name: string; role: string }> = [
      // Super Admin
      { id: "00000000-0000-0000-0000-000000000001", organization_id: "org_01", store_id: null, full_name: "Alexander Vance (Super Admin)", role: "super_admin" },
      // Org 1 (Apex Supermarket)
      { id: "00000000-0000-0000-0000-000000000002", organization_id: "org_01", store_id: null, full_name: "Elena Rostova (Business Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000003", organization_id: "org_01", store_id: "store_01_main", full_name: "Marcus Chen (Store Manager)", role: "store_manager" },
      { id: "00000000-0000-0000-0000-000000000004", organization_id: "org_01", store_id: "store_01_main", full_name: "Sarah Jenkins (Sales Staff)", role: "sales_staff" },
      { id: "00000000-0000-0000-0000-000000000005", organization_id: "org_01", store_id: "store_01_main", full_name: "David Miller (Inventory Staff)", role: "inventory_staff" },
      { id: "00000000-0000-0000-0000-000000000006", organization_id: "org_01", store_id: null, full_name: "Sophia Martinez (Customer)", role: "customer" },
      
      // Org 2 (Vogue Fashion Hub)
      { id: "00000000-0000-0000-0000-000000000012", organization_id: "org_02", store_id: null, full_name: "Claire Dubois (Fashion Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000013", organization_id: "org_02", store_id: "store_02_main", full_name: "Liam O'Connor (Boutique Manager)", role: "store_manager" },
      
      // Org 3 (Volt Electronics)
      { id: "00000000-0000-0000-0000-000000000022", organization_id: "org_03", store_id: null, full_name: "Rajesh Sharma (Volt CEO)", role: "business_owner" },
    ];

    for (const p of profiles) {
      await adminDb.from("profiles").upsert(p, { onConflict: "id" });
    }

    // 4. Seed Suppliers
    const suppliers = [
      // Org 01 Suppliers
      { id: "sup_01_dairy", organization_id: "org_01", name: "FarmFresh Dairy & Foods Ltd", phone: "+1-555-0101", email: "orders@farmfresh.com", credit_days: 15, outstanding_balance: 1450.00 },
      { id: "sup_01_beverages", organization_id: "org_01", name: "Crystal Springs Beverages", phone: "+1-555-0102", email: "b2b@crystalsprings.com", credit_days: 30, outstanding_balance: 3200.00 },
      { id: "sup_01_snacks", organization_id: "org_01", name: "SunHarvest Agro & Snacks", phone: "+1-555-0103", email: "supply@sunharvest.com", credit_days: 45, outstanding_balance: 850.00 },
      
      // Org 02 Suppliers
      { id: "sup_02_textile", organization_id: "org_02", name: "Milan Fabric & Apparel Co", phone: "+1-555-0201", email: "wholesale@milanapparel.it", credit_days: 60, outstanding_balance: 8400.00 },
      { id: "sup_02_denim", organization_id: "org_02", name: "Indigo Denim Mills", phone: "+1-555-0202", email: "sales@indigomills.com", credit_days: 30, outstanding_balance: 4200.00 },

      // Org 03 Suppliers
      { id: "sup_03_tech", organization_id: "org_03", name: "Silicon Components International", phone: "+1-555-0301", email: "b2b@siliconcorp.com", credit_days: 30, outstanding_balance: 18500.00 },
    ];

    for (const sup of suppliers) {
      await adminDb.from("suppliers").upsert(sup, { onConflict: "id" });
    }

    // 5. Seed Products
    const products = [
      // Org 01 (Apex Supermarket) Products
      { id: "prod_01_milk", organization_id: "org_01", store_id: "store_01_main", name: "Organic Whole Milk 1 Gallon", sku: "GRO-MLK-001", barcode: "8901001001", cost_price: 2.80, selling_price: 4.49, reorder_level: 25 },
      { id: "prod_01_bread", organization_id: "org_01", store_id: "store_01_main", name: "Artisan Sourdough Loaf", sku: "GRO-BRD-002", barcode: "8901001002", cost_price: 1.75, selling_price: 3.99, reorder_level: 20 },
      { id: "prod_01_eggs", organization_id: "org_01", store_id: "store_01_main", name: "Pasture-Raised Eggs (Dozen)", sku: "GRO-EGG-003", barcode: "8901001003", cost_price: 2.50, selling_price: 4.99, reorder_level: 30 },
      { id: "prod_01_coffee", organization_id: "org_01", store_id: "store_01_main", name: "Premium Arabica Dark Roast 500g", sku: "GRO-COF-004", barcode: "8901001004", cost_price: 6.20, selling_price: 12.99, reorder_level: 15 },
      { id: "prod_01_olive_oil", organization_id: "org_01", store_id: "store_01_main", name: "Extra Virgin Olive Oil 1L", sku: "GRO-OIL-005", barcode: "8901001005", cost_price: 8.50, selling_price: 16.50, reorder_level: 12 },
      { id: "prod_01_chips", organization_id: "org_01", store_id: "store_01_main", name: "Sea Salt Kettle Cooked Chips", sku: "GRO-CHP-006", barcode: "8901001006", cost_price: 1.10, selling_price: 2.79, reorder_level: 40 },
      { id: "prod_01_deadstock_truffle", organization_id: "org_01", store_id: "store_01_main", name: "Imported Winter Black Truffle Oil 250ml", sku: "GRO-TRF-099", barcode: "8901001099", cost_price: 28.00, selling_price: 54.00, reorder_level: 5 }, // Dead stock test product

      // Org 02 (Vogue Fashion) Products
      { id: "prod_02_jacket", organization_id: "org_02", store_id: "store_02_main", name: "Italian Wool Tailored Blazer", sku: "FAS-BLZ-101", barcode: "8902002001", cost_price: 65.00, selling_price: 189.00, reorder_level: 10 },
      { id: "prod_02_jeans", organization_id: "org_02", store_id: "store_02_main", name: "Selvedge Raw Denim Jeans", sku: "FAS-JNS-102", barcode: "8902002002", cost_price: 32.00, selling_price: 89.00, reorder_level: 15 },
      { id: "prod_02_shirt", organization_id: "org_02", store_id: "store_02_main", name: "Egyptian Cotton Oxford Shirt", sku: "FAS-SHT-103", barcode: "8902002003", cost_price: 18.00, selling_price: 55.00, reorder_level: 20 },
      { id: "prod_02_deadstock_fur", organization_id: "org_02", store_id: "store_02_main", name: "Vintage Velvet Cape Coat", sku: "FAS-CPT-999", barcode: "8902002999", cost_price: 120.00, selling_price: 350.00, reorder_level: 4 }, // Dead stock

      // Org 03 (Volt Electronics) Products
      { id: "prod_03_phone", organization_id: "org_03", store_id: "store_03_main", name: "Volt ProMax 5G Smartphone 256GB", sku: "ELE-PHN-201", barcode: "8903003001", cost_price: 520.00, selling_price: 799.00, reorder_level: 8 },
      { id: "prod_03_headphones", organization_id: "org_03", store_id: "store_03_main", name: "Volt SoundPulse ANC Wireless Headphones", sku: "ELE-AUD-202", barcode: "8903003002", cost_price: 75.00, selling_price: 149.00, reorder_level: 12 },
      { id: "prod_03_cable", organization_id: "org_03", store_id: "store_03_main", name: "Braided 100W USB-C Fast Charging Cable 2m", sku: "ELE-CBL-203", barcode: "8903003003", cost_price: 4.50, selling_price: 19.99, reorder_level: 35 },
    ];

    for (const prod of products) {
      await adminDb.from("products").upsert(prod, { onConflict: "id" });
    }

    // 6. Seed Customers & Loyalty
    const customers = [
      { id: "cust_01_sophia", organization_id: "org_01", name: "Sophia Martinez", phone: "+1-555-7890", email: "sophia.m@example.com", loyalty_points: 340 },
      { id: "cust_01_daniel", organization_id: "org_01", name: "Daniel Craig", phone: "+1-555-4321", email: "daniel.c@example.com", loyalty_points: 120 },
      { id: "cust_02_olivia", organization_id: "org_02", name: "Olivia Thorne", phone: "+1-555-8822", email: "olivia.thorne@example.com", loyalty_points: 680 },
      { id: "cust_03_lucas", organization_id: "org_03", name: "Lucas Vance", phone: "+1-555-9933", email: "lucas.vance@example.com", loyalty_points: 950 },
    ];

    for (const cust of customers) {
      await adminDb.from("customers").upsert(cust, { onConflict: "id" });
    }

    // 7. Seed Immutable Stock Movement Ledger
    // Current Stock = Opening Stock + Purchases - Sales + Returns - Damaged +/- Adjustments
    const ledgerEntries = [
      // Org 01 Initial Opening Stock
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_milk", movement_type: "OPENING_STOCK", quantity: 80, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_bread", movement_type: "OPENING_STOCK", quantity: 50, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_eggs", movement_type: "OPENING_STOCK", quantity: 70, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_coffee", movement_type: "OPENING_STOCK", quantity: 40, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_olive_oil", movement_type: "OPENING_STOCK", quantity: 30, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_chips", movement_type: "OPENING_STOCK", quantity: 100, notes: "Initial store opening audit" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_deadstock_truffle", movement_type: "OPENING_STOCK", quantity: 18, notes: "Initial store opening audit (60+ days ago)" },

      // Org 01 Low stock simulation: Milk sold heavily (-65) -> Leaves 15 units (Below reorder level 25!)
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_milk", movement_type: "SALE", quantity: -65, notes: "POS batch sales week 1-3" },
      // Damaged logging
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_eggs", movement_type: "DAMAGED", quantity: -5, notes: "Transit carton damage" },

      // Org 02 Opening Stock & Movements
      { organization_id: "org_02", store_id: "store_02_main", product_id: "prod_02_jacket", movement_type: "OPENING_STOCK", quantity: 25, notes: "Winter collection intake" },
      { organization_id: "org_02", store_id: "store_02_main", product_id: "prod_02_jeans", movement_type: "OPENING_STOCK", quantity: 40, notes: "Denim collection intake" },
      { organization_id: "org_02", store_id: "store_02_main", product_id: "prod_02_shirt", movement_type: "OPENING_STOCK", quantity: 50, notes: "Oxford collection intake" },
      { organization_id: "org_02", store_id: "store_02_main", product_id: "prod_02_deadstock_fur", movement_type: "OPENING_STOCK", quantity: 12, notes: "Previous season stock (stagnant 75 days)" },

      // Org 03 Opening Stock & Movements
      { organization_id: "org_03", store_id: "store_03_main", product_id: "prod_03_phone", movement_type: "OPENING_STOCK", quantity: 18, notes: "Volt Flagship inventory intake" },
      { organization_id: "org_03", store_id: "store_03_main", product_id: "prod_03_headphones", movement_type: "OPENING_STOCK", quantity: 30, notes: "Audio department intake" },
      { organization_id: "org_03", store_id: "store_03_main", product_id: "prod_03_cable", movement_type: "OPENING_STOCK", quantity: 80, notes: "Accessories intake" },
    ];

    // Clear existing ledger to avoid duplicates on re-seed, then insert
    await adminDb.from("inventory_ledger").delete().neq("id", "none");
    await adminDb.from("inventory_ledger").insert(ledgerEntries);

    // 8. Seed Purchase Orders
    const purchases = [
      {
        id: "po_01_1001",
        organization_id: "org_01",
        store_id: "store_01_main",
        supplier_id: "sup_01_dairy",
        po_number: "PO-APX-2026-001",
        status: "Received",
        total_amount: 1450.00,
      },
      {
        id: "po_01_1002",
        organization_id: "org_01",
        store_id: "store_01_main",
        supplier_id: "sup_01_beverages",
        po_number: "PO-APX-2026-002",
        status: "Ordered",
        total_amount: 3200.00,
      },
    ];

    for (const po of purchases) {
      await adminDb.from("purchases").upsert(po, { onConflict: "id" });
    }

    // 9. Seed Sales with Split Payments
    const sales = [
      {
        id: "inv_01_8001",
        organization_id: "org_01",
        store_id: "store_01_main",
        customer_id: "cust_01_sophia",
        invoice_number: "INV-2026-0089",
        subtotal: 58.46,
        tax: 4.68,
        discount: 5.00,
        total: 58.14,
      },
      {
        id: "inv_01_8002",
        organization_id: "org_01",
        store_id: "store_01_main",
        customer_id: "cust_01_daniel",
        invoice_number: "INV-2026-0090",
        subtotal: 36.97,
        tax: 2.96,
        discount: 0.00,
        total: 39.93,
      },
    ];

    for (const sale of sales) {
      await adminDb.from("sales").upsert(sale, { onConflict: "id" });
    }

    // Seed Split Payments
    const payments = [
      { sale_id: "inv_01_8001", method: "CARD", amount: 40.00 },
      { sale_id: "inv_01_8001", method: "CASH", amount: 13.14 },
      { sale_id: "inv_01_8001", method: "LOYALTY_POINTS", amount: 5.00 }, // Split payment example!
      { sale_id: "inv_01_8002", method: "UPI", amount: 39.93 },
    ];

    await adminDb.from("payments").delete().neq("id", "none");
    await adminDb.from("payments").insert(payments);

    // 10. Seed Store Operating Expenses
    const expenses = [
      { organization_id: "org_01", store_id: "store_01_main", category: "Rent", amount: 3800.00, notes: "Downtown store retail lease" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Utilities", amount: 620.00, notes: "Electricity & refrigeration cooling" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Salaries", amount: 5400.00, notes: "Store staff bi-weekly payroll" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Marketing", amount: 450.00, notes: "Local flyers and digital circular" },
      
      { organization_id: "org_02", store_id: "store_02_main", category: "Rent", amount: 5200.00, notes: "Boutique high-street lease" },
      { organization_id: "org_02", store_id: "store_02_main", category: "Marketing", amount: 1200.00, notes: "Fashion influencer campaign" },
      
      { organization_id: "org_03", store_id: "store_03_main", category: "Rent", amount: 7500.00, notes: "Tech park flagship showroom" },
      { organization_id: "org_03", store_id: "store_03_main", category: "Salaries", amount: 8900.00, notes: "Technical sales team payroll" },
    ];

    await adminDb.from("expenses").delete().neq("id", "none");
    await adminDb.from("expenses").insert(expenses);

    // 11. Seed Notifications
    const notifications = [
      {
        organization_id: "org_01",
        title: "⚠️ Low Stock Alert: Organic Whole Milk",
        message: "Current stock is 15 units, below the reorder threshold of 25 units. Velocity: 4.3 units/day. Estimated stockout in 3.4 days.",
        read: false,
      },
      {
        organization_id: "org_01",
        title: "📅 Supplier Payment Due Soon",
        message: "Invoice for FarmFresh Dairy ($1,450.00) is due in 36 hours. Credit limit status: OK.",
        read: false,
      },
      {
        organization_id: "org_02",
        title: "📦 Dead Stock Audit Notification",
        message: "Identified 12 units of 'Vintage Velvet Cape Coat' stagnant for 75 days with $1,440 tied-up capital. Recommended markdown: 25%.",
        read: false,
      },
    ];

    await adminDb.from("notifications").delete().neq("id", "none");
    await adminDb.from("notifications").insert(notifications);

    // 12. Seed Sample AI Executive Report
    const aiReport = {
      organization_id: "org_01",
      report_type: "monthly_diagnostic",
      report_json: {
        period: "August 2026",
        revenue: 42850.00,
        cogs: 24200.00,
        gross_margin_pct: 43.5,
        operating_expenses: 10270.00,
        net_profit: 8380.00,
        net_margin_pct: 19.5,
        health_score: 91,
        insights: [
          "Dairy and Bakery lines show 18% higher sales velocity compared to previous period.",
          "Dead stock capital reduced by $1,200 following markdown promotions.",
          "Supplier payment efficiency reached 98.4% on-time settlement.",
        ],
        disclaimer: "AI-generated recommendation — please verify all figures before commercial execution.",
      },
    };

    await adminDb.from("ai_reports").delete().neq("id", "none");
    await adminDb.from("ai_reports").insert([aiReport]);

    console.log("RetailPilot AI database seeded successfully with 3 tenants and complete relational records.");

    return {
      success: true,
      message: "Multi-tenant database seeded with 3 organizations (Apex Supermarket, Vogue Fashion, Volt Electronics), users, ledger movements, split payments, and expenses.",
    };
  } catch (error: any) {
    console.error("Error during database seed:", error);
    return {
      success: false,
      message: error.message || "Failed to seed database",
    };
  }
}
