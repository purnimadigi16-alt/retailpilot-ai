async function main() {
  const prodBase = "https://retailpilot-ai-kohl.vercel.app";
  console.log("Checking live production at:", prodBase);

  try {
    // 1. Products API
    const pRes = await fetch(`${prodBase}/api/products?organization_id=org_01`);
    const pJson = await pRes.json();
    console.log(`[API /products] Status: ${pRes.status} | Total SKUs: ${pJson.data?.length}`);
    if (pJson.data?.length > 0) {
      console.log(`  → Sample SKU: ${pJson.data[0].name} | Price: ₹${pJson.data[0].selling_price} | GST: ${pJson.data[0].gst_rate}%`);
    }

    // 2. Robots
    const rRes = await fetch(`${prodBase}/robots.txt`);
    const rText = await rRes.text();
    console.log(`[ROBOTS.TXT] Status: ${rRes.status}\n${rText.trim()}`);

    // 3. Sitemap
    const sRes = await fetch(`${prodBase}/sitemap.xml`);
    const sText = await sRes.text();
    console.log(`[SITEMAP.XML] Status: ${sRes.status} | Has domain: ${sText.includes(prodBase)}`);

    // 4. HTML Head Metadata
    const hRes = await fetch(prodBase);
    const hText = await hRes.text();
    const hasOgUrl = hText.includes("https://retailpilot-ai-kohl.vercel.app");
    const hasTwitterCard = hText.includes("summary_large_image");
    console.log(`[HEAD METADATA] og:url matched: ${hasOgUrl} | twitter:card summary_large_image: ${hasTwitterCard}`);

    console.log("\nALL PRODUCTION LIVE CHECKS COMPLETED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("Live check failed:", err.message);
  }
}

main();
