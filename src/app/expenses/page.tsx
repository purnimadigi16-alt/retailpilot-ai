"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  DollarSign,
  Plus,
  TrendingDown,
  Building,
  Calendar,
  Layers,
  PieChart as PieIcon,
} from "lucide-react";

export default function ExpensesPage() {
  const { organizationId, storeId, storeName } = useDemoSession();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState<any>("Rent");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [organizationId, storeId]);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setExpenses(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          store_id: storeId,
          category,
          amount: Number(amount),
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to log expense");
      setShowModal(false);
      setAmount(0);
      setNotes("");
      fetchExpenses();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">Store Operating Expenses (Overhead P&L)</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track fixed and variable retail store overheads deducted directly from gross margins
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Total Overhead Recorded</span>
            <span className="font-mono font-bold text-base text-foreground">
              ${totalExpense.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> Log Store Expense
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Store / Branch</th>
              <th className="p-3.5 text-right font-bold">Amount</th>
              <th className="p-3.5">Audit Memo / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No operating expenses logged yet.
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-accent/30 transition">
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded-lg bg-accent px-2 py-0.5 font-semibold text-foreground">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{e.stores?.name || storeName}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-red-600 dark:text-red-400">
                    -${Number(e.amount).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-muted-foreground">{e.notes || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateExpense}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Log Store Operating Expense</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              >
                <option value="Rent">Rent & Facility Lease</option>
                <option value="Utilities">Utilities & Electricity / HVAC</option>
                <option value="Salaries">Staff Payroll & Wages</option>
                <option value="Marketing">Local Marketing & Promotions</option>
                <option value="Maintenance">Store Equipment Maintenance</option>
                <option value="Other">Miscellaneous Operating Expense</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Memo / Purpose</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Monthly refrigeration bill, quarterly window signage, AC servicing..."
                className="w-full rounded-xl border border-border bg-background p-2 text-xs h-20"
              />
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
                {submitting ? "Logging..." : "Log Expense"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
