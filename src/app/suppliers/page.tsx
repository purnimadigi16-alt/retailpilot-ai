"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function SuppliersPage() {
  const { organizationId } = useDemoSession();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [creditDays, setCreditDays] = useState(30);
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [organizationId]);

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setSuppliers(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          name,
          phone,
          email,
          credit_days: creditDays,
          outstanding_balance: balance,
        }),
      });

      if (!res.ok) throw new Error("Failed to add supplier");
      setShowModal(false);
      setName("");
      setPhone("");
      setEmail("");
      fetchSuppliers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalOutstanding = suppliers.reduce(
    (acc, curr) => acc + Number(curr.outstanding_balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">Suppliers & Accounts Payable</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vendor relationship management • Credit terms & aging invoice balances
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Accounts Payable</span>
            <p className="text-2xl font-black font-mono text-red-600 dark:text-red-400">
              ₹{totalOutstanding.toFixed(2)}
            </p>
            <span className="text-[11px] text-muted-foreground">Outstanding balances to vendors</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">{s.name}</span>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {s.credit_days} Days Credit
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{s.phone || "No phone listed"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{s.email || "No email listed"}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Outstanding:</span>
              <span className={`font-mono font-bold ${
                Number(s.outstanding_balance || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600"
              }`}>
                ₹{Number(s.outstanding_balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateSupplier}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Add New Supplier</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Vendor / Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Credit Terms (Days)</label>
                <input
                  type="number"
                  value={creditDays}
                  onChange={(e) => setCreditDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Initial Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono"
                />
              </div>
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
                disabled={submitting}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
              >
                {submitting ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
