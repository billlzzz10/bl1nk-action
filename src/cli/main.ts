import { Command } from "commander";
import { runAnalyze } from "@/core/runner";
import { toMarkdown } from "@/core/reporter/md";
import { toJson } from "@/core/reporter/json";
import { grade as gradeReport } from "@/core/reporter/grade";
import { buildImportGraph } from "@/arch/import_graph";
import { clusterGraph } from "@/arch/clusters";
import { toDot } from "@/core/reporter/graphviz";
import { findExactDuplicateFunctions } from "@/dup/dup_functions";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const program = new Command();
program.name("code-audit").description("TS audit, graphs, grade, duplicates");

program
  .command("analyze")
  .argument("[root]", "root directory", ".")
  .option("--format <fmt>", "md|json", "md")
  .option("--out <file>", "output file")
  .option("--fail-on <lvl>", "none|warn|error", "error")
  .action(async (root, opts) => {
    const report = await runAnalyze(path.resolve(root));
    const content = opts.format === "json" ? toJson(report) : toMarkdown(report);
    if (opts.out) await fs.writeFile(opts.out, content, "utf8"); else process.stdout.write(content + "\n");

    const hasError = report.results.some(r => !r.passed && r.severity === "error");
    const hasWarn = report.results.some(r => !r.passed && r.severity !== "info");
    let code = 0;
    if (opts.failOn === "error" && hasError) code = 1;
    if (opts.failOn === "warn" && (hasWarn || hasError)) code = 1;
    process.exit(code);
  });

program
  .command("graph")
  .argument("[root]", "root directory", ".")
  .option("--out <file>", "DOT output", "import-graph.dot")
  .action(async (root, opts) => {
    const g = buildImportGraph(path.resolve(root));
    const labels = clusterGraph(g);
    const dot = toDot(g);
    await fs.writeFile(opts.out, dot, "utf8");
    await fs.writeFile(opts.out.replace(/\.dot$/, ".clusters.json"), JSON.stringify(labels, null, 2), "utf8");
    console.log(`Wrote: ${opts.out}`);
  });

program
  .command("dup")
  .argument("[root]", "root directory", ".")
  .option("--out <file>", "JSON output", "duplicates.json")
  .action(async (root, opts) => {
    const groups = findExactDuplicateFunctions(path.resolve(root));
    await fs.writeFile(opts.out, JSON.stringify(groups, null, 2), "utf8");
    console.log(`Wrote: ${opts.out} (${groups.length} groups)`);
    process.exit(groups.length > 0 ? 1 : 0); // พบซ้ำ = non-zero เพื่อดัก CI
  });

program
  .command("grade")
  .argument("[root]", "root directory", ".")
  .option("--out <file>", "JSON output", "grade.json")
  .action(async (root, opts) => {
    const report = await runAnalyze(path.resolve(root));
    const g = gradeReport(report);
    await fs.writeFile(opts.out, JSON.stringify(g, null, 2), "utf8");
    console.log(`Score: ${g.score} Grade: ${g.grade}`);
  });

program.parse();