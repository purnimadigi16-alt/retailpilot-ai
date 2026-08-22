-- =================================================================
-- RETAILPILOT AI: MULTI-TENANT DATABASE SCHEMA & LEDGER (MIGRATION 001)
-- =================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY DEFAULT 'org_' || substr(md5(random()::text), 1, 8),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Stores / Branches
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY DEFAULT 'store_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. User Profiles & RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES public.stores(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'business_owner', 'store_manager', 'sales_staff', 'inventory_staff', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT 'prod_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES public.stores(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_org_sku UNIQUE (organization_id, sku)
);

-- 6. Suppliers (Procurement & Payables)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY DEFAULT 'sup_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    credit_days INTEGER NOT NULL DEFAULT 30,
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Purchase Orders (PO)
CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY DEFAULT 'po_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    po_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ordered', 'Received', 'Paid', 'Cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Purchase Items
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id TEXT PRIMARY KEY DEFAULT 'poi_' || substr(md5(random()::text), 1, 8),
    purchase_id TEXT NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 9. Customers & Loyalty Program
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT 'cust_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Sales / Invoices
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY DEFAULT 'inv_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Sale Items
CREATE TABLE IF NOT EXISTS public.sale_items (
    id TEXT PRIMARY KEY DEFAULT 'si_' || substr(md5(random()::text), 1, 8),
    sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 12. Split Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT 'pay_' || substr(md5(random()::text), 1, 8),
    sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('CASH', 'CARD', 'UPI', 'LOYALTY_POINTS')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Customer Returns & Refunds
CREATE TABLE IF NOT EXISTS public.returns (
    id TEXT PRIMARY KEY DEFAULT 'ret_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Immutable Stock Movement Ledger
-- Formula: Current Stock = Opening Stock + Purchases - Sales + Returns - Damaged +/- Adjustments
CREATE TABLE IF NOT EXISTS public.inventory_ledger (
    id TEXT PRIMARY KEY DEFAULT 'ledg_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('OPENING_STOCK', 'PURCHASE', 'SALE', 'RETURN', 'DAMAGED', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')),
    quantity INTEGER NOT NULL, -- signed (+ for incoming, - for outgoing)
    reference_id TEXT, -- e.g. sale_id, po_id, return_id, transfer_id
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Store Operating Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY DEFAULT 'exp_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. Notifications & System Alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT 'notif_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY DEFAULT 'log_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. Executive AI Reports & Dossiers
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id TEXT PRIMARY KEY DEFAULT 'rep_' || substr(md5(random()::text), 1, 8),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    report_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for high-velocity lookups & tenant filtering
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_org_prod ON public.inventory_ledger(organization_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_store ON public.inventory_ledger(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_org ON public.sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchases_org ON public.purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org ON public.expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id);
