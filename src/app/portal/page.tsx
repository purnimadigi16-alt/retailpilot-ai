"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  User,
  Award,
  Receipt,
  Sparkles,
  Percent,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from "lucide-react";

export default function CustomerPortalPage() {
  const { organizationId, organizationName } = useDemoSession();

  const [customer, setCustomer] = useState<any>({
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+1-555-7890",
    loyalty_points: 340,
  });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [organizationId]);

  async function fetchInvoices() {
    try {
      const res = await fetch(`/api/sales?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setInvoices(json.data);
    } catch (e) {}
  }

  function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSubmitted(true);
    setFeedback("");
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Customer Self-Service Hub</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Welcome back, <strong>{customer.name}</strong> • {organizationName}
            </p>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 text-pink-600 dark:text-pink-300">
          <Award className="h-6 w-6" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block">Loyalty Points Balance</span>
            <span className="font-mono text-xl font-extrabold">{customer.loyalty_points} Points</span>
            <span className="text-[10px] text-muted-foreground block font-medium">(${(customer.loyalty_points / 10).toFixed(2)} Store Credit)</span>
          </div>
        </div>
      </div>

      {/* Personalized Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Percent className="h-4 w-4" /> Personalized Promotion
          </div>
          <h3 className="font-bold text-sm text-foreground">20% Off Weekend Bakery & Dairy</h3>
          <p className="text-xs text-muted-foreground">
            Exclusive loyalty voucher valid on your next checkout. Automatically applied at POS!
          </p>
          <span className="inline-block rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] text-foreground font-bold">
            PROMO: RETAILVIP20
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" /> Point Accelerator
          </div>
          <h3 className="font-bold text-sm text-foreground">Double Points on Fresh Organics</h3>
          <p className="text-xs text-muted-foreground">
            Earn 2x loyalty points per $1 spent on all fresh farm produce and whole foods this month.
          </p>
          <span className="inline-block rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
            ACTIVE MEMBER PERK
          </span>
        </div>
      </div>

      {/* Digital Invoices */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-500" />
            <h2 className="font-bold text-sm text-foreground">Digital Invoices & Receipts</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Purchased Items</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No purchase records found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-accent/30 transition">
                    <td className="p-3 font-mono font-bold text-foreground">{inv.invoice_number}</td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {(inv.sale_items || []).map((i: any) => `${i.quantity}x ${i.products?.name || "Item"}`).join(", ") || "Order items"}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ${Number(inv.total).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Paid In Full
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback & Requests */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-500" />
          <h2 className="font-bold text-sm text-foreground">Order Feedback & Product Requests</h2>
        </div>

        {feedbackSubmitted ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Thank you! Your feedback has been sent directly to the Store Manager.
          </div>
        ) : (
          <form onSubmit={handleFeedback} className="space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Request a specific item or share feedback on your store experience..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs h-24 focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-500 transition"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
