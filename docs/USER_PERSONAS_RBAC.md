# Target User Roles & Role-Based Access Control (RBAC)

RetailPilot AI implements granular Role-Based Access Control across 6 distinct user roles.

---

## 1. Role Personas Specification

### 1. Super Admin
- **Persona:** Alexander Vance
- **Operational Scope:** Global platform governance across all tenant organizations.
- **Key Responsibilities:**
  - Global tenant provisioning (`org_01`, `org_02`, `org_03`).
  - Subscription tier allocation (Starter, Growth, Enterprise Pro).
  - System telemetry, active connections, and security auditing.
  - Global database RLS policy enforcement.

### 2. Business Owner
- **Persona:** Elena Rostova (Apex Supermarket) / Claire Dubois (Vogue Fashion)
- **Operational Scope:** Entire organization across all retail store outlets.
- **Key Responsibilities:**
  - Multi-store setup, store manager assignments, and operational oversight.
  - Real-time P&L tracking, gross margin monitoring, and operating expense auditing.
  - AI Business Assistant interaction and strategic directive evaluation.
  - Monthly automated executive diagnostic dossiers.

### 3. Store Manager
- **Persona:** Marcus Chen (Apex Downtown Superstore)
- **Operational Scope:** Store-level operations and branch staff oversight.
- **Key Responsibilities:**
  - Store-level physical inventory audits and count reconciliations.
  - Purchase Order Goods Receipt Note (GRN) approvals.
  - Customer return and refund authorizations.
  - Staff shift performance and daily sales targets.

### 4. Sales Staff
- **Persona:** Sarah Jenkins
- **Operational Scope:** Point of Sale (POS) checkout counter.
- **Key Responsibilities:**
  - Rapid barcode scanning and SKU lookup.
  - Split payment processing (Cash + Card + UPI + Store Loyalty Points).
  - Digital invoice creation and thermal receipt printing.
  - Customer checkout loyalty points attachment.

### 5. Inventory Staff
- **Persona:** David Miller
- **Operational Scope:** Warehouse, storage docks, and stockroom.
- **Key Responsibilities:**
  - PO Goods Receipt Notes (GRN) physical stock check-in.
  - Damaged stock logging and spoilage write-downs.
  - Manual inventory adjustments and audit reconciliation.
  - Inter-branch transfer handling (Draft -> Dispatched -> Received).

### 6. Customer (Self-Service Portal)
- **Persona:** Sophia Martinez
- **Operational Scope:** Customer personal self-service portal.
- **Key Responsibilities:**
  - Self-service digital invoice and receipt lookup.
  - Real-time loyalty points balance tracking ($1 per 10 points store credit).
  - Personalized promotional discounts and VIP perks.
  - Store experience feedback and product requests.

---

## 2. Granular RBAC Permissions Matrix

| Platform Module | Super Admin | Business Owner | Store Manager | Sales Staff | Inventory Staff | Customer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global Tenant Provisioning** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subscription & Tier Billing** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Executive P&L & Financials** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **AI Assistant & MCP Studio** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Automations Center** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **POS Terminal & Split Pay** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer Returns Authorization** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Inventory Ledger & Stock** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Stock Adjustments / Damaged** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Branch Stock Transfers** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **PO Creation & GRN Intake** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Suppliers & Payables** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customer Directory** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer Self-Service Hub** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **QA 50 Test Cases Matrix** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
