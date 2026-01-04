import { runAnalyze } from "@/core/runner";
import { grade } from "@/core/reporter/grade";
import { buildImportGraph } from "@/arch/import_graph";
import { findExactDuplicateFunctions } from "@/dup/dup_functions";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  // กำหนด root เป็นโฟลเดอร์ของ action นี้โดยเฉพาะ (ไม่ใช่ cwd ของผู้เรียก)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = path.resolve(__dirname, "../.."); // ชี้ไปที่ /actions/code-audit-ts/

  console.log(`Running self-check on: ${root}`);

  const report = await runAnalyze(root);
  const g = grade(report);
  const graph = buildImportGraph(root);
  const dups = findExactDuplicateFunctions(root);

  // Invariants validation
  if (!report.version || typeof report.version !== "string") {
    throw new Error("Report is missing valid 'version' field");
  }

  if (typeof g.score !== "number" || g.score < 0 || g.score > 100) {
    throw new Error(`Invalid grade score: ${g.score} (must be 0–100)`);
  }

  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error("Import graph structure is invalid");
  }

  if (!Array.isArray(dups)) {
    throw new Error("Duplicates result must be an array");
  }

  console.log("✅ Self-check passed successfully!");
  console.log(`   Grade: ${g.grade} (${g.score}/100)`);
}

main().catch((err) => {
  console.error("❌ Self-check failed:");
  console.error(err);
  process.exit(2);
});