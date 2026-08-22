import { get_low_stock_products } from "@/mcp/tools/get_low_stock_products";
import { createNotification } from "@/lib/db";

export interface LowStockAutomationResult {
  triggered: boolean;
  lowStockItemsCount: number;
  notificationsCreated: number;
  items: any[];
}

/**
 * Mandatory Automation #1: Low Stock Auto-Alert
 * Trigger: Stock drops below reorder point (or webhook invoked upon POS sale/adjustment).
 * Action: Identifies low-stock SKUs, calculates runout days, and pushes alerts to Manager dashboard.
 */
export async function runLowStockAlertAutomation(
  organizationId: string = "org_01",
  storeId?: string
): Promise<LowStockAutomationResult> {
  const lowStockItems = await get_low_stock_products({
    organization_id: organizationId,
    store_id: storeId,
    threshold_days: 30,
  });

  let notifCount = 0;

  for (const item of lowStockItems) {
    const title = `⚠️ Low Stock Alert: ${item.name} (${item.sku})`;
    const message = `Current stock (${item.current_stock}) is below reorder threshold (${item.reorder_level}). Daily velocity: ${item.sales_velocity_per_day} units/day. Estimated runout in ${item.estimated_days_left} days.`;
    
    await createNotification(organizationId, title, message);
    notifCount++;
  }

  return {
    triggered: lowStockItems.length > 0,
    lowStockItemsCount: lowStockItems.length,
    notificationsCreated: notifCount,
    items: lowStockItems,
  };
}
