"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { Product } from "@/types";
import { getEffectiveGstRate, calculateCartGst } from "@/lib/gst";
import { getClientProductsForOrg } from "@/lib/catalog";
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
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Receipt,
  Info,
} from "lucide-react";

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  current_stock: number;
  category?: string;
  gst_rate: number;
}

interface ToastNotification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
}

export default function PosPage() {
  const { organizationId, organizationName, storeId, storeName } = useDemoSession();

  // Product & Catalog state
  const [products, setProducts] = useState<Product[]>(() =>
    getClientProductsForOrg(organizationId || "org_01")
  );
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");

  // Cart & Discount state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Split payments state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [pointsAmount, setPointsAmount] = useState<number>(0);
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [saleNotes, setSaleNotes] = useState<string>("");

  // Receipt & Checkout feedback state
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [showGstBreakdownDetails, setShowGstBreakdownDetails] = useState(false);

  function showToast(message: string, type: "success" | "warning" | "error" | "info" = "info") {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [organizationId, storeId]);

  async function fetchProducts() {
    setFetchError(null);
    const activeOrg = organizationId || "org_01";
    try {
      const res = await fetch(`/api/products?organization_id=${encodeURIComponent(activeOrg)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load product catalog from server`);
      }
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setProducts(json.data);
      } else if (json.error) {
        throw new Error(json.error);
      } else {
        setProducts(getClientProductsForOrg(activeOrg));
      }
    } catch (e: any) {
      console.error("[POS] Error fetching product catalog:", e);
      const fallbackItems = getClientProductsForOrg(activeOrg);
      if (fallbackItems.length > 0) {
        setProducts(fallbackItems);
      } else {
        setFetchError(e.message || "Failed to load product catalog");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const activeOrg = organizationId || "org_01";
      const res = await fetch(`/api/customers?organization_id=${encodeURIComponent(activeOrg)}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch {
      // ignore
    }
  }

  // Add Product to Cart with Stock Validation
  function addToCart(p: Product) {
    const stockAvailable = p.current_stock ?? 0;
    if (stockAvailable <= 0) {
      showToast(`"${p.name}" is currently Out of Stock!`, "error");
      return;
    }

    const existing = cart.find((item) => item.product_id === p.id);
    if (existing && existing.quantity >= stockAvailable) {
      showToast(
        `Cannot add more. Reached maximum available in-stock limit (${stockAvailable} units) for "${p.name}".`,
        "warning"
      );
      return;
    }

    const effectiveGst = p.gst_rate !== undefined ? Number(p.gst_rate) : getEffectiveGstRate(p);

    setCart((prev) => {
      const found = prev.find((item) => item.product_id === p.id);
      if (found) {
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
          cost_price: Number(p.cost_price || 0),
          selling_price: Number(p.selling_price),
          quantity: 1,
          current_stock: stockAvailable,
          category: p.category,
          gst_rate: effectiveGst,
        },
      ];
    });

    showToast(`Added 1x "${p.name}" to cart.`, "success");
  }

  // Update item quantity (+ / -) with stock ceiling check
  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) {
              showToast(`Removed "${item.name}" from cart.`, "info");
              return null;
            }
            if (delta > 0 && newQty > item.current_stock) {
              showToast(
                `Cannot exceed in-stock quantity of ${item.current_stock} units for "${item.name}".`,
                "warning"
              );
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  // Remove entire item row from cart
  function removeFromCart(productId: string) {
    const item = cart.find((i) => i.product_id === productId);
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
    if (item) {
      showToast(`Removed "${item.name}" from cart.`, "info");
    }
  }

  // Clear entire cart
  function clearCart() {
    setCart([]);
    setDiscountAmount(0);
    showToast("Cart cleared.", "info");
  }

  // Barcode / SKU Direct Scanner handler
  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const matched = products.find(
      (p) =>
        p.barcode === query ||
        p.sku.toLowerCase() === query.toLowerCase() ||
        p.name.toLowerCase() === query.toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput("");
    } else {
      showToast(`No product found for barcode or SKU: "${query}"`, "error");
    }
  }

  // Search Bar Enter Handler (Auto-adds on exact match)
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      const exactMatch = products.find(
        (p) =>
          p.barcode.toLowerCase() === q ||
          p.sku.toLowerCase() === q ||
          p.name.toLowerCase() === q
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery("");
        showToast(`Matched & added "${exactMatch.name}" via search!`, "success");
      }
    }
  }

  // --- STATUTORY MATHEMATICAL & GST CALCULATIONS ---
  // Subtotal (Sum of item prices * quantities, excluding GST)
  const subtotal = Number(
    cart.reduce((acc, curr) => acc + curr.selling_price * curr.quantity, 0).toFixed(2)
  );

  // Clamp discount so it is non-negative and cannot exceed subtotal
  const effectiveDiscount = Number(
    Math.min(subtotal, Math.max(0, Number(discountAmount) || 0)).toFixed(2)
  );

  // Statutory Indian GST calculations per item bracket with 50/50 CGST + SGST split
  const gstBreakdown = calculateCartGst(cart, effectiveDiscount);
  const totalGst = gstBreakdown.totalGst;
  const cgst = gstBreakdown.cgst;
  const sgst = gstBreakdown.sgst;
  const finalTotal = gstBreakdown.grandTotal;

  // Group items by GST bracket (0%, 5%, 12%, 18%, 28%) for audit breakdown
  const gstSlabGroups = [0, 5, 12, 18, 28].map((slab) => {
    const slabItems = gstBreakdown.items.filter((i) => i.gst_rate === slab);
    const taxableSum = Number(
      slabItems.reduce((acc, i) => acc + i.discountedLine, 0).toFixed(2)
    );
    const taxSum = Number(slabItems.reduce((acc, i) => acc + i.lineTax, 0).toFixed(2));
    return {
      slab,
      taxableSum,
      taxSum,
      cgst: Number((taxSum / 2).toFixed(2)),
      sgst: Number((taxSum - Number((taxSum / 2).toFixed(2))).toFixed(2)),
      count: slabItems.reduce((acc, i) => acc + i.quantity, 0),
    };
  });

  // Open Split Payment modal
  function openCheckout() {
    if (cart.length === 0) {
      showToast("Your cart is empty! Add products before checkout.", "warning");
      return;
    }
    setCashAmount(finalTotal);
    setCardAmount(0);
    setUpiAmount(0);
    setPointsAmount(0);
    setSaleNotes("");
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

  // Process checkout & execute sale
  async function handleCompleteCheckout() {
    if (cart.length === 0) {
      showToast("Cannot checkout an empty cart.", "error");
      return;
    }

    if (Math.abs(paymentRemaining) > 0.05) {
      showToast(
        `Payment total (₹${enteredPaymentsTotal.toFixed(2)}) must equal invoice total (₹${finalTotal.toFixed(2)})`,
        "error"
      );
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
        organization_id: organizationId || "org_01",
        store_id: storeId || "store_01_main",
        customer_id: customerId || null,
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          selling_price: i.selling_price,
          gst_rate: i.gst_rate,
        })),
        payments,
        discount: effectiveDiscount,
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

      const attachedCustomer = customers.find((c) => c.id === customerId);

      // 1. Immediately deduct purchased quantities from local product state in memory
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const purchased = cart.find((i) => i.product_id === p.id);
          if (purchased) {
            const updatedStock = Math.max(0, (p.current_stock ?? 0) - purchased.quantity);
            return { ...p, current_stock: updatedStock };
          }
          return p;
        })
      );

      // 2. Set completed sale receipt payload
      setCompletedSale({
        ...json,
        invoice_number: json.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
        cartItems: [...cart],
        payments,
        customerName: attachedCustomer ? attachedCustomer.name : undefined,
        customerPhone: attachedCustomer ? attachedCustomer.phone : undefined,
        notes: saleNotes.trim() || undefined,
        subtotal,
        discountAmount: effectiveDiscount,
        totalGst,
        cgst,
        sgst,
        total: finalTotal,
        organizationName,
        storeName,
        timestamp: new Date().toLocaleString(),
      });

      // 3. Reset Cart & Discount states for next customer
      setCart([]);
      setDiscountAmount(0);
      setShowCheckoutModal(false);
      setShowReceipt(true);
      showToast(`Sale recorded successfully! Invoice: ${json.invoice_number || "Generated"}`, "success");

      // 4. Background refresh of server catalog
      fetchProducts();
    } catch (err: any) {
      showToast(`Error completing sale: ${err.message}`, "error");
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Filter products by search and category
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category || "General").filter(Boolean))),
  ];

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
    <div className="space-y-6 relative">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-2xl border text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
                : toast.type === "warning"
                ? "bg-amber-950/90 text-amber-200 border-amber-800"
                : toast.type === "error"
                ? "bg-red-950/90 text-red-200 border-red-800"
                : "bg-zinc-900/90 text-zinc-100 border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
              {toast.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
              {toast.type === "info" && <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* POS Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">High-Speed POS Checkout Terminal</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {organizationName} • {storeName} • Statutory Indian GST billing (0%, 5%, 12%, 18%, 28%)
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
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
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
                placeholder="Search catalog by name, SKU, or barcode (Press Enter to quick-add)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? products.length
                    : products.filter((p) => (p.category || "General") === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold text-xs whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-accent/60 text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === cat
                          ? "bg-white/20 text-white"
                          : "bg-background/80 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid / Loading / Error States */}
          {loading && products.length === 0 ? (
            <div className="py-20 text-center text-xs text-muted-foreground space-y-3">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-500" />
              <p className="font-semibold text-foreground">Loading product catalog...</p>
              <p className="text-[11px] text-muted-foreground">Fetching live inventory for {organizationName}</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-xs space-y-3">
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
              <p className="font-bold text-red-600 dark:text-red-400">Error Loading Product Catalog</p>
              <p className="text-muted-foreground text-[11px] font-mono">{fetchError}</p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Loading</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground space-y-2">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">
                No products found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-[11px]">Try searching by SKU, barcode, or switching category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const stock = p.current_stock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLow = !isOutOfStock && stock <= (p.reorder_level ?? 10);
                const gstRate = p.gst_rate !== undefined ? p.gst_rate : getEffectiveGstRate(p);

                const itemInCart = cart.find((i) => i.product_id === p.id);
                const cartQty = itemInCart?.quantity || 0;
                const isAtCartLimit = cartQty >= stock;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isOutOfStock) addToCart(p);
                    }}
                    className={`flex flex-col justify-between text-left rounded-2xl border bg-card p-4 shadow-sm transition cursor-pointer group ${
                      isOutOfStock
                        ? "opacity-50 border-border cursor-not-allowed bg-accent/20"
                        : isAtCartLimit
                        ? "border-amber-500/50 hover:border-amber-500 shadow-amber-500/5"
                        : "border-border hover:border-blue-500/60 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                          {p.sku}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 text-[9px] font-mono font-bold">
                            {gstRate}% GST
                          </span>
                          <span className="rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                            {p.category || "General"}
                          </span>
                        </div>
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
                        {isOutOfStock ? (
                          <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            Out of Stock
                          </span>
                        ) : (
                          <span
                            className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isLow
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {stock} in stock
                          </span>
                        )}
                        {cartQty > 0 && (
                          <span className="block text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                            ({cartQty} in cart)
                          </span>
                        )}
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
                    onClick={clearCart}
                    className="text-[11px] text-red-500 hover:text-red-600 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 divide-y divide-border/40">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                  <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="font-semibold text-foreground">Cart is currently empty</p>
                  <p className="text-[11px] text-muted-foreground">
                    Click any product on the left or scan barcode to add.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const isMaxStock = item.quantity >= item.current_stock;
                  return (
                    <div key={item.product_id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="max-w-[130px]">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ₹{item.selling_price.toFixed(2)}
                          </span>
                          <span className="rounded bg-accent px-1 py-0.2 text-[9px] font-mono text-muted-foreground">
                            {item.gst_rate}% GST
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border bg-background">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="px-2 py-1 hover:bg-accent text-muted-foreground transition"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            disabled={isMaxStock}
                            className="px-2 py-1 hover:bg-accent text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title={isMaxStock ? "Max stock reached" : "Increase quantity"}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-xs w-16 text-right">
                          ₹{(item.selling_price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cart Pricing Calculations & Checkout Button */}
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (Excl. Tax):</span>
              <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Statutory GST Line Items Breakdown */}
            <div className="rounded-xl bg-accent/40 p-2.5 space-y-1.5 text-[11px] font-mono border border-border/60">
              <div className="flex justify-between text-foreground font-semibold items-center">
                <span className="flex items-center gap-1">
                  <span>Total Statutory GST:</span>
                  <button
                    type="button"
                    onClick={() => setShowGstBreakdownDetails(!showGstBreakdownDetails)}
                    className="text-blue-500 hover:underline text-[10px]"
                  >
                    ({showGstBreakdownDetails ? "Hide Slabs" : "View Slabs"})
                  </button>
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">₹{totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] pl-2 border-l-2 border-blue-500/40 text-muted-foreground">
                <span>CGST (Central 50%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] pl-2 border-l-2 border-blue-500/40 text-muted-foreground">
                <span>SGST (State 50%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>

              {/* Detailed Slab Breakdown Accordion */}
              {showGstBreakdownDetails && (
                <div className="mt-2 pt-2 border-t border-border/60 space-y-1 text-[10px] text-muted-foreground">
                  <div className="font-sans font-bold text-foreground mb-1">Itemized GST Slabs:</div>
                  {gstSlabGroups
                    .filter((g) => g.count > 0)
                    .map((g) => (
                      <div key={g.slab} className="flex justify-between">
                        <span>
                          {g.slab}% Slab ({g.count} items, Base ₹{g.taxableSum.toFixed(2)}):
                        </span>
                        <span>₹{g.taxSum.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Discount Input */}
            <div className="flex justify-between text-muted-foreground items-center pt-1">
              <span className="flex items-center gap-1">
                <span>Discount Voucher (₹):</span>
                {effectiveDiscount > 0 && effectiveDiscount === subtotal && (
                  <span className="text-[9px] text-amber-500 font-semibold">(Max 100%)</span>
                )}
              </span>
              <input
                type="number"
                min="0"
                max={subtotal}
                step="1"
                value={discountAmount === 0 ? "" : discountAmount}
                placeholder="0.00"
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  setDiscountAmount(val > subtotal ? subtotal : val);
                }}
                className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {effectiveDiscount > 0 && (
              <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                <span>Applied Voucher Discount:</span>
                <span>-₹{effectiveDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Payable Grand Total */}
            <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
              <span>Payable Total:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(2)}</span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={openCheckout}
              disabled={cart.length === 0}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <CreditCard className="h-4 w-4" />
              <span>
                {cart.length === 0
                  ? "Cart is Empty"
                  : `Process Payment / Checkout (₹${finalTotal.toFixed(2)})`}
              </span>
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
                Attach Customer (Loyalty Points Accrual)
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

            {/* Quick Settle 1-Click Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground font-semibold">Quick Settle:</span>
              <button
                type="button"
                onClick={() => {
                  setCashAmount(finalTotal);
                  setCardAmount(0);
                  setUpiAmount(0);
                  setPointsAmount(0);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border ${
                  cashAmount === finalTotal
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-accent/60 border-border text-foreground hover:bg-accent"
                }`}
              >
                💵 100% Cash
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpiAmount(finalTotal);
                  setCashAmount(0);
                  setCardAmount(0);
                  setPointsAmount(0);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border ${
                  upiAmount === finalTotal
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-accent/60 border-border text-foreground hover:bg-accent"
                }`}
              >
                📱 100% UPI
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardAmount(finalTotal);
                  setCashAmount(0);
                  setUpiAmount(0);
                  setPointsAmount(0);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border ${
                  cardAmount === finalTotal
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-accent/60 border-border text-foreground hover:bg-accent"
                }`}
              >
                💳 100% Card
              </button>
              <button
                type="button"
                onClick={() => {
                  const half = Number((finalTotal / 2).toFixed(2));
                  setCashAmount(half);
                  setUpiAmount(Number((finalTotal - half).toFixed(2)));
                  setCardAmount(0);
                  setPointsAmount(0);
                }}
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border bg-accent/60 border-border text-foreground hover:bg-accent"
              >
                ⚡ 50/50 Split
              </button>
            </div>

            {/* Split Tender Inputs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Banknote className="h-4 w-4 text-emerald-500" /> Cash (₹)
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashAmount || ""}
                  onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value) || 0))}
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
                  min="0"
                  value={cardAmount || ""}
                  onChange={(e) => setCardAmount(Math.max(0, Number(e.target.value) || 0))}
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
                  min="0"
                  value={upiAmount || ""}
                  onChange={(e) => setUpiAmount(Math.max(0, Number(e.target.value) || 0))}
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
                  min="0"
                  value={pointsAmount || ""}
                  onChange={(e) => setPointsAmount(Math.max(0, Number(e.target.value) || 0))}
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
                placeholder="e.g. Express counter / Fast pickup"
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
                <span
                  className={`font-bold ${
                    Math.abs(paymentRemaining) <= 0.05 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
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
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
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
                <p className="text-[10px] text-zinc-600 font-bold">Invoice: {completedSale.invoice_number}</p>
                <p className="text-[9px] text-zinc-500">{completedSale.timestamp}</p>
                {completedSale.customerName && (
                  <p className="text-[10px] text-blue-800 font-semibold mt-1">
                    Customer: {completedSale.customerName} ({completedSale.customerPhone || ""})
                  </p>
                )}
                {completedSale.notes && (
                  <p className="text-[10px] text-zinc-700 italic mt-0.5">
                    Note: &ldquo;{completedSale.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="py-2 space-y-1 border-b border-dashed border-zinc-400">
                {completedSale.cartItems.map((item: any) => (
                  <div key={item.product_id} className="flex justify-between text-[11px]">
                    <span>
                      {item.quantity}x {item.name} ({item.gst_rate}% GST)
                    </span>
                    <span>₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{Number(completedSale.subtotal).toFixed(2)}</span>
                </div>
                {Number(completedSale.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Voucher:</span>
                    <span>-₹{Number(completedSale.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>CGST (Central 50%):</span>
                  <span>₹{Number(completedSale.cgst ?? (completedSale.totalGst / 2)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>SGST (State 50%):</span>
                  <span>₹{Number(completedSale.sgst ?? (completedSale.totalGst / 2)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-zinc-300">
                  <span>TOTAL (Incl. GST):</span>
                  <span>₹{Number(completedSale.total).toFixed(2)}</span>
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
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-2.5 text-xs font-bold hover:opacity-90 transition shadow"
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
