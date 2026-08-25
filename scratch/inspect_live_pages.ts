async function inspectLivePages() {
  const routes = ["/", "/pos", "/dashboard", "/sales"];
  const base = "https://retailpilot-ai-kohl.vercel.app";

  for (const r of routes) {
    console.log(`\n========================================`);
    console.log(`INSPECTING: ${base}${r}`);
    console.log(`========================================`);
    const res = await fetch(`${base}${r}`);
    console.log("Status:", res.status);
    const html = await res.text();

    const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const sizeAdjustMatches = html.match(/<meta[^>]*name=["']next-size-adjust["'][^>]*>/gi);

    console.log("og:url:", ogUrlMatch ? ogUrlMatch[1] : "NOT FOUND");
    console.log("twitter:card:", twitterCardMatch ? twitterCardMatch[1] : "NOT FOUND");
    console.log("canonical:", canonicalMatch ? canonicalMatch[1] : "NOT FOUND");
    console.log("next-size-adjust tags:", sizeAdjustMatches ? sizeAdjustMatches : "NONE");

    // Also check if products appear or loading state
    if (r === "/pos") {
      console.log("Contains 'Loading product catalog...':", html.includes("Loading product catalog..."));
      console.log("Contains 'Amul Gold':", html.includes("Amul Gold"));
    }
  }
}

inspectLivePages();
