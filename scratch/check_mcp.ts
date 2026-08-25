import { executeMcpTool } from "../src/mcp/server";

async function testMcp() {
  try {
    const res = await executeMcpTool("get_low_stock_products", { organization_id: "org_01", store_id: "store_01_main" });
    console.log("MCP get_low_stock_products result:", res);
  } catch (err: any) {
    console.error("MCP error:", err.message);
  }
}

testMcp();
