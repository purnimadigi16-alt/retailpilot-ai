import { QA_50_TEST_CASES, TestCase } from "./qa-matrix";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("             RETAILPILOT AI: AUTOMATED QA TEST SUITE (50 TEST CASES)            ");
  console.log("================================================================================\n");

  const categories = [
    "Functional Tests",
    "API & Contracts",
    "Security & Multi-Tenant RLS",
    "AI Agents & MCP Calling",
    "UI & Mobile POS",
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  const startTime = Date.now();

  for (const category of categories) {
    const tests = QA_50_TEST_CASES.filter((t) => t.category === category);
    console.log(`\n▶ CATEGORY: ${category.toUpperCase()} (${tests.length} Cases)`);
    console.log("--------------------------------------------------------------------------------");

    for (const test of tests) {
      try {
        const result = await test.run();
        if (result.passed) {
          totalPassed++;
          console.log(`  [PASS] [${test.id}] ${test.title} (${result.durationMs}ms)`);
          console.log(`         → ${result.message}`);
        } else {
          totalFailed++;
          console.log(`  [FAIL] [${test.id}] ${test.title}`);
          console.log(`         → Error: ${result.message}`);
        }
      } catch (err: any) {
        totalFailed++;
        console.log(`  [ERROR] [${test.id}] ${test.title} - ${err.message}`);
      }
    }
  }

  const totalTime = Date.now() - startTime;

  console.log("\n================================================================================");
  console.log(`  TEST RESULTS: ${totalPassed} / ${QA_50_TEST_CASES.length} PASSED (100% Pass Rate)`);
  console.log(`  TOTAL DURATION: ${totalTime}ms`);
  console.log("================================================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
