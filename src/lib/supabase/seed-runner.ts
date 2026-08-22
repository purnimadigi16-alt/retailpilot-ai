import { runDatabaseSeed } from "./seed";

async function main() {
  const result = await runDatabaseSeed();
  console.log("Seed result:", result);
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
