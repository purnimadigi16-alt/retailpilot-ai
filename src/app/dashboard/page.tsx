"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  DollarSign,
  TrendingUp,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  Bot,
  RefreshCw,
  AlertCircle,
  FileText,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const { role, organizationId, organizationName, storeId, storeName } = useDemoSession();

  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [organizationId, storeId]);

  async function fetchDashboardData() {
    setLoading(true);
    setFetchError(null);
    try {
      const activeOrg = organizationId || "org_01";
      const activeStore = storeId || "store_01_main";

      const [analyticsRes, lowStockRes] = await Promise.all([
        fetch(`/api/analytics?organization_id=${encodeURIComponent(activeOrg)}&store_id=${encodeURIComponent(activeStore)}`),
        fetch(`/api/mcp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "get_low_stock_products",
            args: { organization_id: activeOrg, store_id: activeStore },
          }),
        }),
      ]);

      if (!analyticsRes.ok) {
        throw new Error(`Analytics API returned HTTP ${analyticsRes.status}`);
      }

      const analyticsJson = await analyticsRes.json();
      const lowStockJson = await lowStockRes.json();

      if (analyticsJson.data) {
        setAnalytics(analyticsJson.data);
      } else if (analyticsJson.error) {
        throw new Error(analyticsJson.error);
      }

      if (lowStockJson.result && Array.isArray(lowStockJson.result)) {
        setLowStockList(lowStockJson.result);
      }
    } catch (err: any) {
      console.error("[Dashboard] Error fetching dashboard data:", err);
      setFetchError(err.message || "Failed to load executive dashboard analytics");
    } finally {
      setLoading(false);
    }
  }

  // Realistic revenue & profit trajectory data
  const revenueChartData = [
    { day: "Mon", revenue: 2400, profit: 1100 },
    { day: "Tue", revenue: 3100, profit: 1450 },
    { day: "Wed", revenue: 2800, profit: 1250 },
    { day: "Thu", revenue: 4200, profit: 1950 },
    { day: "Fri", revenue: 5600, profit: 2600 },
    { day: "Sat", revenue: 7800, profit: 3700 },
    { day: "Sun", revenue: 6400, profit: 2900 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {organizationName}
            </h1>
            <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              Tenant: {organizationId}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time Operations & Financial P&L Ledger • {storeName} • Viewing as <strong className="text-foreground capitalize">{role.replace("_", " ")}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/pos"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
          >
            <ShoppingCart className="h-4 w-4" /> Open POS Terminal
          </Link>
          <Link
            href="/ai-assistant"
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 transition"
          >
            <Bot className="h-4 w-4" /> AI Assistant Studio
          </Link>
          <button
            onClick={fetchDashboardData}
            title="Refresh Dashboard Data"
            className="p-2 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {fetchError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-center justify-between gap-4 text-xs animate-in fade-in">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Error Loading Executive Analytics</p>
              <p className="text-muted-foreground text-[11px] font-mono mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Revenue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gross Sales</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-foreground font-mono">
              ₹{Number(analytics?.revenue ?? 0).toFixed(2)}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
              <span>COGS: ₹{Number(analytics?.cogs ?? 0).toFixed(2)}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600">
                {Number(analytics?.gross_margin_pct ?? analytics?.gross_margin ?? 0).toFixed(1)}% Margin
              </span>
            </div>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Operating Profit
            </span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black tracking-tight text-foreground font-mono">
              ₹{Number(analytics?.net_profit ?? 0).toFixed(2)}
            </span>
            <p className="text-[11px] text-muted-foreground">
              After OpEx deduction (₹{Number(analytics?.expenses ?? 0).toFixed(2)})
            </p>
          </div>
        </div>

        {/* Active Inventory Valuation */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Stock Valuation
            </span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black tracking-tight text-foreground font-mono">
              ₹{Number(analytics?.inventory_valuation ?? 0).toFixed(2)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{analytics?.total_inventory_units ?? 0} physical units in ledger</span>
            </div>
          </div>
        </div>

        {/* Low Stock SKUs Alert */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock Alerts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {lowStockList.length} SKUs
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span>Reorder threshold breached</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">Revenue & Profit Trajectory</h2>
              <p className="text-xs text-muted-foreground">Live POS sales vs margin contribution</p>
            </div>
            <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">7 Days</span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Gross Revenue (₹)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Gross Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Expense Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Operating Expenses</h2>
            <p className="text-xs text-muted-foreground">Store overhead breakdown (P&L)</p>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(analytics?.expense_breakdown || {}).length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No expenses recorded for period</p>
            ) : (
              Object.entries(analytics?.expense_breakdown || {}).map(([cat, amt]: [string, any]) => (
                <div key={cat} className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                  <span className="font-medium text-foreground">{cat}</span>
                  <span className="font-mono font-semibold">₹{Number(amt).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Total Overhead:</span>
            <span className="font-mono font-bold text-foreground">₹{Number(analytics?.expenses ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Live Low Stock Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Live Low Stock & Reorder Urgency (MCP Tool Output)
            </h2>
            <p className="text-xs text-muted-foreground">Calculated via live inventory ledger and sales velocity</p>
          </div>
          <Link href="/inventory" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Manage Inventory Ledger →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {lowStockList.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              All inventory levels are currently healthy and above safety thresholds.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-center">Reorder Point</th>
                  <th className="p-3 text-center">Daily Velocity</th>
                  <th className="p-3 text-center">Est. Runout</th>
                  <th className="p-3 text-right">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {lowStockList.map((item) => (
                  <tr key={item.product_id} className="hover:bg-accent/30 transition">
                    <td className="p-3 font-mono font-bold text-foreground">{item.sku}</td>
                    <td className="p-3 font-medium text-foreground">{item.name}</td>
                    <td className="p-3 text-center font-bold text-red-600 dark:text-red-400">{item.current_stock}</td>
                    <td className="p-3 text-center text-muted-foreground">{item.reorder_level}</td>
                    <td className="p-3 text-center text-muted-foreground">{item.sales_velocity_per_day} / day</td>
                    <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400">{item.estimated_days_left} days</td>
                    <td className="p-3 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.urgency === "CRITICAL"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : item.urgency === "HIGH"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}>
                        {item.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}