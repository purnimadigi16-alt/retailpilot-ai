async function testDashboardRoute() {
  const url = "https://retailpilot-ai-kohl.vercel.app/dashboard";
  console.log("Checking live GET", url);
  try {
    const res = await fetch(url);
    console.log("HTTP Status:", res.status);
    const text = await res.text();
    console.log("Response length:", text.length, "bytes");
    console.log("Contains RetailPilot / Dashboard title:", text.includes("RetailPilot") || text.includes("dashboard"));
    console.log("Contains MIDDLEWARE_INVOCATION_FAILED:", text.includes("MIDDLEWARE_INVOCATION_FAILED"));
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}

testDashboardRoute();
