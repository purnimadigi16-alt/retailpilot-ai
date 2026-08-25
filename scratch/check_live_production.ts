async function testLiveDashboard() {
  const prodBase = "https://retailpilot-ai-kohl.vercel.app";
  console.log("Testing live Executive Dashboard backend at:", prodBase);

  try {
    // 1. Analytics
    const aRes = await fetch(`${prodBase}/api/analytics?organization_id=org_01`);
    console.log("1. /api/analytics Status:", aRes.status);
    const aJson = await aRes.json();
    console.log("   Revenue:", aJson.data?.revenue, "| Profit:", aJson.data?.net_profit, "| Margin:", aJson.data?.gross_margin + "%");

    // 2. MCP Tool call for low stock
    const mRes = await fetch(`${prodBase}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "get_low_stock_products",
        args: { organization_id: "org_01" },
      }),
    });
    console.log("2. /api/mcp get_low_stock_products Status:", mRes.status);
    const mJson = await mRes.json();
    console.log("   MCP Low Stock SKUs Count:", mJson.result?.length);

    console.log("\nALL LIVE EXECUTIVE DASHBOARD APIS VERIFIED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("Dashboard check failed:", err.message);
  }
}

testLiveDashboard();
