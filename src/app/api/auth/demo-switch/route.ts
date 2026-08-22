import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types";

export const DEMO_PERSONAS: Record<
  string,
  {
    role: UserRole;
    name: string;
    organization_id: string;
    organization_name: string;
    store_id: string;
    store_name: string;
    email: string;
  }
> = {
  super_admin: {
    role: "super_admin",
    name: "Alexander Vance",
    organization_id: "org_01",
    organization_name: "Apex Supermarket (Global View)",
    store_id: "store_01_main",
    store_name: "All Stores",
    email: "superadmin@retailpilot.ai",
  },
  business_owner: {
    role: "business_owner",
    name: "Elena Rostova",
    organization_id: "org_01",
    organization_name: "Apex Supermarket & Grocery",
    store_id: "store_01_main",
    store_name: "Apex Downtown Superstore",
    email: "elena.owner@apexsupermarket.com",
  },
  store_manager: {
    role: "store_manager",
    name: "Marcus Chen",
    organization_id: "org_01",
    organization_name: "Apex Supermarket & Grocery",
    store_id: "store_01_main",
    store_name: "Apex Downtown Superstore",
    email: "marcus.manager@apexsupermarket.com",
  },
  sales_staff: {
    role: "sales_staff",
    name: "Sarah Jenkins",
    organization_id: "org_01",
    organization_name: "Apex Supermarket & Grocery",
    store_id: "store_01_main",
    store_name: "Apex Downtown Superstore",
    email: "sarah.pos@apexsupermarket.com",
  },
  inventory_staff: {
    role: "inventory_staff",
    name: "David Miller",
    organization_id: "org_01",
    organization_name: "Apex Supermarket & Grocery",
    store_id: "store_01_main",
    store_name: "Apex Downtown Superstore",
    email: "david.stock@apexsupermarket.com",
  },
  customer: {
    role: "customer",
    name: "Sophia Martinez",
    organization_id: "org_01",
    organization_name: "Apex Supermarket & Grocery",
    store_id: "store_01_main",
    store_name: "Customer Self-Service",
    email: "sophia.m@example.com",
  },
};

export async function GET() {
  return NextResponse.json({
    personas: DEMO_PERSONAS,
    organizations: [
      { id: "org_01", name: "Apex Supermarket & Grocery", type: "Supermarket / FMCG" },
      { id: "org_02", name: "Vogue Fashion Hub", type: "Fashion / Boutique Apparel" },
      { id: "org_03", name: "Volt Consumer Electronics", type: "Electronics / Gadgets" },
    ],
  });
}
