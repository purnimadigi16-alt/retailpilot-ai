# Target User Roles & Role-Based Access Control (RBAC)

RetailPilot AI implements granular Role-Based Access Control across 6 distinct user roles configured for Indian retail enterprises.

---

## 1. Role Personas Specification

### 1. Super Admin
- **Persona:** Vikramaditya Roy
- **Operational Scope:** Global platform governance across all tenant organizations.
- **Key Responsibilities:**
  - Global tenant provisioning (`org_01` Apex Supermarket, `org_02` Vogue Fashion, `org_03` Volt Electronics).
  - Subscription tier allocation (Starter ₹3,999/mo, Growth ₹7,999/mo, Enterprise Pro ₹14,999/mo).
  - System telemetry, active connections, and security auditing.
  - Global PostgreSQL database RLS policy enforcement.

### 2. Business Owner
- **Persona:** Purnima Verma (Apex Supermarket & Grocery) / Aditi Singhania (Vogue Fashion Hub) / Rajesh Sharma (Volt Electronics)
- **Operational Scope:** Entire organization across all retail store outlets in India.
- **Key Responsibilities:**
  - Multi-store setup (e.g. Connaught Place Delhi, Indiranagar Bengaluru, Khan Market Delhi, Phoenix Palladium Mumbai, Nehru Place Delhi).
  - Real-time P&L tracking, gross margin monitoring, and operating expense auditing (in INR ₹).
  - AI Business Assistant interaction and strategic directive evaluation.
  - Monthly automated executive diagnostic dossiers.

### 3. Store Manager
- **Persona:** Rahul Mehra (Apex Connaught Place MegaStore, Delhi) / Karan Malhotra (Vogue Khan Market Flagship)
- **Operational Scope:** Store-level operations and branch staff oversight.
- **Key Responsibilities:**
  - Store-level physical inventory audits and count reconciliations.
  - Purchase Order Goods Receipt Note (GRN) approvals.
  - Customer return and refund authorizations.
  - Staff shift performance and daily sales targets.

### 4. Sales Staff
- **Persona:** Priya Patel
- **Operational Scope:** Point of Sale (POS) checkout counter.
- **Key Responsibilities:**
  - Rapid barcode scanning and SKU lookup.
  - Split payment processing (Cash + Card + UPI/QR + Store Loyalty Points in INR ₹).
  - Digital invoice creation and thermal receipt printing (80mm rolls).
  - Customer checkout loyalty points attachment.

### 5. Inventory Staff
- **Persona:** Amitabh Joshi
- **Operational Scope:** Warehouse, storage docks, and stockroom.
- **Key Responsibilities:**
  - PO Goods Receipt Notes (GRN) physical stock check-in.
  - Damaged stock logging and transit breakage write-downs.
  - Manual inventory adjustments and audit reconciliation.
  - Inter-branch transfer handling (Draft -> Dispatched -> Received).

### 6. Customer (Self-Service Portal)
- **Persona:** Sneha Reddy / Rohan Kulkarni / Kavya Nair
- **Operational Scope:** Customer personal self-service portal.
- **Key Responsibilities:**
  - Self-service digital invoice and receipt lookup.
  - Real-time loyalty points balance tracking (₹1 store credit per 10 points).
  - Personalized promotional discounts and VIP perks.
  - Store experience feedback and product requests.

---

## 2. Granular RBAC Permissions Matrix

| Platform Module | Super Admin | Business Owner | Store Manager | Sales Staff | Inventory Staff | Customer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global Tenant Provisioning** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subscription & Tier Billing (₹)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Executive P&L & Financials (₹)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **AI Assistant & MCP Studio** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Automations Center** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **POS Terminal & Split Pay (₹/UPI)** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer Returns Authorization** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Inventory Ledger & Stock** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Stock Adjustments / Damaged** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Branch Stock Transfers** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **PO Creation & GRN Intake** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Suppliers & Payables (₹)** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customer Directory** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer Self-Service Hub** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **QA 50 Test Cases Matrix** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
