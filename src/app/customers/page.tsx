"use client";

import React, { useState, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Users,
  Award,
  Phone,
  Mail,
  Plus,
  Search,
} from "lucide-react";

export default function CustomersPage() {
  const { organizationId } = useDemoSession();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [organizationId]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?organization_id=${organizationId}`);
      const json = await res.json();
      if (json.data) setCustomers(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          name,
          phone,
          email,
          loyalty_points: points,
        }),
      });

      if (!res.ok) throw new Error("Failed to add customer");
      setShowModal(false);
      setName("");
      setPhone("");
      setEmail("");
      fetchCustomers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">Customer Directory & Loyalty Program</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer accounts, phone contacts, and accumulated store loyalty credit points
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Customer Name</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5 text-right">Loyalty Points</th>
              <th className="p-3.5 text-right">Store Credit Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-accent/30 transition">
                <td className="p-3.5 font-bold text-foreground">{c.name}</td>
                <td className="p-3.5 text-muted-foreground font-mono">{c.phone || "—"}</td>
                <td className="p-3.5 text-muted-foreground">{c.email || "—"}</td>
                <td className="p-3.5 text-right font-mono font-bold text-pink-600 dark:text-pink-400">
                  {c.loyalty_points || 0} pts
                </td>
                <td className="p-3.5 text-right font-mono font-semibold text-foreground">
                  ${((c.loyalty_points || 0) / 10).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Add New Customer</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
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

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Initial Loyalty Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono"
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
                {submitting ? "Adding..." : "Add Customer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
