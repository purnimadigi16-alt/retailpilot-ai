import { executeMcpTool } from "@/mcp/server";

export interface AgentMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
    result?: any;
  };
}

export interface AgentContext {
  organizationId: string;
  storeId?: string;
  role?: string;
  userName?: string;
}

/**
 * Autonomous AI Business Assistant Agent
 * Strictly invokes live database queries via MCP tools rather than generating hallucinated approximations.
 */
export async function runRetailPilotAssistant(
  userQuery: string,
  context: AgentContext,
  chatHistory: AgentMessage[] = []
): Promise<{
  reply: string;
  toolCallsExecuted: Array<{ name: string; args: any; result: any }>;
}> {
  const queryLower = userQuery.toLowerCase();
  const toolCallsExecuted: Array<{ name: string; args: any; result: any }> = [];
  const orgId = context.organizationId || "org_01";
  const storeId = context.storeId || "store_01_main";

  let selectedTool: string | null = null;
  let toolArgs: Record<string, any> = {};

  // 1. Tool intent classification
  if (
    queryLower.includes("low stock") ||
    queryLower.includes("reorder") ||
    queryLower.includes("out of stock") ||
    queryLower.includes("stockout") ||
    queryLower.includes("depleted")
  ) {
    selectedTool = "get_low_stock_products";
    toolArgs = { organization_id: orgId, store_id: storeId, threshold_days: 30 };
  } else if (
    queryLower.includes("dead stock") ||
    queryLower.includes("slow moving") ||
    queryLower.includes("stagnant") ||
    queryLower.includes("unsold") ||
    queryLower.includes("markdown")
  ) {
    selectedTool = "get_dead_stock";
    toolArgs = { organization_id: orgId, min_days: 60 };
  } else if (
    queryLower.includes("profit") ||
    queryLower.includes("margin") ||
    queryLower.includes("cogs") ||
    queryLower.includes("p&l") ||
    queryLower.includes("income")
  ) {
    selectedTool = "get_profitability";
    toolArgs = {
      store_id: storeId,
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString(),
    };
  } else if (
    queryLower.includes("supplier") ||
    queryLower.includes("vendor") ||
    queryLower.includes("payable") ||
    queryLower.includes("due") ||
    queryLower.includes("outstanding")
  ) {
    selectedTool = "get_supplier_outstanding";
    toolArgs = { organization_id: orgId, min_due: 0 };
  } else if (
    queryLower.includes("report") ||
    queryLower.includes("dossier") ||
    queryLower.includes("executive") ||
    queryLower.includes("summary") ||
    queryLower.includes("overview")
  ) {
    selectedTool = "generate_business_report";
    toolArgs = { organization_id: orgId, period_month: "2026-08" };
  }

  // 2. Execute MCP Tool against live database
  let reply = "";
  if (selectedTool) {
    const result = await executeMcpTool(selectedTool, toolArgs);
    toolCallsExecuted.push({
      name: selectedTool,
      args: toolArgs,
      result,
    });

    // 3. Synthesize factual response with mandatory disclaimer
    if (selectedTool === "get_low_stock_products") {
      const items = result as any[];
      if (items.length === 0) {
        reply = `### 📦 Live Inventory Stock Audit\n\nAll SKU stock levels are currently **healthy and above safety reorder thresholds** across the store.\n\n- No urgent purchase replenishment orders needed at this time.`;
      } else {
        reply = `### ⚠️ Live Low Stock Alert & Velocity Analysis\n\nWe identified **${items.length} SKU(s)** currently at or below their safety reorder thresholds:\n\n` +
          `| SKU | Product Name | Stock | Reorder Level | Daily Velocity | Est. Days Left | Urgency |\n` +
          `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n` +
          items
            .map(
              (i) =>
                `| \`${i.sku}\` | **${i.name}** | **${i.current_stock}** | ${i.reorder_level} | ${i.sales_velocity_per_day}/day | **${i.estimated_days_left}d** | \`${i.urgency}\` |`
            )
            .join("\n") +
          `\n\n**Recommended Action:** Immediately issue Purchase Orders for high-velocity items to avoid costly stockouts.`;
      }
    } else if (selectedTool === "get_dead_stock") {
      const items = result as any[];
      const totalDeadValue = items.reduce((acc, curr) => acc + curr.dead_capital_tied_up, 0);
      reply = `### 🧊 Dead Stock & Stagnant Capital Diagnostic\n\nIdentified **${items.length} high-value product line(s)** with zero sales over the past 60+ days, tying up **$${totalDeadValue.toFixed(2)}** in working capital:\n\n` +
        `| SKU | Product Name | Unsold Units | Unit Cost | Tied-Up Capital | Recommended Markdown |\n` +
        `| :--- | :--- | :---: | :---: | :---: | :---: |\n` +
        items
          .map(
            (i) =>
              `| \`${i.sku}\` | ${i.name} | ${i.current_stock} | $${i.cost_price.toFixed(2)} | **$${i.dead_capital_tied_up.toFixed(2)}** | **${i.recommended_markdown_pct}% OFF** |`
          )
          .join("\n") +
        `\n\n**Strategic Recommendation:** Launch a flash clearance markdown to liquidate stagnant inventory and reinvest liberated cash flow into top-velocity SKUs.`;
    } else if (selectedTool === "get_profitability") {
      const p = result as any;
      reply = `### 📊 Live Store Financial P&L Breakdown\n\n` +
        `- **Gross Sales Revenue:** $${p.gross_sales.toFixed(2)}\n` +
        `- **Cost of Goods Sold (COGS):** -$${p.cogs.toFixed(2)}\n` +
        `- **Gross Profit:** **$${p.gross_profit.toFixed(2)}** (${p.gross_margin_pct}% Gross Margin)\n` +
        `- **Operating Expenses (Rent, Utilities, Payroll):** -$${p.operating_expenses.toFixed(2)}\n` +
        `- **Net Operating Profit:** **$${p.net_profit.toFixed(2)}** (${p.net_margin_pct}% Net Margin)\n\n` +
        `**Assessment:** Store operations are ${p.net_profit >= 0 ? "operating with healthy positive margin contribution" : "running at an operating deficit requiring expense rationalization"}.`;
    } else if (selectedTool === "get_supplier_outstanding") {
      const list = result as any[];
      const totalDue = list.reduce((acc, curr) => acc + curr.outstanding_balance, 0);
      reply = `### 🏢 Accounts Payable & Supplier Aging Summary\n\nTotal outstanding payables: **$${totalDue.toFixed(2)}** across **${list.length} suppliers**:\n\n` +
        `| Supplier Name | Credit Terms | Total Balance | Overdue (Est.) | Due Status |\n` +
        `| :--- | :---: | :---: | :---: | :---: |\n` +
        list
          .map(
            (s) =>
              `| **${s.name}** | ${s.credit_days} Days | $${s.outstanding_balance.toFixed(2)} | $${s.overdue_amount.toFixed(2)} | \`${s.due_status}\` |`
          )
          .join("\n") +
        `\n\n**Accounts Escalation Notice:** Prioritize suppliers marked \`CRITICAL_DUE\` to maintain credit health and prevent shipment holds.`;
    } else if (selectedTool === "generate_business_report") {
      const rep = result as any;
      reply = `### 📑 Executive Retail Diagnostic Dossier (${rep.period_month})\n\n` +
        `#### Key Operational Metrics\n` +
        `- **Total Gross Revenue:** $${rep.total_revenue.toFixed(2)}\n` +
        `- **COGS & Direct Costs:** $${rep.total_cogs.toFixed(2)}\n` +
        `- **Gross Margin:** $${rep.gross_profit.toFixed(2)}\n` +
        `- **Operating Overhead:** $${rep.total_expenses.toFixed(2)}\n` +
        `- **Net Bottom-Line Profit:** **$${rep.net_profit.toFixed(2)}**\n` +
        `- **Active Inventory Valuation:** $${rep.inventory_valuation.toFixed(2)}\n` +
        `- **Dead Capital at Risk:** $${rep.dead_stock_value.toFixed(2)}\n\n` +
        `#### Executive Insights & Directives\n` +
        rep.executive_insights.map((ins: string) => `- ${ins}`).join("\n");
    }
  } else {
    // Default contextual answer
    reply = `Hello! I am your **RetailPilot AI Business Assistant**. I can query live operational and financial data from your store via Model Context Protocol (MCP) tools.\n\n` +
      `Here are quick queries you can run right now:\n` +
      `- **"Check low stock and replenishment urgency"**\n` +
      `- **"Audit dead stock and compute markdown liquidation"**\n` +
      `- **"Show store P&L, COGS, and profit margins"**\n` +
      `- **"List supplier payables and upcoming payment dues"**\n` +
      `- **"Generate complete monthly executive business report"**`;
  }

  // Enforce mandatory AI recommendation disclaimer
  reply += `\n\n> ⚠️ **AI-generated recommendation — please verify all figures before commercial execution.**`;

  return {
    reply,
    toolCallsExecuted,
  };
}
