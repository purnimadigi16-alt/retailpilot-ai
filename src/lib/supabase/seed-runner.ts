import { seedDatabase } from "./seed";

async function main() {
  console.log("================================================================================");
  console.log("         RETAILPILOT AI: SEEDING MULTI-TENANT DATABASE WITH INDIAN DATA         ");
  console.log("================================================================================\n");

  try {
    await seedDatabase();
    console.log("\n================================================================================");
    console.log("  DATABASE SEEDING SUCCESSFUL!");
    console.log("================================================================================\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Fatal seed error:", error.message);
    process.exit(1);
  }
}

main();
