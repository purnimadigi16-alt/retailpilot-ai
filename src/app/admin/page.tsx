"use client";

import React, { useState } from "react";
import { useDemoSession, ORG_LIST } from "@/context/DemoSessionContext";
import {
  Shield,
  Building2,
  Cpu,
  Database,
  Activity,
  Plus,
  CheckCircle2,
  Layers,
  Lock,
} from "lucide-react";

export default function SuperAdminPage() {
  const { setOrganization } = useDemoSession();

  const [tenants, setTenants] = useState([
    {
      id: "org_01",
      name: "Apex Supermarket & Grocery",
      tier: "Enterprise Pro",
      storesCount: 2,
      productsCount: 7,
      status: "ACTIVE",
      monthlyUsage: "$189/mo",
    },
    {
      id: "org_02",
      name: "Vogue Fashion Hub",
      tier: "Growth Plan",
      storesCount: 2,
      productsCount: 4,
      status: "ACTIVE",
      monthlyUsage: "$99/mo",
    },
    {
      id: "org_03",
      name: "Volt Consumer Electronics",
      tier: "Enterprise Pro",
      storesCount: 1,
      productsCount: 3,
      status: "ACTIVE",
      monthlyUsage: "$189/mo",
    },
  ]);

  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgTier, setNewOrgTier] = useState("Growth Plan");
  const [showModal, setShowModal] = useState(false);

  function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrgName) return;

    const newId = `org_${(tenants.length + 1).toString().padStart(2, "0")}`;
    const created = {
      id: newId,
      name: newOrgName,
      tier: newOrgTier,
      storesCount: 1,
      productsCount: 0,
      status: "ACTIVE",
      monthlyUsage: newOrgTier === "Enterprise Pro" ? "$189/mo" : "$99/mo",
    };

    setTenants([...tenants, created]);
    setShowModal(false);
    setNewOrgName("");
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-foreground">Super Admin & Global Multi-Tenant Control</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global tenant provisioning • PostgreSQL RLS isolation monitoring • Subscription tiers & billing
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-500 transition"
        >
          <Plus className="h-4 w-4" /> Provision New Tenant
        </button>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Tenants</span>
          <div className="text-2xl font-bold text-foreground">{tenants.length} Organizations</div>
          <p className="text-[11px] text-emerald-600 font-medium">100% RLS Data Isolated</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Database Security</span>
          <div className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-500" /> RLS Enforced
          </div>
          <p className="text-[11px] text-muted-foreground">PostgreSQL Row-Level Policies Active</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MCP Engine Health</span>
          <div className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-500" /> 5 Tools Ready
          </div>
          <p className="text-[11px] text-muted-foreground">JSON-RPC 2.0 Endpoint Live</p>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Tenant ID</th>
              <th className="p-3.5">Organization Name</th>
              <th className="p-3.5">Subscription Tier</th>
              <th className="p-3.5 text-center">Stores</th>
              <th className="p-3.5 text-center">Products</th>
              <th className="p-3.5">Monthly Billing</th>
              <th className="p-3.5 text-center">RLS Isolation</th>
              <th className="p-3.5 text-center">Quick Switch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-accent/30 transition">
                <td className="p-3.5 font-mono font-bold text-foreground">{t.id}</td>
                <td className="p-3.5 font-semibold text-foreground">{t.name}</td>
                <td className="p-3.5">
                  <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                    {t.tier}
                  </span>
                </td>
                <td className="p-3.5 text-center font-mono">{t.storesCount}</td>
                <td className="p-3.5 text-center font-mono">{t.productsCount}</td>
                <td className="p-3.5 font-mono font-semibold text-foreground">{t.monthlyUsage}</td>
                <td className="p-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Isolated
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => setOrganization(t.id, t.name)}
                    className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-blue-500 transition"
                  >
                    Switch Context
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateTenant}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Provision New SaaS Organization</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Company / Store Name</label>
              <input
                type="text"
                placeholder="e.g. Metro Department Store"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Subscription Plan</label>
              <select
                value={newOrgTier}
                onChange={(e) => setNewOrgTier(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              >
                <option value="Starter Plan">Starter Plan ($49/mo)</option>
                <option value="Growth Plan">Growth Plan ($99/mo)</option>
                <option value="Enterprise Pro">Enterprise Pro ($189/mo)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-500 transition"
              >
                Provision Organization
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
