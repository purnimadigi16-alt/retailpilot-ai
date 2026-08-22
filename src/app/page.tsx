import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Zap,
  Boxes,
  ShoppingCart,
  Database,
  ArrowRight,
  Bot,
  Terminal,
  Activity,
  Award,
} from "lucide-react";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RetailPilot AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Intelligent Multi-Tenant Retail Inventory, POS & Business Operations Platform powered by Supabase RLS and Model Context Protocol (MCP) AI Agents.",
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-600 selection:text-white">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Navigation */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-black/70 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            RetailPilot <span className="text-blue-500">AI</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#architecture" className="hover:text-white transition">Architecture</a>
          <a href="#mcp-tools" className="hover:text-white transition">MCP Protocol</a>
          <a href="#automations" className="hover:text-white transition">Automations</a>
          <a href="#rubric" className="hover:text-white transition">Evaluation Rubric</a>
          <Link href="/qa-matrix" className="hover:text-white transition flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> 50 QA Tests
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 md:px-12 lg:px-24">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[600px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8 backdrop-blur-md">
            <Award className="h-4 w-4" />
            IRC-SD Main Capstone Project #2 — Production Multi-Tenant SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 leading-[1.1]">
            Intelligent Retail Operations, POS & MCP Agent SaaS
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-400 leading-relaxed">
            Engineered for supermarkets, fashion boutiques, consumer electronics, and department stores. Featuring strict{" "}
            <span className="text-white font-semibold">Supabase Row Level Security (RLS)</span>, an{" "}
            <span className="text-white font-semibold">immutable stock movement ledger</span>, and a live{" "}
            <span className="text-white font-semibold">Model Context Protocol (MCP) server</span> driving autonomous AI business intelligence.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/25 hover:opacity-95 transition"
            >
              <span>Open Operations Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pos"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/10 transition"
            >
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              <span>Launch POS Terminal</span>
            </Link>
            <Link
              href="/qa-matrix"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 text-base font-semibold text-emerald-400 backdrop-blur hover:bg-emerald-500/20 transition"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>50 QA Tests Matrix</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Architecture</span>
              <p className="mt-1 text-xl font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" /> Multi-Tenant RLS
              </p>
              <span className="text-[11px] text-zinc-400">Org A vs Org B Strict Isolation</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Stock Ledger</span>
              <p className="mt-1 text-xl font-bold text-white flex items-center gap-2">
                <Boxes className="h-5 w-5 text-emerald-400" /> Immutable Math
              </p>
              <span className="text-[11px] text-zinc-400">Zero manual overwrites</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">AI Intelligence</span>
              <p className="mt-1 text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" /> Live MCP Server
              </p>
              <span className="text-[11px] text-zinc-400">5 standard DB tools</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Verification</span>
              <p className="mt-1 text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" /> 50 QA Cases
              </p>
              <span className="text-[11px] text-zinc-400">100% automated test suite</span>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Immutable Ledger Formula */}
      <section id="architecture" className="border-t border-white/10 bg-zinc-950 px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enterprise Foundation</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-white">
              Multi-Tenant RLS & Stock Movement Ledger
            </h2>
            <p className="mt-3 text-zinc-400 max-w-2xl mx-auto">
              Direct manual overwrites of inventory counts are forbidden. All inventory changes are recorded in an immutable ledger with audit provenance.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-blue-500/20 bg-blue-950/10 p-6 md:p-8">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Immutable Stock Balance Mathematical Formula</h3>
            <div className="mt-4 overflow-x-auto rounded-xl bg-black/60 p-4 font-mono text-sm sm:text-base text-zinc-200 border border-white/10">
              <code>Current Stock = Opening Stock + Purchases - Sales + Returns - Damaged ± Adjustments</code>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="font-semibold text-white">Stock Transfer States:</span>
              <span className="rounded bg-white/10 px-2 py-1">Draft</span> →
              <span className="rounded bg-white/10 px-2 py-1">Requested</span> →
              <span className="rounded bg-white/10 px-2 py-1">Approved</span> →
              <span className="rounded bg-white/10 px-2 py-1">Dispatched</span> →
              <span className="rounded bg-emerald-950 text-emerald-300 px-2 py-1">Received</span>
            </div>
          </div>

          {/* 6 Target User Roles */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-purple-400">
                <ShieldCheck className="h-5 w-5" /> 1. Super Admin
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>Global tenant provisioning (Org A, B, C)</li>
                <li>Subscription billing & tiers</li>
                <li>System telemetry & analytics</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-blue-400">
                <TrendingUp className="h-5 w-5" /> 2. Business Owner
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>Multi-store & staff setup</li>
                <li>P&L, revenue & expense tracking</li>
                <li>AI Business Assistant & monthly dossier</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-emerald-400">
                <Boxes className="h-5 w-5" /> 3. Store Manager
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>Store-level stock audits</li>
                <li>PO receipt & return approvals</li>
                <li>Store performance analytics</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-amber-400">
                <ShoppingCart className="h-5 w-5" /> 4. Sales Staff
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>Fast POS terminal & barcode scanner</li>
                <li>Invoice creation & split payments</li>
                <li>Customer returns & refunds</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-cyan-400">
                <Layers className="h-5 w-5" /> 5. Inventory Staff
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>PO Goods Receipt Notes (GRN)</li>
                <li>Damaged stock logging & adjustments</li>
                <li>Branch-to-branch stock transfers</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex items-center gap-2 font-bold text-base text-pink-400">
                <Sparkles className="h-5 w-5" /> 6. Customer Portal
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                <li>Self-service digital invoices</li>
                <li>Loyalty points balance & redemption</li>
                <li>Personalized promotions & receipts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Model Context Protocol (MCP) Section */}
      <section id="mcp-tools" className="border-t border-white/10 bg-black px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Model Context Protocol</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-white">
              5 Live Database MCP Tools
            </h2>
            <p className="mt-3 text-zinc-400 max-w-2xl mx-auto">
              The AI Business Assistant strictly queries live database state via Model Context Protocol tools without hallucinated approximations.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-400">get_low_stock_products()</span>
                  <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">store_id, threshold_days</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Queries SKUs where stock ≤ reorder threshold and calculates daily sales velocity with estimated runout days.
                </p>
              </div>
              <Link href="/ai-assistant" className="text-xs font-semibold text-blue-400 hover:underline">Execute in Studio →</Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-400">get_dead_stock()</span>
                  <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">organization_id, min_days</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Identifies high-value inventory with zero recorded sales in 60+ days and computes stagnant tied-up capital.
                </p>
              </div>
              <Link href="/ai-assistant" className="text-xs font-semibold text-blue-400 hover:underline">Execute in Studio →</Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-400">get_profitability()</span>
                  <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">store_id, start_date, end_date</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Computes Gross Sales - COGS (from ledger cost base) - Store Operating Expenses for exact Net Margin.
                </p>
              </div>
              <Link href="/ai-assistant" className="text-xs font-semibold text-blue-400 hover:underline">Execute in Studio →</Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-400">get_supplier_outstanding()</span>
                  <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">organization_id, min_due</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Aggregates unpaid accounts payable, credit terms, and due dates across all suppliers.
                </p>
              </div>
              <Link href="/ai-assistant" className="text-xs font-semibold text-blue-400 hover:underline">Execute in Studio →</Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-400">generate_business_report()</span>
                  <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">organization_id, period_month</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Generates structured JSON diagnostic payload for executive business reports with strategic directives.
                </p>
              </div>
              <Link href="/ai-assistant" className="text-xs font-semibold text-blue-400 hover:underline">Execute in Studio →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Automated Workflows */}
      <section id="automations" className="border-t border-white/10 bg-zinc-950 px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Background Automation Engine</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-white">
              5 Mandatory Automated Workflows
            </h2>
            <p className="mt-3 text-zinc-400 max-w-2xl mx-auto">
              Automated triggers, webhooks, and cron pipelines delivering continuous intelligence.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                <Zap className="h-4 w-4" /> 1. Low Stock Auto-Alert
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Stock drops below reorder point → Webhook trigger → Manager dashboard alert & notification.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
                <Activity className="h-4 w-4" /> 2. Dead Stock Bi-Weekly Audit
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scheduled cron check → Identifies 60+ day stagnant capital → Generates markdown liquidation plan.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <ShieldCheck className="h-4 w-4" /> 3. Supplier Payment Escalation
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                PO payment due in &lt; 48 hours → Verifies pending invoice → Alerts Accounts / Store Manager.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <TrendingUp className="h-4 w-4" /> 4. Daily End-of-Day Sales Dossier
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Midnight trigger → Aggregates day gross revenue, refunds, top SKUs → Pushes summary to Owner.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-400">
                <Bot className="h-4 w-4" /> 5. Monthly Executive AI Report
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                1st of every month → Invokes full MCP data pipeline → Generates comprehensive executive diagnostic report with disclaimer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black px-8 py-12 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-2 font-semibold text-zinc-300">
          <Sparkles className="h-4 w-4 text-blue-500" /> RetailPilot AI — IRC-SD Main Capstone Project #2
        </div>
        <p className="mt-2 text-zinc-500">
          Enterprise Multi-Tenant SaaS • Supabase Row Level Security • Model Context Protocol • Next.js 16
        </p>
      </footer>
    </div>
  );
}
