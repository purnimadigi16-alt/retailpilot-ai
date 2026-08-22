import { get_low_stock_products, GetLowStockProductsParams } from "./tools/get_low_stock_products";
import { get_dead_stock, GetDeadStockParams } from "./tools/get_dead_stock";
import { get_profitability, GetProfitabilityParams } from "./tools/get_profitability";
import { get_supplier_outstanding, GetSupplierOutstandingParams } from "./tools/get_supplier_outstanding";
import { generate_business_report, GenerateBusinessReportParams } from "./tools/generate_business_report";

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS_DEFINITIONS: McpToolDefinition[] = [
  {
    name: "get_low_stock_products",
    description: "Queries SKUs where current stock <= reorder threshold along with sales velocity and estimated stockout runout days.",
    parameters: {
      type: "object",
      properties: {
        organization_id: { type: "string", description: "The tenant organization ID (e.g., org_01)" },
        store_id: { type: "string", description: "Optional specific store/branch ID" },
        threshold_days: { type: "number", description: "Historical days window for sales velocity computation (default 30)" },
      },
    },
  },
  {
    name: "get_dead_stock",
    description: "Identifies high-value inventory items with zero recorded sales in 60+ days and calculates tied-up stagnant capital.",
    parameters: {
      type: "object",
      properties: {
        organization_id: { type: "string", description: "The tenant organization ID (e.g., org_01)" },
        min_days: { type: "number", description: "Minimum days with zero sales to classify as dead stock (default 60)" },
      },
      required: ["organization_id"],
    },
  },
  {
    name: "get_profitability",
    description: "Computes store financial metrics: Gross Sales - COGS (Cost of Goods Sold) - Store Operating Expenses to determine Net Profit.",
    parameters: {
      type: "object",
      properties: {
        store_id: { type: "string", description: "The store ID to analyze" },
        start_date: { type: "string", description: "Start timestamp in ISO format" },
        end_date: { type: "string", description: "End timestamp in ISO format" },
      },
      required: ["store_id"],
    },
  },
  {
    name: "get_supplier_outstanding",
    description: "Aggregates unpaid accounts payable, credit terms, and due dates across all suppliers for an organization.",
    parameters: {
      type: "object",
      properties: {
        organization_id: { type: "string", description: "The tenant organization ID (e.g., org_01)" },
        min_due: { type: "number", description: "Filter for suppliers with minimum outstanding balance" },
      },
      required: ["organization_id"],
    },
  },
  {
    name: "generate_business_report",
    description: "Generates a structured executive business diagnostic report containing revenue, COGS, dead stock, and AI strategic recommendations.",
    parameters: {
      type: "object",
      properties: {
        organization_id: { type: "string", description: "The tenant organization ID (e.g., org_01)" },
        period_month: { type: "string", description: "Reporting period string, e.g., '2026-08'" },
      },
      required: ["organization_id"],
    },
  },
];

/**
 * Direct MCP tool executor dispatch function
 */
export async function executeMcpTool(toolName: string, args: Record<string, any>) {
  switch (toolName) {
    case "get_low_stock_products":
      return await get_low_stock_products(args as GetLowStockProductsParams);
    case "get_dead_stock":
      return await get_dead_stock(args as GetDeadStockParams);
    case "get_profitability":
      return await get_profitability(args as GetProfitabilityParams);
    case "get_supplier_outstanding":
      return await get_supplier_outstanding(args as GetSupplierOutstandingParams);
    case "generate_business_report":
      return await generate_business_report(args as GenerateBusinessReportParams);
    default:
      throw new Error(`Unknown MCP tool name: ${toolName}`);
  }
}

/**
 * Handle Model Context Protocol (MCP) JSON-RPC 2.0 requests
 */
export async function handleMcpRpcRequest(request: {
  jsonrpc?: string;
  id?: string | number;
  method: string;
  params?: any;
}) {
  const { id = 1, method, params = {} } = request;

  try {
    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: MCP_TOOLS_DEFINITIONS,
        },
      };
    }

    if (method === "tools/call") {
      const { name, arguments: toolArgs } = params;
      if (!name) {
        throw new Error("Missing tool name in tools/call request");
      }
      const data = await executeMcpTool(name, toolArgs || {});
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
          isError: false,
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    };
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: error.message || "Internal MCP error",
      },
    };
  }
}
