"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { Product } from "@/types";
import {
  Receipt,
  RotateCcw,
  Search,
  CheckCircle2,
  Calendar,
  IndianRupee,
  User,
  Printer,
  Package,
  AlertCircle,
} from "lucide-react";

export default function SalesPage() {
  const { organizationId } = useDemoSession();

  const [sales, setSales] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "returns">("sales");
  const [loading, setLoading] = useState(false);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState("Customer changed mind / unopened");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchReturns();
    fetchProducts();
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

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) setProducts(json.data);
    } catch (e) {
      console.error(e);
    }
  }

  function openReturnModal(sale: any) {
    setSelectedSale(sale);
    setReturnQty(1);
    setReturnReason("Customer changed mind / unopened");
    setReturnNotes("");

    // Determine default return product
    if (sale.sale_items && sale.sale_items.length > 0) {
      const firstItem = sale.sale_items[0];
      setSelectedProductId(firstItem.product_id || firstItem.products?.id || firstItem.id);
    } else if (products.length > 0) {
      setSelectedProductId(products[0].id);
    } else {
      setSelectedProductId("");
    }

    setShowReturnModal(true);
  }

  async function handleProcessReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSale) {
      alert("No sale invoice selected");
      return;
    }

    // Determine target product ID
    let targetProdId = selectedProductId;
    if (!targetProdId) {
      if (selectedSale.sale_items && selectedSale.sale_items.length > 0) {
        targetProdId = selectedSale.sale_items[0].product_id || selectedSale.sale_items[0].id;
      } else if (products.length > 0) {
        targetProdId = products[0].id;
      }
    }

    if (!targetProdId) {
      alert("Please select a product item to return");
      return;
    }

    const finalReason = returnNotes.trim()
      ? `${returnReason} (${returnNotes.trim()})`
      : returnReason;

    setReturnLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          sale_id: selectedSale.id,
          product_id: targetProdId,
          quantity: Number(returnQty),
          reason: finalReason,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process return");

      setShowReturnModal(false);
      alert(`✔ Return processed successfully! ${returnQty} unit(s) restocked to inventory ledger.`);
      fetchSales();
      fetchReturns();
      setActiveTab("returns");
    } catch (err: any) {
      alert(`Error processing return: ${err.message}`);
    } finally {
      setReturnLoading(false);
    }
  }

  // Build selectable items for the return modal
  const selectableReturnItems: Array<{ id: string; name: string; price: number; quantity: number }> =
    selectedSale && selectedSale.sale_items && selectedSale.sale_items.length > 0
      ? selectedSale.sale_items.map((item: any) => ({
          id: String(item.product_id || item.id),
          name: String(item.products?.name || item.name || `Item ${item.product_id}`),
          price: Number(item.selling_price || 0),
          quantity: Number(item.quantity || 1),
        }))
      : products.map((p: Product) => ({
          id: p.id,
          name: p.name,
          price: Number(p.selling_price),
          quantity: 1,
        }));

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
            Returns & Restocks ({returns.length})
          </button>
        </div>
      </div>

      {/* Sales Invoices Tab */}
      {activeTab === "sales" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer Profile</th>
                <th className="p-3.5">Items Sold</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">GST (₹)</th>
                <th className="p-3.5 text-right">Total (₹)</th>
                <th className="p-3.5">Payment Breakdown</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Loading invoices...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No sales invoices recorded yet. Use the POS terminal to create sales!
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30 transition">
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {s.invoice_number}
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : "Just now"}
                    </td>
                    <td className="p-3.5">
                      {s.customers ? (
                        <div>
                          <span className="font-semibold text-foreground block">{s.customers.name}</span>
                          <span className="text-[10px] text-muted-foreground">{s.customers.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Guest Walk-in</span>
                      )}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {(s.sale_items || []).map((i: any) => `${i.quantity}x ${i.products?.name || "Item"}`).join(", ") || "Sale order items"}
                    </td>
                    <td className="p-3.5 text-right font-mono text-muted-foreground">₹{Number(s.subtotal).toFixed(2)}</td>
                    <td className="p-3.5 text-right font-mono text-muted-foreground">₹{Number(s.tax).toFixed(2)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-foreground">₹{Number(s.total).toFixed(2)}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(s.payments || []).map((p: any) => (
                          <span
                            key={p.id || p.method}
                            className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-mono text-foreground font-medium"
                          >
                            {p.method}: ₹{Number(p.amount).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openReturnModal(s)}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1 mx-auto"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Process Return</span>
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
                    No customer returns recorded. Click &ldquo;Process Return&rdquo; on any invoice to test.
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
                      {r.products?.name || "Product"}
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
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-base text-foreground">Customer Return & Restock</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-accent/50 p-3 border border-border flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px]">Invoice Reference</span>
                <span className="font-bold text-foreground">{selectedSale.invoice_number}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px]">Invoice Total</span>
                <span className="font-bold text-foreground">₹{Number(selectedSale.total).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Select Return Item <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:ring-2 focus:ring-amber-500"
                required
              >
                {selectableReturnItems.length === 0 ? (
                  <option value="">No products found</option>
                ) : (
                  selectableReturnItems.map((item: { id: string; name: string; price: number; quantity: number }) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} purchased @ ₹{item.price})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Return Quantity</label>
              <input
                type="number"
                min="1"
                max={50}
                value={returnQty}
                onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
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
                <option value="Quality dissatisfaction">Quality dissatisfaction</option>
                <option value="Billing discrepancy correction">Billing discrepancy correction</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Return Notes / Memo <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Customer provided original receipt with seal intact"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              />
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
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-500 disabled:opacity-50 transition"
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
