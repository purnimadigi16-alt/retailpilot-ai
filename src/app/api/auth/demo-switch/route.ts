import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    organizations: [
      { id: "org_01", name: "Apex Supermarket & Grocery", sector: "Supermarket / FMCG Retail" },
      { id: "org_02", name: "Vogue Fashion Hub", sector: "Ethnic & Western Apparel Boutique" },
      { id: "org_03", name: "Volt Consumer Electronics", sector: "Smartphones & Consumer Electronics" },
    ],
    roles: [
      { id: "super_admin", title: "Super Admin", persona: "Vikramaditya Roy", scope: "Platform Governance & Multi-Tenant Setup" },
      { id: "business_owner", title: "Business Owner", persona: "Purnima Verma", scope: "Executive P&L, AI Directives & Stores" },
      { id: "store_manager", title: "Store Manager", persona: "Rahul Mehra", scope: "Stock Audits, PO Approvals & Shifts" },
      { id: "sales_staff", title: "Sales Staff", persona: "Priya Patel", scope: "POS Checkout, Split Payments & Returns" },
      { id: "inventory_staff", title: "Inventory Staff", persona: "Amitabh Joshi", scope: "GRN Receipts, Adjustments & Transfers" },
      { id: "customer", title: "Customer Portal", persona: "Sneha Reddy", scope: "Self-Service Digital Invoices & Loyalty" },
    ],
  });
}
