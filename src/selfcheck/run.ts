import { runAnalyze } from "@/core/runner";
import { grade } from "@/core/reporter/grade";
import { buildImportGraph } from "@/arch/import_graph";
import { findExactDuplicateFunctions } from "@/dup/dup_functions";
import * as path from "node:path";

async function main() {
  const root = path.resolve(process.cwd());
  const report = await runAnalyze(root);
  const g = grade(report);
  const graph = buildImportGraph(root);
  const dups = findExactDuplicateFunctions(root);

  // Invariants แบบควันหลวง
  if (!report.version) throw new Error("report missing version");
  if (g.score < 0 || g.score > 100) throw new Error("grade score out of range");
  if (!Array.isArray(graph.nodes)) throw new Error("graph invalid");
  if (!Array.isArray(dups)) throw new Error("dups invalid");

  console.log("Selfcheck OK");
}

main().catch((e) => { console.error(e); process.exit(2); });
