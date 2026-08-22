export type UserRole =
  | "super_admin"
  | "business_owner"
  | "store_manager"
  | "sales_staff"
  | "inventory_staff"
  | "customer";

export interface Organization {
  id: string;
  name: string;
  created_at?: string;
}

export interface Store {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  store_id?: string | null;
  full_name: string;
  role: UserRole;
  email?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  organization_id: string;
  store_id?: string | null;
  name: string;
  sku: string;
  barcode: string;
  category?: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  current_stock?: number;
  created_at?: string;
}

export type MovementType =
  | "OPENING_STOCK"
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGED"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface InventoryLedgerEntry {
  id: string;
  organization_id: string;
  store_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number; // positive or negative signed delta
  reference_id?: string | null;
  notes?: string | null;
  created_at?: string;
  product?: Product;
}

export type TransferStatus =
  | "Draft"
  | "Requested"
  | "Approved"
  | "Dispatched"
  | "Received";

export interface StockTransfer {
  id: string;
  organization_id: string;
  source_store_id: string;
  destination_store_id: string;
  product_id: string;
  quantity: number;
  status: TransferStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  phone?: string;
  email?: string;
  credit_days: number;
  outstanding_balance: number;
  created_at?: string;
}

export type PurchaseStatus =
  | "Draft"
  | "Ordered"
  | "Received"
  | "Paid"
  | "Cancelled";

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  store_id: string;
  supplier_id: string;
  po_number: string;
  status: PurchaseStatus;
  total_amount: number;
  payment_due_date?: string;
  created_at?: string;
  supplier?: Supplier;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id?: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total: number;
  product?: Product;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points: number;
  created_at?: string;
}

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "LOYALTY_POINTS";

export interface PaymentRecord {
  id?: string;
  sale_id: string;
  method: PaymentMethod;
  amount: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  organization_id: string;
  store_id: string;
  customer_id?: string | null;
  invoice_number: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  created_at?: string;
  customer?: Customer;
  items?: SaleItem[];
  payments?: PaymentRecord[];
}

export interface SaleItem {
  id?: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  total: number;
  product?: Product;
}

export interface ReturnRecord {
  id: string;
  organization_id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  reason: string;
  refund_amount?: number;
  created_at?: string;
  product?: Product;
}

export interface Expense {
  id: string;
  organization_id: string;
  store_id: string;
  category: "Rent" | "Utilities" | "Salaries" | "Marketing" | "Maintenance" | "Other";
  amount: number;
  notes?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  read: boolean;
  type?: "low_stock" | "supplier_due" | "dead_stock" | "eod_sales" | "monthly_report" | "system";
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity: string;
  created_at?: string;
}

export interface AiReport {
  id: string;
  organization_id: string;
  report_type: "daily_dossier" | "dead_stock_audit" | "supplier_escalation" | "monthly_diagnostic";
  report_json: any;
  created_at?: string;
}

// MCP Tools Types
export interface LowStockProductResult {
  product_id: string;
  sku: string;
  name: string;
  current_stock: number;
  reorder_level: number;
  sales_velocity_per_day: number;
  estimated_days_left: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface DeadStockResult {
  product_id: string;
  sku: string;
  name: string;
  current_stock: number;
  cost_price: number;
  dead_capital_tied_up: number;
  days_since_last_sale: number;
  recommended_markdown_pct: number;
}

export interface ProfitabilityResult {
  store_id: string;
  start_date: string;
  end_date: string;
  gross_sales: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  operating_expenses: number;
  net_profit: number;
  net_margin_pct: number;
}

export interface SupplierOutstandingResult {
  supplier_id: string;
  name: string;
  phone?: string;
  email?: string;
  credit_days: number;
  outstanding_balance: number;
  pending_pos_count: number;
  overdue_amount: number;
  due_status: "CRITICAL_DUE" | "UPCOMING" | "NORMAL";
}

export interface BusinessReportResult {
  organization_id: string;
  period_month: string;
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
  inventory_valuation: number;
  dead_stock_value: number;
  low_stock_count: number;
  top_selling_skus: Array<{ sku: string; name: string; units_sold: number; revenue: number }>;
  executive_insights: string[];
  disclaimer: string;
}
