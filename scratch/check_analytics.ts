async function testLiveAnalytics() {
  const prodUrl = "https://retailpilot-ai-kohl.vercel.app/api/analytics?organization_id=org_01";
  console.log("Checking live analytics at:", prodUrl);

  try {
    const res = await fetch(prodUrl);
    console.log("HTTP Status:", res.status);
    const json = await res.json();
    console.log("Analytics Response:");
    console.log(JSON.stringify(json, null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

testLiveAnalytics();
