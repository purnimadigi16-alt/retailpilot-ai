# RetailPilot AI — REST API & MCP Server Reference

This document outlines all operational REST API endpoints and Model Context Protocol (MCP) tool interfaces available in RetailPilot AI.

---

## 1. Model Context Protocol (MCP) Endpoints

### `GET /api/mcp`
Returns the MCP server protocol status and JSON Schema declarations for all 5 registered tools.

### `POST /api/mcp`
Executes an MCP tool via JSON-RPC 2.0 or direct tool execution.

**Direct Invocation Payload:**
```json
{
  "tool": "get_low_stock_products",
  "args": {
    "organization_id": "org_01",
    "store_id": "store_01_main",
    "threshold_days": 30
  }
}
```

**JSON-RPC 2.0 Payload:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_dead_stock",
    "arguments": {
      "organization_id": "org_01",
      "min_days": 60
    }
  }
}
```

---

## 2. Model Context Protocol Tools Specification

### 1. `get_low_stock_products`
- **Purpose:** Queries SKUs where current physical stock $\le$ safety reorder threshold with daily sales velocity and runout estimations.
- **Parameters:**
  - `organization_id` (string, optional): Tenant organization ID.
  - `store_id` (string, optional): Specific store branch.
  - `threshold_days` (number, optional, default: 30): Historical velocity window.

### 2. `get_dead_stock`
- **Purpose:** Identifies high-value products with zero sales in 60+ days and computes stagnant capital.
- **Parameters:**
  - `organization_id` (string, required): Tenant organization ID.
  - `min_days` (number, optional, default: 60): Stagnant threshold.

### 3. `get_profitability`
- **Purpose:** Computes Gross Sales - COGS - Store Operating Expenses for exact Net Margin.
- **Parameters:**
  - `store_id` (string, required): Store branch identifier.
  - `start_date` (string, optional): ISO timestamp.
  - `end_date` (string, optional): ISO timestamp.

### 4. `get_supplier_outstanding`
- **Purpose:** Aggregates unpaid payables, credit terms, and aging due dates across vendors.
- **Parameters:**
  - `organization_id` (string, required): Tenant organization ID.
  - `min_due` (number, optional): Minimum outstanding balance filter.

### 5. `generate_business_report`
- **Purpose:** Compiles structured JSON diagnostic payload for executive business reports.
- **Parameters:**
  - `organization_id` (string, required): Tenant organization ID.
  - `period_month` (string, optional): Reporting month string, e.g. `2026-08`.

---

## 3. Core Operational REST API Routes

### Products & Inventory
- `GET /api/products?organization_id=org_01&store_id=...` — Returns products with calculated stock from the immutable ledger.
- `POST /api/products` — Inserts new product record with SKU, barcode, cost price, selling price.
- `GET /api/inventory/ledger?organization_id=org_01` — Returns audit ledger transaction history.
- `POST /api/inventory/ledger` — Inserts immutable movement entry (`OPENING_STOCK`, `PURCHASE`, `SALE`, `RETURN`, `DAMAGED`, `ADJUSTMENT`).

### Sales & Point of Sale
- `GET /api/sales?organization_id=org_01` — Returns sales invoices with items and split payments.
- `POST /api/sales` — Processes POS checkout, writes split payment records, calculates tax, and deducts ledger stock.
- `GET /api/returns?organization_id=org_01` — Returns customer refund history.
- `POST /api/returns` — Processes return and restocks inventory ledger.

### Purchases & Procurement
- `GET /api/purchases?organization_id=org_01` — Returns purchase orders and items.
- `POST /api/purchases` — Creates new purchase order.
- `PATCH /api/purchases` — Updates PO status; marking `Received` adds stock to ledger.

### Suppliers & Expenses
- `GET /api/suppliers?organization_id=org_01` — Returns supplier directory and balances.
- `POST /api/suppliers` — Creates new supplier.
- `GET /api/expenses?organization_id=org_01` — Returns store operating expenses.
- `POST /api/expenses` — Logs store operating expense.

### Analytics & AI
- `GET /api/analytics?organization_id=org_01` — Real-time P&L, COGS, margins, stock valuation.
- `POST /api/ai/chat` — Interactive AI Assistant chat stream with MCP tool calling.
- `POST /api/cron/trigger` — Trigger endpoint for the 5 mandatory automated workflows.
- `GET /api/auth/demo-switch` — List demo personas and tenants.
