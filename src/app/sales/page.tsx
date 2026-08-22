"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Receipt,
  RotateCcw,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Printer,
} from "lucide-react";

export default function SalesPage() {
  const { organizationId } = useDemoSession();

  const [sales, setSales] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "returns">("sales");
  const [loading, setLoading] = useState(false);

  // Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState("Customer changed mind / unopened");
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchReturns();
  }, [organizationId]);

  async function fetchSales() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setSales(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReturns() {
    try {
      const res = await fetch(`/api/returns?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setReturns(json.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleProcessReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSale || !selectedProductId) return;

    setReturnLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          sale_id: selectedSale.id,
          product_id: selectedProductId,
          quantity: returnQty,
          reason: returnReason,
        }),
      });

      if (!res.ok) throw new Error("Failed to process return");

      setShowReturnModal(false);
      fetchSales();
      fetchReturns();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReturnLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">Sales Invoices & Customer Returns</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Transaction audit trail • Split payments records • Automatic ledger restock on return
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-border bg-background p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("sales")}
            className={`rounded-lg px-4 py-1.5 transition ${
              activeTab === "sales"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sales Invoices ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`rounded-lg px-4 py-1.5 transition ${
              activeTab === "returns"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer Returns ({returns.length})
          </button>
        </div>
      </div>

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Line Items</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">Tax</th>
                <th className="p-3.5 text-right font-bold">Total Paid</th>
                <th className="p-3.5">Payment Split</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No sales invoices recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30 transition">
                    <td className="p-3.5 font-mono font-bold text-foreground">{s.invoice_number}</td>
                    <td className="p-3.5 text-foreground">
                      {s.customers?.name || "Guest Customer"}
                      {s.customers?.phone && (
                        <span className="block text-[10px] text-muted-foreground">{s.customers.phone}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {(s.sale_items || []).map((i: any) => `${i.quantity}x ${i.products?.name || "Item"}`).join(", ") || "—"}
                    </td>
                    <td className="p-3.5 text-right font-mono text-muted-foreground">${Number(s.subtotal).toFixed(2)}</td>
                    <td className="p-3.5 text-right font-mono text-muted-foreground">${Number(s.tax).toFixed(2)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-foreground">${Number(s.total).toFixed(2)}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(s.payments || []).map((p: any) => (
                          <span
                            key={p.id}
                            className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-mono text-foreground font-medium"
                          >
                            {p.method}: ${Number(p.amount).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedSale(s);
                          if (s.sale_items?.length > 0) setSelectedProductId(s.sale_items[0].product_id);
                          setShowReturnModal(true);
                        }}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-accent transition"
                      >
                        Process Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === "returns" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Invoice Ref</th>
                <th className="p-3.5">Returned Product</th>
                <th className="p-3.5 text-center">Qty Restocked</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5 text-center">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No customer returns recorded.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/30 transition">
                    <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {r.sales?.invoice_number || r.sale_id}
                    </td>
                    <td className="p-3.5 font-medium text-foreground">
                      {r.products?.name}
                      <span className="block font-mono text-[10px] text-muted-foreground">{r.products?.sku}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{r.quantity} units
                    </td>
                    <td className="p-3.5 text-muted-foreground">{r.reason}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Restocked
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Return / Refund Modal */}
      {showReturnModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleProcessReturn}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Customer Return & Refund</h2>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Original Invoice</p>
              <p className="text-sm font-bold font-mono text-foreground">{selectedSale.invoice_number}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Select Item to Return</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                required
              >
                {(selectedSale.sale_items || []).map((item: any) => (
                  <option key={item.product_id} value={item.product_id}>
                    {item.products?.name || item.product_id} ({item.quantity} purchased @ ${item.selling_price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Return Quantity</label>
              <input
                type="number"
                min="1"
                value={returnQty}
                onChange={(e) => setReturnQty(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Return Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              >
                <option value="Customer changed mind / unopened">Customer changed mind / unopened</option>
                <option value="Defective unit / warranty replacement">Defective unit / warranty replacement</option>
                <option value="Incorrect size / color fit">Incorrect size / color fit</option>
                <option value="Expired item returned">Expired item returned</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={returnLoading}
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-500 transition"
              >
                {returnLoading ? "Restocking..." : "Authorize Return (+Stock)"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
