-- =================================================================
-- RETAILPILOT AI: ROW LEVEL SECURITY (RLS) POLICIES (MIGRATION 002)
-- Strict Tenant Isolation: Tenant A must NEVER access Tenant B data.
-- =================================================================

-- 1. Helper function to extract user organization ID from JWT or profiles
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'org_id',
    (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Helper function to check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on all operational tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- Organizations RLS
-- -------------------------------------------------------------
CREATE POLICY "Super Admins can view all organizations"
  ON public.organizations FOR SELECT
  USING (public.is_super_admin() OR id = public.get_auth_org_id());

CREATE POLICY "Super Admins can insert/update organizations"
  ON public.organizations FOR ALL
  USING (public.is_super_admin());

-- -------------------------------------------------------------
-- Stores RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for stores select"
  ON public.stores FOR SELECT
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for stores modify"
  ON public.stores FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

-- -------------------------------------------------------------
-- Profiles RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for profiles select"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id() OR id = auth.uid());

CREATE POLICY "Tenant isolation for profiles modify"
  ON public.profiles FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

-- -------------------------------------------------------------
-- Products RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for products"
  ON public.products FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

-- -------------------------------------------------------------
-- Inventory Ledger RLS (Immutable)
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for inventory_ledger select"
  ON public.inventory_ledger FOR SELECT
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for inventory_ledger insert"
  ON public.inventory_ledger FOR INSERT
  WITH CHECK (public.is_super_admin() OR organization_id = public.get_auth_org_id());

-- Note: No UPDATE or DELETE policy on inventory_ledger to ensure IMMUTABILITY.

-- -------------------------------------------------------------
-- Suppliers, Purchases & Purchase Items RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for suppliers"
  ON public.suppliers FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for purchases"
  ON public.purchases FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for purchase_items"
  ON public.purchase_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.id = purchase_items.purchase_id
      AND (public.is_super_admin() OR p.organization_id = public.get_auth_org_id())
    )
  );

-- -------------------------------------------------------------
-- Sales, Sale Items, Split Payments & Returns RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for sales"
  ON public.sales FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for sale_items"
  ON public.sale_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = sale_items.sale_id
      AND (public.is_super_admin() OR s.organization_id = public.get_auth_org_id())
    )
  );

CREATE POLICY "Tenant isolation for payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = payments.sale_id
      AND (public.is_super_admin() OR s.organization_id = public.get_auth_org_id())
    )
  );

CREATE POLICY "Tenant isolation for returns"
  ON public.returns FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

-- -------------------------------------------------------------
-- Customers, Expenses, Notifications & AI Reports RLS
-- -------------------------------------------------------------
CREATE POLICY "Tenant isolation for customers"
  ON public.customers FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for expenses"
  ON public.expenses FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for notifications"
  ON public.notifications FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for activity_logs"
  ON public.activity_logs FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());

CREATE POLICY "Tenant isolation for ai_reports"
  ON public.ai_reports FOR ALL
  USING (public.is_super_admin() OR organization_id = public.get_auth_org_id());
