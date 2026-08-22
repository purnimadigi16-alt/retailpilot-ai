"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  PackageCheck,
  ChevronRight,
} from "lucide-react";

export default function PurchasesPage() {
  const { organizationId, storeId, storeName } = useDemoSession();

  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New PO Modal
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poItems, setPoItems] = useState<Array<{ product_id: string; quantity: number; unit_cost: number }>>([]);
  const [submittingPo, setSubmittingPo] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, [organizationId]);

  async function fetchPurchases() {
    setLoading(true);
    try {
      const res = await fetch(`/api/purchases?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setPurchases(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuppliers() {
    try {
      const res = await fetch(`/api/suppliers?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setSuppliers(json.data);
    } catch (e) {}
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setProducts(json.data);
    } catch (e) {}
  }

  async function handleUpdateStatus(poId: string, newStatus: string) {
    try {
      const res = await fetch("/api/purchases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: poId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchPurchases();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function addPoItemRow() {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setPoItems([
      ...poItems,
      {
        product_id: defaultProduct.id,
        quantity: 20,
        unit_cost: Number(defaultProduct.cost_price || 10),
      },
    ]);
  }

  async function handleCreatePo(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSupplier || poItems.length === 0) return;

    setSubmittingPo(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          store_id: storeId,
          supplier_id: selectedSupplier,
          items: poItems,
          status: "Ordered",
        }),
      });

      if (!res.ok) throw new Error("Failed to create PO");
      setShowNewPoModal(false);
      setPoItems([]);
      fetchPurchases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingPo(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">
              Purchase Orders & Goods Receipt Notes (GRN)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supplier procurement lifecycle • Receiving PO automatically updates the stock ledger
          </p>
        </div>

        <button
          onClick={() => {
            if (suppliers.length > 0) setSelectedSupplier(suppliers[0].id);
            addPoItemRow();
            setShowNewPoModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" /> Create Purchase Order
        </button>
      </div>

      {/* PO List */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">PO Number</th>
              <th className="p-3.5">Supplier</th>
              <th className="p-3.5">Store Outlet</th>
              <th className="p-3.5 text-right">Total Amount</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-center">Lifecycle Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              purchases.map((po) => (
                <tr key={po.id} className="hover:bg-accent/30 transition">
                  <td className="p-3.5 font-mono font-bold text-foreground">{po.po_number}</td>
                  <td className="p-3.5 font-medium text-foreground">
                    {po.suppliers?.name || "Supplier"}
                    <span className="block text-[10px] text-muted-foreground">Credit: {po.suppliers?.credit_days || 30}d</span>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{po.stores?.name || storeName}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-foreground">
                    ₹{Number(po.total_amount).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      po.status === "Received"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : po.status === "Ordered"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                    {new Date(po.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-center">
                    {po.status === "Ordered" && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, "Received")}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        Receive GRN (+Stock)
                      </button>
                    )}
                    {po.status === "Draft" && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, "Ordered")}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-blue-500 transition"
                      >
                        Submit Order
                      </button>
                    )}
                    {po.status === "Received" && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Stock Credited
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New PO Modal */}
      {showNewPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleCreatePo}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Create Purchase Order</h2>
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.credit_days} days credit)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Ordered SKUs</label>
                <button
                  type="button"
                  onClick={addPoItemRow}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add Line Item
                </button>
              </div>

              {poItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const p = products.find((prod) => prod.id === e.target.value);
                      const updated = [...poItems];
                      updated[idx].product_id = e.target.value;
                      if (p) updated[idx].unit_cost = Number(p.cost_price || 10);
                      setPoItems(updated);
                    }}
                    className="flex-1 rounded-lg border border-border bg-background p-1.5 text-xs truncate"
                  >
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].quantity = Number(e.target.value);
                      setPoItems(updated);
                    }}
                    className="w-20 rounded-lg border border-border bg-background p-1.5 text-xs text-center font-mono"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].unit_cost = Number(e.target.value);
                      setPoItems(updated);
                    }}
                    className="w-24 rounded-lg border border-border bg-background p-1.5 text-xs text-right font-mono"
                    placeholder="Cost"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPo || poItems.length === 0}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {submittingPo ? "Submitting..." : "Issue Purchase Order"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
