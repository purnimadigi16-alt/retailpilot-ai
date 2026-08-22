# RetailPilot AI — Mandatory 20-Minute Live Demo & Viva Script

This script outlines the exact 20-minute live demonstration flow aligned strictly with the IRC-SD Capstone Project #2 evaluation criteria.

---

## Part 1: Problem Statement & Market Differentiation (3 Minutes)

1. **Problem in Retail Management:**
   - Traditional retail software relies on error-prone manual stock counts, leading to phantom inventory, stockouts, and stagnant dead stock.
   - Most SaaS solutions lack strict database-level multi-tenant isolation or rely on hardcoded static chatbots that hallucinate numbers.
2. **RetailPilot AI Solution:**
   - **Multi-Tenant SaaS + Supabase RLS:** Guaranteed database isolation across multiple retail tenants (`org_01` Supermarkets, `org_02` Fashion Hubs, `org_03` Consumer Electronics).
   - **Immutable Stock Movement Ledger:** Absolute mathematical integrity where physical stock balance is computed strictly via ledger movements.
   - **Model Context Protocol (MCP) Server:** Real-time AI Business Assistant strictly executing live database tools with zero hallucination.

---

## Part 2: Full App Operational Lifecycle Demo (8 Minutes)

Walk through the complete end-to-end retail operations flow:

1. **Tenant & Multi-Store Scoping:**
   - Use the top Navbar to show active Tenant: `Apex Supermarket & Grocery` (`org_01`).
   - Switch between stores (`Apex Downtown Superstore` vs `Apex Westside Express`).
2. **Purchase Order (PO) & GRN Stock Intake:**
   - Navigate to `/purchases`.
   - Show open PO from FarmFresh Dairy (`PO-APX-2026-001`).
   - Click **"Receive GRN (+Stock)"** — demonstrate how stock instantly increases in the immutable ledger.
3. **Inventory & Movement Ledger Inspection:**
   - Navigate to `/inventory`.
   - Inspect the **Audit Ledger** tab showing signed movements (`OPENING_STOCK`, `PURCHASE`, `SALE`, `DAMAGED`).
   - Demonstrate the mathematical formula:
     $$\text{Current Stock} = \text{Opening} + \text{Purchases} - \text{Sales} + \text{Returns} - \text{Damaged} \pm \text{Adjustments}$$
   - Demonstrate inter-branch transfer progression (Draft -> Requested -> Approved -> Dispatched -> Received).
4. **POS Terminal & Split Checkout:**
   - Navigate to `/pos`.
   - Enter barcode `8901001001` or click items into cart.
   - Attach customer (`Sophia Martinez`) to earn loyalty points.
   - Open **Split Payment Modal**: allocate $40 to Card, $13.14 to Cash, and $5.00 to Store Loyalty Points.
   - Click **"Complete & Print Invoice"** — observe thermal receipt preview and automatic ledger stock deduction.
5. **Customer Return & Restock:**
   - Navigate to `/sales`.
   - Select invoice `INV-2026-0089` and click **"Process Return"**.
   - Select product and authorize return — demonstrate immediate positive restock entry in `inventory_ledger`.

---

## Part 3: Technical Architecture & Security (4 Minutes)

1. **Supabase Row-Level Security (RLS):**
   - Open `/admin` (Super Admin portal).
   - Demonstrate that Tenant A (`org_01`) data is inaccessible to Tenant B (`org_02`), enforced via PostgreSQL RLS policies in `supabase/migrations/002_rls_policies.sql`.
2. **Database Schema & Constraints:**
   - Show table relational schema: `organizations`, `stores`, `profiles`, `products`, `inventory_ledger`, `sales`, `payments`, `purchases`, `expenses`.
3. **REST APIs & Performance:**
   - Show `/api/analytics` real-time P&L calculation (Gross Sales - COGS - Store Overhead Expenses = Net Profit) completing with sub-100ms response time.

---

## Part 4: Live AI + MCP Execution & Report Generation (5 Minutes)

1. **AI Business Assistant & MCP Studio:**
   - Navigate to `/ai-assistant`.
   - Show live MCP Server status (JSON-RPC 2.0 online).
2. **Execute Live MCP Queries:**
   - Click **"Dead Stock Audit"** -> executes `get_dead_stock({ organization_id: 'org_01', min_days: 60 })`.
   - Show raw database payload in the right-hand **MCP Protocol Inspector** identifying $504 in stagnant capital.
   - Click **"Store P&L Margins"** -> executes `get_profitability({ store_id: 'store_01_main' })`.
   - Point out the mandatory disclaimer banner:
     > ⚠️ *AI-generated recommendation — please verify all figures before commercial execution.*
3. **Background Automations Center:**
   - Navigate to `/automations`.
   - Click **"Trigger All 5 Workflows"** to execute:
     1. Low Stock Auto-Alert
     2. Dead Stock Bi-Weekly Audit
     3. Supplier Payment Escalation
     4. Daily End-of-Day Sales Dossier
     5. Monthly Executive AI Report
   - View real-time JSON execution logs in the audit stream.
4. **50 QA Test Cases Matrix:**
   - Navigate to `/qa-matrix`.
   - Click **"Execute All 50 Test Cases"** — show live 50/50 test verification passing across Functional, API, Security RLS, AI MCP, and Mobile POS domains.
