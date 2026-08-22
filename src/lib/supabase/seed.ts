import { getSupabaseAdmin } from "../db";

export async function seedDatabase() {
  console.log("▶ Seeding multi-tenant demo data with Indian personas and INR pricing...");

  try {
    const adminDb = getSupabaseAdmin();

    // 1. Seed Organizations
    const organizations = [
      { id: "org_01", name: "Apex Supermarket & Grocery", slug: "apex-supermarket", plan: "enterprise" },
      { id: "org_02", name: "Vogue Fashion Hub", slug: "vogue-fashion", plan: "growth" },
      { id: "org_03", name: "Volt Consumer Electronics", slug: "volt-electronics", plan: "growth" },
    ];

    for (const org of organizations) {
      await adminDb.from("organizations").upsert(org, { onConflict: "id" });
    }

    // 2. Seed Stores
    const stores = [
      // Org 1 Stores
      { id: "store_01_main", organization_id: "org_01", name: "Apex Connaught Place MegaStore, Delhi", address: "B-Block, Inner Circle, Connaught Place, New Delhi" },
      { id: "store_01_branch", organization_id: "org_01", name: "Apex Indiranagar Express, Bengaluru", address: "100 Feet Road, Indiranagar, Bengaluru" },

      // Org 2 Stores
      { id: "store_02_main", organization_id: "org_02", name: "Vogue Khan Market Flagship, Delhi", address: "45 Khan Market, New Delhi" },
      { id: "store_02_branch", organization_id: "org_02", name: "Vogue Phoenix Palladium, Mumbai", address: "Lower Parel, Mumbai" },

      // Org 3 Stores
      { id: "store_03_main", organization_id: "org_03", name: "Volt Nehru Place MegaStore, Delhi", address: "G-12 Nehru Place Commercial Complex, New Delhi" },
    ];

    for (const store of stores) {
      await adminDb.from("stores").upsert(store, { onConflict: "id" });
    }

    // 3. Seed User Profiles (RBAC with Indian Names)
    const profiles: Array<{ id: string; organization_id: string; store_id: string | null; full_name: string; role: string }> = [
      // Super Admin
      { id: "00000000-0000-0000-0000-000000000001", organization_id: "org_01", store_id: null, full_name: "Vikramaditya Roy (Super Admin)", role: "super_admin" },
      
      // Org 1 (Apex Supermarket)
      { id: "00000000-0000-0000-0000-000000000002", organization_id: "org_01", store_id: null, full_name: "Purnima Verma (Business Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000003", organization_id: "org_01", store_id: "store_01_main", full_name: "Rahul Mehra (Store Manager)", role: "store_manager" },
      { id: "00000000-0000-0000-0000-000000000004", organization_id: "org_01", store_id: "store_01_main", full_name: "Priya Patel (Sales Staff)", role: "sales_staff" },
      { id: "00000000-0000-0000-0000-000000000005", organization_id: "org_01", store_id: "store_01_main", full_name: "Amitabh Joshi (Inventory Staff)", role: "inventory_staff" },
      { id: "00000000-0000-0000-0000-000000000006", organization_id: "org_01", store_id: null, full_name: "Sneha Reddy (Customer)", role: "customer" },
      
      // Org 2 (Vogue Fashion Hub)
      { id: "00000000-0000-0000-0000-000000000012", organization_id: "org_02", store_id: null, full_name: "Aditi Singhania (Fashion Owner)", role: "business_owner" },
      { id: "00000000-0000-0000-0000-000000000013", organization_id: "org_02", store_id: "store_02_main", full_name: "Karan Malhotra (Boutique Manager)", role: "store_manager" },
      
      // Org 3 (Volt Electronics)
      { id: "00000000-0000-0000-0000-000000000022", organization_id: "org_03", store_id: null, full_name: "Rajesh Sharma (Volt CEO)", role: "business_owner" },
    ];

    for (const p of profiles) {
      await adminDb.from("profiles").upsert(p, { onConflict: "id" });
    }

    // 4. Seed Suppliers (Indian Companies & Phone Numbers)
    const suppliers = [
      // Org 01 Suppliers
      { id: "sup_01_dairy", organization_id: "org_01", name: "Amrit Fresh Dairy & Agro Ltd", phone: "+91-98200-11223", email: "orders@amritfresh.in", credit_days: 15, outstanding_balance: 145000.00 },
      { id: "sup_01_beverages", organization_id: "org_01", name: "Himalayan Springs Beverages India", phone: "+91-98200-44556", email: "b2b@himalayansprings.in", credit_days: 30, outstanding_balance: 320000.00 },
      { id: "sup_01_snacks", organization_id: "org_01", name: "Haldiram & SunHarvest Agro Ltd", phone: "+91-98200-77889", email: "supply@haldiramsunharvest.in", credit_days: 45, outstanding_balance: 85000.00 },

      // Org 02 Suppliers
      { id: "sup_02_textile", organization_id: "org_02", name: "Bombay Textile & Silk Mills Ltd", phone: "+91-98100-22334", email: "sales@bombaytextiles.in", credit_days: 30, outstanding_balance: 420000.00 },
      { id: "sup_02_denim", organization_id: "org_02", name: "Arvind Indigo Denim Mills Ltd", phone: "+91-98100-55667", email: "b2b@arvinddenim.in", credit_days: 60, outstanding_balance: 210000.00 },

      // Org 03 Suppliers
      { id: "sup_03_tech", organization_id: "org_03", name: "Bangalore Silicon Components Pvt Ltd", phone: "+91-98450-99887", email: "b2b@bangaloresilicon.in", credit_days: 30, outstanding_balance: 1850000.00 },
    ];

    for (const sup of suppliers) {
      await adminDb.from("suppliers").upsert(sup, { onConflict: "id" });
    }

    // 5. Seed Products (INR Values)
    const products = [
      // Org 01 (Apex Supermarket) Products
      { id: "prod_01_milk", organization_id: "org_01", store_id: "store_01_main", name: "Amul Gold Organic Whole Milk 1L", sku: "GRO-MLK-001", barcode: "8901001001", cost_price: 54.00, selling_price: 68.00, reorder_level: 25 },
      { id: "prod_01_bread", organization_id: "org_01", store_id: "store_01_main", name: "Artisan Sourdough Wheat Bread 400g", sku: "GRO-BRD-002", barcode: "8901001002", cost_price: 35.00, selling_price: 55.00, reorder_level: 20 },
      { id: "prod_01_eggs", organization_id: "org_01", store_id: "store_01_main", name: "Farm Fresh Organic Eggs (Pack of 12)", sku: "GRO-EGG-003", barcode: "8901001003", cost_price: 75.00, selling_price: 99.00, reorder_level: 30 },
      { id: "prod_01_coffee", organization_id: "org_01", store_id: "store_01_main", name: "Coorg Premium Arabica Dark Roast 500g", sku: "GRO-COF-004", barcode: "8901001004", cost_price: 320.00, selling_price: 499.00, reorder_level: 15 },
      { id: "prod_01_olive_oil", organization_id: "org_01", store_id: "store_01_main", name: "Extra Virgin Cold Pressed Olive Oil 1L", sku: "GRO-OIL-005", barcode: "8901001005", cost_price: 650.00, selling_price: 899.00, reorder_level: 12 },
      { id: "prod_01_chips", organization_id: "org_01", store_id: "store_01_main", name: "Himalayan Pink Salt Kettle Cooked Chips 150g", sku: "GRO-CHP-006", barcode: "8901001006", cost_price: 28.00, selling_price: 50.00, reorder_level: 40 },
      { id: "prod_01_deadstock_truffle", organization_id: "org_01", store_id: "store_01_main", name: "Imported Kashmir Saffron Truffle Infusion 250ml", sku: "GRO-TRF-099", barcode: "8901001099", cost_price: 1800.00, selling_price: 2999.00, reorder_level: 5 }, // Dead stock

      // Org 02 (Vogue Fashion) Products
      { id: "prod_02_jacket", organization_id: "org_02", store_id: "store_02_main", name: "Pure Pashmina Wool Tailored Blazer", sku: "FAS-BLZ-101", barcode: "8902002001", cost_price: 3500.00, selling_price: 7999.00, reorder_level: 10 },
      { id: "prod_02_jeans", organization_id: "org_02", store_id: "store_02_main", name: "Arvind Selvedge Raw Denim Jeans", sku: "FAS-JNS-102", barcode: "8902002002", cost_price: 1200.00, selling_price: 2899.00, reorder_level: 15 },
      { id: "prod_02_shirt", organization_id: "org_02", store_id: "store_02_main", name: "Egyptian Cotton Oxford Slim Fit Shirt", sku: "FAS-SHT-103", barcode: "8902002003", cost_price: 750.00, selling_price: 1799.00, reorder_level: 20 },
      { id: "prod_02_deadstock_fur", organization_id: "org_02", store_id: "store_02_main", name: "Vintage Royal Velvet Bandhgala Cape", sku: "FAS-CPT-999", barcode: "8902002999", cost_price: 5500.00, selling_price: 14999.00, reorder_level: 4 }, // Dead stock

      // Org 03 (Volt Electronics) Products
      { id: "prod_03_phone", organization_id: "org_03", store_id: "store_03_main", name: "Volt ProMax 5G Smartphone (12GB/256GB)", sku: "ELE-PHN-201", barcode: "8903003001", cost_price: 34999.00, selling_price: 49999.00, reorder_level: 8 },
      { id: "prod_03_headphones", organization_id: "org_03", store_id: "store_03_main", name: "Volt SoundPulse ANC Wireless Headphones", sku: "ELE-AUD-202", barcode: "8903003002", cost_price: 4500.00, selling_price: 8999.00, reorder_level: 12 },
      { id: "prod_03_cable", organization_id: "org_03", store_id: "store_03_main", name: "Braided 100W USB-C Type-C Fast Charging Cable 2m", sku: "ELE-CBL-203", barcode: "8903003003", cost_price: 199.00, selling_price: 699.00, reorder_level: 35 },
    ];

    for (const prod of products) {
      await adminDb.from("products").upsert(prod, { onConflict: "id" });
    }

    // 6. Seed Customers & Loyalty (Indian Names)
    const customers = [
      { id: "cust_01_sneha", organization_id: "org_01", name: "Sneha Reddy", phone: "+91-98765-43210", email: "sneha.reddy@example.com", loyalty_points: 340 },
      { id: "cust_01_rohan", organization_id: "org_01", name: "Rohan Kulkarni", phone: "+91-98765-11223", email: "rohan.k@example.com", loyalty_points: 120 },
      { id: "cust_02_kavya", organization_id: "org_02", name: "Kavya Nair", phone: "+91-98765-99887", email: "kavya.nair@example.com", loyalty_points: 680 },
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
      cost_price: number;
      reference_id?: string;
      notes: string;
    }> = [
      // Milk: Opening 50, Sale -2, Purchase +30 -> Stock = 78
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_milk", movement_type: "OPENING_STOCK", quantity: 50, cost_price: 54.00, notes: "Initial store opening stock" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_milk", movement_type: "SALE", quantity: -2, cost_price: 54.00, reference_id: "INV-2026-0089", notes: "POS Sale deduction" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_milk", movement_type: "PURCHASE", quantity: 30, cost_price: 54.00, reference_id: "PO-APX-2026-001", notes: "GRN Receipt Intake" },

      // Bread: Opening 30, Sale -5 -> Stock = 25
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_bread", movement_type: "OPENING_STOCK", quantity: 30, cost_price: 35.00, notes: "Initial opening stock" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_bread", movement_type: "SALE", quantity: -5, cost_price: 35.00, notes: "POS Sale deduction" },

      // Eggs: Opening 40, Damaged -2 -> Stock = 38
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_eggs", movement_type: "OPENING_STOCK", quantity: 40, cost_price: 75.00, notes: "Initial opening stock" },
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_eggs", movement_type: "DAMAGED", quantity: -2, cost_price: 75.00, notes: "Transit breakage write-down" },

      // Coffee: Opening 10 -> Low stock trigger (reorder is 15) -> Stock = 10
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_coffee", movement_type: "OPENING_STOCK", quantity: 10, cost_price: 320.00, notes: "Initial opening stock" },

      // Olive Oil: Opening 14 -> Stock = 14
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_olive_oil", movement_type: "OPENING_STOCK", quantity: 14, cost_price: 650.00, notes: "Initial opening stock" },

      // Chips: Opening 60 -> Stock = 60
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_chips", movement_type: "OPENING_STOCK", quantity: 60, cost_price: 28.00, notes: "Initial opening stock" },

      // Dead stock Truffle: Opening 18, 0 sales in 90 days
      { organization_id: "org_01", store_id: "store_01_main", product_id: "prod_01_deadstock_truffle", movement_type: "OPENING_STOCK", quantity: 18, cost_price: 1800.00, notes: "Imported specialty intake - 90 days ago" },
    ];

    for (const entry of ledgerEntries) {
      await adminDb.from("inventory_ledger").insert(entry);
    }

    // 8. Seed Purchase Orders
    const poList = [
      {
        id: "po_01_dairy_1",
        organization_id: "org_01",
        store_id: "store_01_main",
        supplier_id: "sup_01_dairy",
        po_number: "PO-APX-2026-001",
        status: "Received",
        total_amount: 16200.00,
        due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      },
      {
        id: "po_01_beverages_1",
        organization_id: "org_01",
        store_id: "store_01_main",
        supplier_id: "sup_01_beverages",
        po_number: "PO-APX-2026-002",
        status: "Dispatched",
        total_amount: 32400.00,
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(), // Alert trigger (< 48 hrs)
      },
    ];

    for (const po of poList) {
      await adminDb.from("purchases").upsert(po, { onConflict: "id" });
    }

    // 9. Seed Sales and Split Payments
    const sale = {
      id: "sale_01_demo",
      organization_id: "org_01",
      store_id: "store_01_main",
      customer_id: "cust_01_sneha",
      invoice_number: "INV-2026-0089",
      subtotal: 540.00,
      tax: 27.00,
      discount: 0.00,
      total_amount: 567.00,
      payment_status: "Paid",
      payment_method: "SPLIT",
    };
    await adminDb.from("sales").upsert(sale, { onConflict: "id" });

    const payments = [
      { id: "pay_01_card", sale_id: "sale_01_demo", payment_method: "CARD", amount: 350.00 },
      { id: "pay_01_upi", sale_id: "sale_01_demo", payment_method: "UPI", amount: 167.00 },
      { id: "pay_01_points", sale_id: "sale_01_demo", payment_method: "LOYALTY_POINTS", amount: 50.00 },
    ];
    for (const pay of payments) {
      await adminDb.from("payments").upsert(pay, { onConflict: "id" });
    }

    // 10. Seed Expenses (INR Values)
    const expenses = [
      { organization_id: "org_01", store_id: "store_01_main", category: "Rent", amount: 120000.00, description: "Connaught Place MegaStore Commercial Monthly Rent" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Utilities", amount: 28000.00, description: "Electricity & Central HVAC Bill" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Salaries", amount: 185000.00, description: "Floor Staff, Cashiers & Manager Salaries" },
      { organization_id: "org_01", store_id: "store_01_main", category: "Marketing", amount: 25000.00, description: "Delhi NCR Local Festive Campaign" },
    ];

    for (const exp of expenses) {
      await adminDb.from("expenses").insert(exp);
    }

    // 11. Seed Notifications
    const notifications = [
      {
        organization_id: "org_01",
        store_id: "store_01_main",
        title: "Low Stock Alert: Coorg Premium Arabica Dark Roast 500g",
        message: "Current physical stock (10 units) has breached safety reorder point (15 units). Estimated stockout in 3 days.",
        type: "STOCK_ALERT",
        read: false,
      },
      {
        organization_id: "org_01",
        store_id: "store_01_main",
        title: "Supplier Payment Due in < 48 Hours",
        message: "PO-APX-2026-002 to Himalayan Springs Beverages India (₹32,400.00) is due for disbursement on 24-Aug-2026.",
        type: "SUPPLIER_ALERT",
        read: false,
      },
    ];

    for (const notif of notifications) {
      await adminDb.from("notifications").insert(notif);
    }

    console.log("✅ Seed completed successfully with Indian personas & INR pricing!");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Seed error:", error.message);
    throw error;
  }
}
