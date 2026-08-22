"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemoSession, ORG_LIST } from "@/context/DemoSessionContext";
import { UserRole } from "@/types";
import {
  Bell,
  Sparkles,
  Building2,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  Store,
  Layers,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

export function Navbar() {
  const {
    role,
    name,
    organizationId,
    organizationName,
    setRole,
    setOrganization,
  } = useDemoSession();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [organizationId]);

  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/notifications?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) {
        setNotifications(json.data);
      }
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: organizationId }),
      });
      fetchNotifications();
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleColors: Record<UserRole, string> = {
    super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    business_owner: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    store_manager: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    sales_staff: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    inventory_staff: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    customer: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-800",
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: "1. Super Admin",
    business_owner: "2. Business Owner",
    store_manager: "3. Store Manager",
    sales_staff: "4. Sales Staff",
    inventory_staff: "5. Inventory Staff",
    customer: "6. Customer Portal",
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-foreground">RetailPilot <span className="text-blue-600 dark:text-blue-400">AI</span></span>
            <span className="text-[10px] text-muted-foreground font-mono">Multi-Tenant SaaS + MCP</span>
          </div>
        </Link>

        {/* Tenant Selector Dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => {
              setShowOrgDropdown(!showOrgDropdown);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-accent transition"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            <span className="truncate max-w-[170px]">{organizationName}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Switch Organization (RLS Isolation)
              </div>
              {ORG_LIST.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setOrganization(org.id, org.name);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs transition flex flex-col gap-0.5 ${
                    organizationId === org.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                      : "hover:bg-accent"
                  }`}
                >
                  <span>{org.name}</span>
                  <span className="text-[10px] text-muted-foreground">{org.sector} ({org.id})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowOrgDropdown(false);
            }}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${roleColors[role]}`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{roleLabels[role]}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Select Persona Role (RBAC)
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs transition flex items-center justify-between ${
                    role === r
                      ? "bg-accent font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{roleLabels[r]}</span>
                  {role === r && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition"
          >
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">Notifications & Alerts</span>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 divide-y divide-border/50">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No active notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="pt-2 text-xs">
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="mt-0.5 text-muted-foreground leading-snug">{notif.message}</p>
                      <span className="mt-1 block text-[10px] text-muted-foreground/70">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Avatar */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 text-xs font-bold text-white shadow">
            {name.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-foreground leading-tight">{name}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{role.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
