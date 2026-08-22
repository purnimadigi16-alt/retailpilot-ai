"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoSession } from "@/context/DemoSessionContext";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Truck,
  Users,
  Receipt,
  DollarSign,
  Bot,
  Zap,
  Shield,
  User,
  CheckSquare,
  FileCode2,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Executive Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "business_owner", "store_manager"],
  },
  {
    label: "POS Terminal",
    href: "/pos",
    icon: ShoppingCart,
    roles: ["business_owner", "store_manager", "sales_staff"],
    badge: "Split Pay",
  },
  {
    label: "Inventory & Ledger",
    href: "/inventory",
    icon: Boxes,
    roles: ["business_owner", "store_manager", "inventory_staff"],
    badge: "Ledger",
  },
  {
    label: "Purchase Orders & GRN",
    href: "/purchases",
    icon: Truck,
    roles: ["business_owner", "store_manager", "inventory_staff"],
  },
  {
    label: "Suppliers & Payables",
    href: "/suppliers",
    icon: Users,
    roles: ["business_owner", "store_manager"],
  },
  {
    label: "Sales & Invoices",
    href: "/sales",
    icon: Receipt,
    roles: ["business_owner", "store_manager", "sales_staff"],
  },
  {
    label: "Expenses & P&L",
    href: "/expenses",
    icon: DollarSign,
    roles: ["business_owner", "store_manager"],
  },
  {
    label: "AI Business Assistant",
    href: "/ai-assistant",
    icon: Bot,
    roles: ["business_owner", "store_manager"],
    badge: "MCP Live",
  },
  {
    label: "Automations Center",
    href: "/automations",
    icon: Zap,
    roles: ["super_admin", "business_owner"],
    badge: "5 Crons",
  },
  {
    label: "Super Admin Portal",
    href: "/admin",
    icon: Shield,
    roles: ["super_admin"],
    badge: "Global",
  },
  {
    label: "Customer Portal",
    href: "/portal",
    icon: User,
    roles: ["customer", "business_owner"],
  },
  {
    label: "QA 50 Test Cases",
    href: "/qa-matrix",
    icon: CheckSquare,
    roles: ["super_admin", "business_owner", "store_manager", "sales_staff", "inventory_staff", "customer"],
    badge: "50 / 50",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useDemoSession();

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/60 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Operations & Intelligence
        </div>
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-border bg-background/50 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[11px] text-foreground">RLS Status</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Strict tenant isolation enforced via PostgreSQL RLS.
        </p>
      </div>
    </aside>
  );
}
