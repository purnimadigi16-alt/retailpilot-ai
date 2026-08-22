"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Boxes,
  History,
  PlusCircle,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Filter,
} from "lucide-react";

export default function InventoryPage() {
  const { organizationId, storeId, organizationName } = useDemoSession();

  const [activeTab, setActiveTab] = useState<"catalog" | "ledger" | "transfer">("catalog");
  const [products, setProducts] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<"DAMAGED" | "ADJUSTMENT">("DAMAGED");
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Transfer State Machine Simulation
  const [transfers, setTransfers] = useState([
    {
      id: "tr_891",
      source_store: "Apex Downtown Superstore",
      dest_store: "Apex Westside Express",
      product_name: "Artisan Sourdough Loaf",
      quantity: 15,
      status: "Requested",
      updated_at: "Today, 11:30 AM",
    },
    {
      id: "tr_890",
      source_store: "Apex Downtown Superstore",
      dest_store: "Apex Westside Express",
      product_name: "Organic Whole Milk 1 Gallon",
      quantity: 20,
      status: "Received",
      updated_at: "Yesterday, 04:15 PM",
    },
  ]);

  useEffect(() => {
    fetchInventory();
    fetchLedger();
  }, [organizationId, storeId]);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setProducts(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLedger() {
    try {
      const res = await fetch(`/api/inventory/ledger?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setLedgerEntries(json.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRecordAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;

    setAdjustLoading(true);
    try {
      const quantitySigned = adjustType === "DAMAGED" ? -Math.abs(adjustQty) : adjustQty;

      const res = await fetch("/api/inventory/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          store_id: storeId,
          product_id: selectedProduct.id,
          movement_type: adjustType,
          quantity: quantitySigned,
          notes: adjustNotes || `Manual ${adjustType.toLowerCase()} entry`,
        }),
      });

      if (!res.ok) throw new Error("Failed to record adjustment");

      setShowAdjustModal(false);
      setAdjustNotes("");
      fetchInventory();
      fetchLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdjustLoading(false);
    }
  }

  function progressTransfer(transferId: string) {
    const sequence: Record<string, string> = {
      Draft: "Requested",
      Requested: "Approved",
      Approved: "Dispatched",
      Dispatched: "Received",
    };

    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId && sequence[t.status]) {
          return { ...t, status: sequence[t.status], updated_at: "Just now" };
        }
        return t;
      })
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">
              Immutable Stock Movement Ledger & Inventory
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Zero direct manual count overwrites • Provenance tracked mathematically across all movements
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl border border-border bg-background p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`rounded-lg px-4 py-1.5 transition ${
              activeTab === "catalog"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Live Stock Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`rounded-lg px-4 py-1.5 transition ${
              activeTab === "ledger"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Audit Ledger ({ledgerEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("transfer")}
            className={`rounded-lg px-4 py-1.5 transition ${
              activeTab === "transfer"
                ? "bg-blue-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Branch Transfers ({transfers.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Live Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search SKU or product title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Formula: Current Stock = Opening + POs - Sales + Returns - Damaged ± Adjustments
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">SKU / Barcode</th>
                  <th className="p-3.5">Product Title</th>
                  <th className="p-3.5 text-right">Cost Price</th>
                  <th className="p-3.5 text-right">Selling Price</th>
                  <th className="p-3.5 text-center">Safety Reorder</th>
                  <th className="p-3.5 text-center font-bold">Ledger Balance</th>
                  <th className="p-3.5 text-right">Stock Valuation</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((p) => {
                  const stock = p.current_stock ?? 0;
                  const isLow = stock <= (p.reorder_level ?? 10);
                  const valuation = stock * Number(p.cost_price ?? 0);

                  return (
                    <tr key={p.id} className="hover:bg-accent/30 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-foreground block">{p.sku}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{p.barcode}</span>
                      </td>
                      <td className="p-3.5 font-medium text-foreground">{p.name}</td>
                      <td className="p-3.5 text-right font-mono text-muted-foreground">₹{Number(p.cost_price).toFixed(2)}</td>
                      <td className="p-3.5 text-right font-mono font-semibold text-foreground">₹{Number(p.selling_price).toFixed(2)}</td>
                      <td className="p-3.5 text-center text-muted-foreground">{p.reorder_level ?? 10}</td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          isLow
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {stock} units
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-foreground">₹{valuation.toFixed(2)}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowAdjustModal(true);
                          }}
                          className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-accent transition"
                        >
                          Log Adjustment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Immutable Movement Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Movement Type</th>
                  <th className="p-3.5 text-center">Signed Delta</th>
                  <th className="p-3.5">Reference ID</th>
                  <th className="p-3.5">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-accent/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium text-foreground">
                        {e.products?.name || e.product_id}
                        <span className="block font-mono text-[10px] text-muted-foreground">{e.products?.sku}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded px-2 py-0.5 font-mono text-[10px] font-bold bg-accent text-foreground">
                          {e.movement_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={Number(e.quantity) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          {Number(e.quantity) > 0 ? `+${e.quantity}` : e.quantity}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-muted-foreground">{e.reference_id || "—"}</td>
                      <td className="p-3.5 text-muted-foreground text-xs">{e.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Branch Transfers */}
      {activeTab === "transfer" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Branch-to-Branch Stock Transfers</h2>
                <p className="text-xs text-muted-foreground">
                  Workflow States: Draft → Requested → Approved → Dispatched → Received
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {transfers.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-background/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{t.id}</span>
                      <span className="font-semibold text-sm text-foreground">{t.product_name}</span>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        ({t.quantity} units)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Route: <strong>{t.source_store}</strong> ➔ <strong>{t.dest_store}</strong> • {t.updated_at}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      t.status === "Received"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : t.status === "Dispatched"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {t.status}
                    </span>

                    {t.status !== "Received" && (
                      <button
                        onClick={() => progressTransfer(t.id)}
                        className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                      >
                        Progress State →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleRecordAdjustment}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Log Immutable Stock Adjustment</h2>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Product</p>
              <p className="text-sm font-bold text-foreground">{selectedProduct.name}</p>
              <p className="text-xs font-mono text-muted-foreground">Current Stock: {selectedProduct.current_stock ?? 0} units</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("DAMAGED")}
                  className={`rounded-xl border p-2 text-xs font-bold transition ${
                    adjustType === "DAMAGED"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  - Damaged / Spoiled
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("ADJUSTMENT")}
                  className={`rounded-xl border p-2 text-xs font-bold transition ${
                    adjustType === "ADJUSTMENT"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  ± Stock Count Discrepancy
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Quantity Delta</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background p-2 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Reason / Notes</label>
              <textarea
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Audit finding, carton breakage, expiration disposal..."
                className="w-full rounded-xl border border-border bg-background p-2 text-xs h-20"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustLoading}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
              >
                {adjustLoading ? "Recording..." : "Record in Immutable Ledger"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
