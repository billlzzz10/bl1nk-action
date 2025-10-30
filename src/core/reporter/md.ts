import { AnalyzeReport, RuleResult } from "@/types/rules";

function h(s: string): string { return s.replace(/\|/g, "\\|"); }

function section(results: RuleResult[], title: string): string {
  const rows = results.map(r =>
    `| ${h(r.id)} | ${r.severity} | ${r.passed ? "pass" : "fail"} | ${h(r.title)} | ${r.evidence.length} |`
  );
  return [
    `## ${title}`, "",
    "| Rule ID | Severity | Status | Title | Evidences |",
    "|---|---|---|---|---|",
    ...rows, ""
  ].join("\n");
}

export function toMarkdown(report: AnalyzeReport): string {
  const lines: string[] = [];
  lines.push(`# Code Audit Report`);
  lines.push(`Generated: ${report.meta.generated_at}`);
  lines.push(`Root: ${report.meta.root}`);
  lines.push(`Duration: ${report.meta.duration_ms} ms`);
  lines.push("");
  lines.push("## Summary");
  lines.push(
    `- Rules: ${report.summary.totals.rules}, Passed: ${report.summary.totals.passed}, Failed: ${report.summary.totals.failed}, Near-miss: ${report.summary.totals.near_miss}`
  ); lines.push("");
  for (const cat of report.summary.by_category) {
    const catResults = report.results.filter(r => r.category === cat.name);
    lines.push(section(catResults, cat.name));
  }
  lines.push("## Findings Detail"); lines.push("");
  for (const r of report.results) {
    if (r.passed && !r.near_miss) continue;
    lines.push(`### ${r.id} — ${r.title}`);
    lines.push(`- Category: ${r.category}`);
    lines.push(`- Severity: ${r.severity}`);
    lines.push(`- Status: ${r.passed ? "pass" : "fail"}`);
    if (r.near_miss) lines.push(`- Near-miss: true`);
    if (typeof r.confidence === "number") lines.push(`- Confidence: ${r.confidence.toFixed(2)}`);
    if (r.refs?.length) lines.push(`- Refs: ${r.refs.join(", ")}`);
    if (r.fix) { lines.push(""); lines.push("**Fix**"); lines.push(""); lines.push(r.fix); }
    if (r.evidence.length) {
      lines.push(""); lines.push("**Evidence**"); lines.push("");
      lines.push("| File | Line | Note |"); lines.push("|---|---:|---|");
      for (const e of r.evidence) lines.push(`| ${h(e.file)} | ${e.line ?? ""} | ${h(e.note)} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}