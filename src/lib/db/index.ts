import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Organization,
  Store,
  Profile,
  Product,
  InventoryLedgerEntry,
  MovementType,
  Supplier,
  PurchaseOrder,
  Sale,
  ReturnRecord,
  Expense,
  NotificationItem,
  AiReport,
} from "@/types";
import * as fs from "fs";
import * as path from "path";

// Helper to auto-load .env.local if not already in process.env
function ensureEnvLoaded() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = match[2] || "";
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (!process.env[key]) {
              process.env[key] = value.trim();
            }
          }
        });
      }
    } catch {
      // ignore
    }
  }
}

ensureEnvLoaded();

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lqcyiixtdwsgnqjxhvmh.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM4MDE5NiwiZXhwIjoyMTAyOTU2MTk2fQ.3n_pkHPHMER5wmXeqUFoZVRcsjXJAdOvAZUH3wIo7fw";

export const adminDb = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export function getSupabaseAdmin() {
  return adminDb;
}

export function getScopedDb(orgId?: string) {
  return adminDb;
}

/**
 * Calculates current stock from immutable inventory ledger.
 * Current Stock = Opening Stock + Purchases - Sales + Returns - Damaged ± Adjustments
 */
export async function calculateCurrentStock(
  organizationId: string,
  productId: string,
  storeId?: string
): Promise<number> {
  let query = adminDb
    .from("inventory_ledger")
    .select("quantity")
    .eq("organization_id", organizationId)
    .eq("product_id", productId);

  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error calculating stock from ledger:", error);
    return 0;
  }

  return (data || []).reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
}

/**
 * Calculates stock for all products in an organization or store
 */
export async function calculateAllProductsStock(
  organizationId: string,
  storeId?: string
): Promise<Record<string, number>> {
  let query = adminDb
    .from("inventory_ledger")
    .select("product_id, quantity")
    .eq("organization_id", organizationId);

  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching ledger for all stock:", error);
    return {};
  }

  const stockMap: Record<string, number> = {};
  for (const row of data || []) {
    stockMap[row.product_id] = (stockMap[row.product_id] || 0) + Number(row.quantity || 0);
  }
  return stockMap;
}

/**
 * Records an immutable movement in the inventory ledger.
 */
export async function recordLedgerMovement(entry: {
  organization_id: string;
  store_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number; // positive for additions, negative for deductions
  reference_id?: string;
  notes?: string;
}): Promise<InventoryLedgerEntry | null> {
  const { data, error } = await adminDb
    .from("inventory_ledger")
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error("Error writing to immutable inventory ledger:", error);
    throw new Error(`Failed to record inventory ledger movement: ${error.message}`);
  }

  return data as InventoryLedgerEntry;
}

/**
 * Creates a notification in the tenant database
 */
export async function createNotification(
  organizationId: string,
  title: string,
  message: string
) {
  const { data, error } = await adminDb
    .from("notifications")
    .insert([{ organization_id: organizationId, title, message, read: false }])
    .select()
    .single();

  return { data, error };
}

/**
 * Logs an activity entry
 */
export async function logActivity(
  organizationId: string,
  userId: string,
  action: string,
  entity: string
) {
  await adminDb.from("activity_logs").insert([
    {
      organization_id: organizationId,
      user_id: userId,
      action,
      entity,
    },
  ]);
}
