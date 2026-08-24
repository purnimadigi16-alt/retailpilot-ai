"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { Product } from "@/types";
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Award,
  CheckCircle,
  Printer,
  Sparkles,
  Layers,
  ShoppingBag,
} from "lucide-react";

interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  current_stock: number;
  category?: string;
}

export default function PosPage() {
  const { organizationId, organizationName, storeId, storeName } = useDemoSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Split payments state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [pointsAmount, setPointsAmount] = useState<number>(0);
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [saleNotes, setSaleNotes] = useState<string>("");

  // Receipt modal state
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [organizationId, storeId]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch(`/api/customers?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setCustomers(json.data);
    } catch (e) {
      // ignore
    }
  }

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) =>
        p.barcode === barcodeInput.trim() ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput("");
    } else {
      alert(`No product found for barcode / SKU: ${barcodeInput}`);
    }
  }

  function addToCart(p: any) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === p.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === p.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product_id: p.id,
          sku: p.sku,
          name: p.name,
          cost_price: Number(p.cost_price),
          selling_price: Number(p.selling_price),
          quantity: 1,
          current_stock: p.current_stock ?? 0,
          category: p.category,
        },
      ];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }

  const subtotal = cart.reduce((acc, curr) => acc + curr.selling_price * curr.quantity, 0);
  const tax = Number((Math.max(0, subtotal - discountAmount) * 0.08).toFixed(2));
  const finalTotal = Number((Math.max(0, subtotal - discountAmount) + tax).toFixed(2));

  function openCheckout() {
    if (cart.length === 0) return;
    // Default cash amount to total
    setCashAmount(finalTotal);
    setCardAmount(0);
    setUpiAmount(0);
    setPointsAmount(0);
    setShowCheckoutModal(true);
  }

  const enteredPaymentsTotal = Number(
    (
      Number(cashAmount || 0) +
      Number(cardAmount || 0) +
      Number(upiAmount || 0) +
      Number(pointsAmount || 0)
    ).toFixed(2)
  );
  const paymentRemaining = Number((finalTotal - enteredPaymentsTotal).toFixed(2));

  async function handleCompleteCheckout() {
    if (Math.abs(paymentRemaining) > 0.05) {
      alert(`Payment total (₹${enteredPaymentsTotal}) must equal invoice total (₹${finalTotal})`);
      return;
    }

    setCheckoutLoading(true);

    try {
      const payments: Array<{ method: string; amount: number }> = [];
      if (cashAmount > 0) payments.push({ method: "CASH", amount: Number(cashAmount) });
      if (cardAmount > 0) payments.push({ method: "CARD", amount: Number(cardAmount) });
      if (upiAmount > 0) payments.push({ method: "UPI", amount: Number(upiAmount) });
      if (pointsAmount > 0) payments.push({ method: "LOYALTY_POINTS", amount: Number(pointsAmount) });

      const payload = {
        organization_id: organizationId,
        store_id: storeId,
        customer_id: customerId || null,
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          selling_price: i.selling_price,
        })),
        payments,
        discount: discountAmount,
        tax_rate: 0.08,
        notes: saleNotes.trim() || undefined,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Checkout failed");
      }

      setCompletedSale({
        ...json,
        cartItems: [...cart],
        payments,
        organizationName,
        storeName,
        timestamp: new Date().toLocaleString(),
      });

      setCart([]);
      setShowCheckoutModal(false);
      setShowReceipt(true);
      fetchProducts(); // refresh stock numbers
    } catch (err: any) {
      alert(`Error completing sale: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category || "General").filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory =
      selectedCategory === "All" || (p.category || "General") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* POS Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">High-Speed POS Checkout Terminal</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {organizationName} • {storeName} • Instant ledger stock sync
          </p>
        </div>

        {/* Barcode Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan Barcode / SKU (e.g. 8901001001) + Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-64 sm:w-80 rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
          >
            Add Barcode
          </button>
        </form>
      </div>

      {/* Main Grid: Catalog Left, Cart Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog Picker (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search catalog by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 font-semibold text-xs whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-accent/60 text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading && products.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading product catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              No products found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isLow = (p.current_stock ?? 0) <= (p.reorder_level ?? 10);
                return (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex flex-col justify-between text-left rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/60 hover:shadow-md transition cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                          {p.sku}
                        </span>
                        <span className="rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                          {p.category || "General"}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                        Code: {p.barcode}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Price</span>
                        <span className="text-sm font-black font-mono text-foreground">
                          ₹{Number(p.selling_price).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isLow
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {p.current_stock ?? 0} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Cart & Summary (1 col) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-full min-h-[580px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-sm text-foreground">Active Order Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  {cart.reduce((acc, curr) => acc + curr.quantity, 0)} items
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-border/40">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                  <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p>Cart is currently empty.</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Click any product on the left or scan barcode to add.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="max-w-[140px]">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        ₹{item.selling_price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border bg-background">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="px-2 py-1 hover:bg-accent text-muted-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="px-2 py-1 hover:bg-accent text-muted-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs w-14 text-right">
                        ₹{(item.selling_price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Pricing Calculations & Checkout Button */}
          <div className="mt-4 pt-4 border-t border-border space-y-2.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST / Sales Tax (8%):</span>
              <span className="font-mono font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground items-center">
              <span>Discount Voucher (₹):</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ""}
                placeholder="0.00"
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-20 rounded border border-border bg-background px-2 py-0.5 text-right font-mono text-xs"
              />
            </div>
            <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
              <span>Payable Total:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={openCheckout}
              disabled={cart.length === 0}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-95 disabled:opacity-50 transition"
            >
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Split Checkout (₹{finalTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="font-bold text-base text-foreground">Split Payment & Settlement</h2>
                <p className="text-xs text-muted-foreground">Select multiple payment channels</p>
              </div>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-lg">
                ₹{finalTotal.toFixed(2)}
              </span>
            </div>

            {/* Customer selector for loyalty points */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Attach Customer (Loyalty Accrual)
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              >
                <option value="">Guest Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyalty_points || 0} pts) - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Split inputs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Banknote className="h-4 w-4 text-emerald-500" /> Cash (₹)
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={cashAmount || ""}
                  onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                  className="w-28 rounded-lg border border-border bg-card px-2 py-1 text-right font-mono text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CreditCard className="h-4 w-4 text-blue-500" /> Card / POS (₹)
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={cardAmount || ""}
                  onChange={(e) => setCardAmount(Number(e.target.value) || 0)}
                  className="w-28 rounded-lg border border-border bg-card px-2 py-1 text-right font-mono text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <QrCode className="h-4 w-4 text-purple-500" /> UPI / QR (₹)
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={upiAmount || ""}
                  onChange={(e) => setUpiAmount(Number(e.target.value) || 0)}
                  className="w-28 rounded-lg border border-border bg-card px-2 py-1 text-right font-mono text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Award className="h-4 w-4 text-pink-500" /> Loyalty Points (₹)
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={pointsAmount || ""}
                  onChange={(e) => setPointsAmount(Number(e.target.value) || 0)}
                  className="w-28 rounded-lg border border-border bg-card px-2 py-1 text-right font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Order notes / remarks */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Order Notes / Memo <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Express counter / Festival discount"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs"
              />
            </div>

            {/* Split reconciliation validation */}
            <div className="rounded-xl border border-border bg-accent/40 p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span>Sum Entered:</span>
                <span className="font-bold">₹{enteredPaymentsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Unallocated Balance:</span>
                <span className={`font-bold ${paymentRemaining === 0 ? "text-emerald-600" : "text-red-500"}`}>
                  ₹{paymentRemaining.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteCheckout}
                disabled={checkoutLoading || Math.abs(paymentRemaining) > 0.05}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {checkoutLoading ? "Recording..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable 80mm Thermal Receipt Preview Modal */}
      {showReceipt && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle className="h-4 w-4" /> Sale Completed
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>

            {/* 80mm Receipt Box */}
            <div
              id="thermal-receipt"
              className="rounded-lg border border-border bg-white text-black p-4 font-mono text-xs space-y-2 shadow-inner"
            >
              <div className="text-center pb-2 border-b border-dashed border-zinc-400">
                <h2 className="font-bold text-sm uppercase">{completedSale.organizationName}</h2>
                <p className="text-[10px] text-zinc-600">{completedSale.storeName}</p>
                <p className="text-[10px] text-zinc-600">Invoice: {completedSale.invoice_number}</p>
                <p className="text-[9px] text-zinc-500">{completedSale.timestamp}</p>
              </div>

              <div className="py-2 space-y-1 border-b border-dashed border-zinc-400">
                {completedSale.cartItems.map((item: any) => (
                  <div key={item.product_id} className="flex justify-between text-[11px]">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{completedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>₹{completedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-zinc-300">
                  <span>TOTAL:</span>
                  <span>₹{completedSale.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-zinc-400 text-[10px] text-zinc-600">
                <p className="font-bold">Split Payments:</p>
                {completedSale.payments.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>{p.method}:</span>
                    <span>₹{Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 text-[9px] text-zinc-500">
                Thank you for your business! • RetailPilot AI
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-2.5 text-xs font-bold hover:opacity-90 transition"
              >
                <Printer className="h-4 w-4" /> Print Thermal Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
