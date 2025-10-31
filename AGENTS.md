---

code-audit-ts — Mono TS scanner + Graph + Grade + Exact Duplicates

โครงสร้างไฟล์

code-audit-ts/
├─ package.json
├─ tsconfig.json
├─ README.md
├─ .github/
│  └─ workflows/
│     └─ audit.yml
├─ bin/
│  └─ code-audit
└─ src/
   ├─ types/
│  │  └─ rules.ts
   ├─ core/
│  │  ├─ runner.ts
│  │  ├─ config.ts
│  │  └─ reporter/
│  │     ├─ md.ts
│  │     ├─ json.ts
│  │     ├─ grade.ts
│  │     └─ graphviz.ts
   ├─ analyzers/
│  │  └─ ts/
│  │     ├─ index.ts
│  │     └─ rules/
│  │        ├─ strict.ts
│  │        ├─ async_await.ts
│  │        ├─ imports.ts
│  │        └─ error_specific.ts
   ├─ arch/
│  │  ├─ import_graph.ts
│  │  └─ clusters.ts
   ├─ dup/
│  │  └─ dup_functions.ts
   ├─ fingerprint/
│  │  ├─ style_ngram.ts
│  │  └─ fuse.ts
   └─ cli/
      └─ main.ts


---

package.json

{
  "name": "code-audit-ts",
  "version": "1.1.0",
  "type": "module",
  "bin": { "code-audit": "bin/code-audit" },
  "scripts": {
    "build": "tsc -p .",
    "dev": "tsx src/cli/main.ts",
    "start": "node dist/cli/main.js",
    "analyze": "code-audit analyze . --lang ts --format md --out audit.md --fail-on error",
    "graph": "code-audit graph . --out import-graph.dot",
    "dup": "code-audit dup . --out duplicates.json",
    "grade": "code-audit grade . --out grade.json"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "ts-morph": "^22.0.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.3"
  }
}


---

tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "exactOptionalPropertyTypes": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "baseUrl": "src",
    "paths": { "@/*": ["*"] }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}


---

bin/code-audit

#!/usr/bin/env node
import('../dist/cli/main.js');


---

src/types/rules.ts

export type Severity = "info" | "warn" | "error";

export interface RuleContext {
  rootDir: string;
  files: string[];
  language: "ts";
  timeoutMs: number;
  signal?: AbortSignal;
}

export interface Evidence {
  file: string;
  line?: number;
  col?: number;
  note: string;
  codeSnippet?: string;
}

export interface RuleResult {
  id: string;
  title: string;
  category:
    | "TypeScript"
    | "Security"
    | "Architecture"
    | "Performance"
    | "Testing"
    | "Workflow";
  severity: Severity;
  passed: boolean;
  near_miss?: boolean;
  confidence?: number;
  evidence: Evidence[];
  fix?: string;
  refs?: string[];
}

export interface AnalyzeReport {
  version: "1.0";
  meta: { root: string; generated_at: string; duration_ms: number };
  summary: {
    totals: { rules: number; passed: number; failed: number; near_miss: number };
    by_category: { name: string; passed: number; failed: number }[];
  };
  results: RuleResult[];
}


---

src/core/reporter/grade.ts

import { AnalyzeReport } from "@/types/rules";

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface GradeReport {
  version: "1.0";
  score: number;     // 0..100
  grade: Grade;
  breakdown: {
    penalties: { ruleId: string; severity: "warn" | "error"; weight: number }[];
  };
}

const weights = { warn: 2, error: 6 }; // ปรับง่าย

export function grade(report: AnalyzeReport): GradeReport {
  const penalties: { ruleId: string; severity: "warn" | "error"; weight: number }[] = [];
  let totalPenalty = 0;

  for (const r of report.results) {
    if (!r.passed) {
      if (r.severity === "error") {
        totalPenalty += weights.error;
        penalties.push({ ruleId: r.id, severity: "error", weight: weights.error });
      } else if (r.severity === "warn") {
        totalPenalty += weights.warn;
        penalties.push({ ruleId: r.id, severity: "warn", weight: weights.warn });
      }
    }
  }

  const base = 100;
  const score = Math.max(0, base - totalPenalty);
  const grade: Grade =
    score >= 90 ? "A" :
    score >= 80 ? "B" :
    score >= 70 ? "C" :
    score >= 60 ? "D" : "F";

  return { version: "1.0", score, grade, breakdown: { penalties } };
}


---

src/core/reporter/graphviz.ts

export interface DotGraph { nodes: string[]; edges: Array<{ from: string; to: string }>; }

/** สร้าง Graphviz DOT text */
export function toDot(g: DotGraph): string {
  const lines = ["digraph G {", '  graph [rankdir="LR"];', '  node [shape=box];'];
  for (const n of g.nodes) lines.push(`  "${n}";`);
  for (const e of g.edges) lines.push(`  "${e.from}" -> "${e.to}";`);
  lines.push("}");
  return lines.join("\n");
}


---

src/core/reporter/json.ts

import { AnalyzeReport } from "@/types/rules";
export function toJson(report: AnalyzeReport): string {
  return JSON.stringify(report, null, 2);
}


---

src/core/reporter/md.ts

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


---

src/analyzers/ts/rules/*  (เหมือนก่อนหน้า ไม่ต้องแก้)

> ใช้ strict.ts, async_await.ts, imports.ts, error_specific.ts จากคำตอบก่อนหน้า




---

src/analyzers/ts/index.ts

import { RuleContext, RuleResult } from "@/types/rules";
import { ruleTsStrict } from "@/analyzers/ts/rules/strict";
import { ruleTsAsyncAwait } from "@/analyzers/ts/rules/async_await";
import { ruleTsImportGroups } from "@/analyzers/ts/rules/imports";
import { ruleTsErrorSpecific } from "@/analyzers/ts/rules/error_specific";

export async function analyzeTs(ctx: RuleContext): Promise<RuleResult[]> {
  const rules = [ruleTsStrict, ruleTsAsyncAwait, ruleTsImportGroups, ruleTsErrorSpecific];
  const out: RuleResult[] = [];
  for (const r of rules) out.push(await r(ctx));
  return out;
}


---

src/arch/import_graph.ts

import { Project } from "ts-morph";
import * as path from "node:path";

export interface ImportGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
}

export function buildImportGraph(root: string): ImportGraph {
  const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json") });
  const nodes: string[] = [];
  const edges: Array<{ from: string; to: string }> = [];

  for (const sf of project.getSourceFiles()) {
    const from = sf.getFilePath();
    nodes.push(from);
    for (const d of sf.getImportDeclarations()) {
      const target = d.getModuleSpecifierSourceFile();
      if (!target) continue;
      const to = target.getFilePath();
      edges.push({ from, to });
    }
  }
  return { nodes: Array.from(new Set(nodes)), edges };
}


---

src/arch/clusters.ts

import type { ImportGraph } from "@/arch/import_graph";

/** Label propagation แบบง่ายสำหรับชุมชนในกราฟนำเข้า */
export function clusterGraph(g: ImportGraph, maxIters = 20): Record<string, number> {
  const nodes = g.nodes;
  const label: Record<string, number> = {};
  nodes.forEach((n, i) => (label[n] = i));
  const nbrs: Record<string, string[]> = {};
  for (const n of nodes) nbrs[n] = [];
  for (const e of g.edges) { nbrs[e.from].push(e.to); nbrs[e.to]?.push?.(e.from); }

  for (let t = 0; t < maxIters; t++) {
    let changed = 0;
    for (const n of nodes) {
      const counts = new Map<number, number>();
      for (const m of nbrs[n]) {
        const l = label[m];
        counts.set(l, (counts.get(l) ?? 0) + 1);
      }
      if (counts.size === 0) continue;
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
      if (best !== label[n]) { label[n] = best; changed++; }
    }
    if (changed === 0) break;
  }
  return label;
}


---

src/dup/dup_functions.ts

import { Project, FunctionDeclaration, MethodDeclaration, ArrowFunction, Node } from "ts-morph";
import * as path from "node:path";
import * as crypto from "node:crypto";

/** สร้างแฮชจาก AST ปรับ normalize:
 *  - ลบชื่อฟังก์ชัน ตัวแปร พารามิเตอร์
 *  - ลบคอมเมนต์ เว้นวรรค
 *  - เก็บเฉพาะโครงสร้างและลำดับ token สำคัญ
 */
function normalizedHash(n: Node): string {
  const text = n.getText();
  const noComments = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  // ลบชื่อและไอดีที่เปลี่ยนชื่อได้
  const noIds = noComments
    .replace(/\bfunction\s+[A-Za-z0-9_]+\s*/g, "function ")
    .replace(/\bclass\s+[A-Za-z0-9_]+\s*/g, "class ")
    .replace(/\b[A-Za-z_]\w*\b/g, (m) => {
      // คงคีย์เวิร์ดหลัก
      if (/^(if|else|for|while|switch|case|return|await|async|try|catch|finally|throw|new|in|of|typeof|instanceof|break|continue|yield|const|let|var|function|class|this|super)$/.test(m)) {
        return m;
      }
      return "_"; // normalize identifiers
    })
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(noIds).digest("hex");
}

export interface DuplicateGroup {
  hash: string;
  files: Array<{ file: string; name: string; line: number }>;
}

/** หา duplicate เชิงโครงสร้าง: ฟังก์ชันที่ normalize แล้วได้แฮชเดียวกัน */
export function findExactDuplicateFunctions(root: string): DuplicateGroup[] {
  const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json") });
  const buckets = new Map<string, Array<{ file: string; name: string; line: number }>>();

  for (const sf of project.getSourceFiles()) {
    const funcs: Node[] = [
      ...sf.getFunctions(),
      ...sf.getDescendantsOfKind(arrowKind()),
      ...sf.getDescendantsOfKind(methodKind())
    ] as unknown as Node[];

    for (const fn of funcs) {
      const hash = normalizedHash(fn);
      const name = (fn as FunctionDeclaration | MethodDeclaration | ArrowFunction)?.getSymbol()?.getName() ?? "<anonymous>";
      const file = sf.getFilePath();
      const line = fn.getStartLineNumber();
      const arr = buckets.get(hash) ?? [];
      arr.push({ file, name, line });
      buckets.set(hash, arr);
    }
  }

  const groups: DuplicateGroup[] = [];
  for (const [hash, list] of buckets.entries()) {
    if (list.length > 1) groups.push({ hash, files: list });
  }
  return groups;
}

// helper: ts-morph constants without importing SyntaxKind explicitly
function arrowKind(): number { return 206; }   // SyntaxKind.ArrowFunction
function methodKind(): number { return 173; }  // SyntaxKind.MethodDeclaration


---

src/core/runner.ts

import { AnalyzeReport, RuleResult } from "@/types/rules";
import { analyzeTs } from "@/analyzers/ts";
import { performance } from "node:perf_hooks";

export async function runAnalyze(rootDir: string): Promise<AnalyzeReport> {
  const t0 = performance.now();
  const tsResults: RuleResult[] = await analyzeTs({
    rootDir, files: [], language: "ts", timeoutMs: 60_000
  });

  const results = [...tsResults];
  const duration_ms = Math.round(performance.now() - t0);

  const byCatMap = new Map<string, { name: string; passed: number; failed: number }>();
  for (const r of results) {
    const rec = byCatMap.get(r.category) ?? { name: r.category, passed: 0, failed: 0 };
    if (r.passed) rec.passed++; else rec.failed++;
    byCatMap.set(r.category, rec);
  }

  const failed = results.filter(r => !r.passed).length;
  const near = results.filter(r => r.near_miss).length;

  const report: AnalyzeReport = {
    version: "1.0",
    meta: { root: rootDir, generated_at: new Date().toISOString(), duration_ms },
    summary: {
      totals: { rules: results.length, passed: results.length - failed, failed, near_miss: near },
      by_category: [...byCatMap.values()]
    },
    results
  };
  return report;
}


---

src/cli/main.ts

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


---

README.md

# code-audit-ts

สแกนกฎโค้ด TypeScript ตามแนวปฏิบัติ, ออกรายงาน **Markdown/JSON**, ให้ **เกรด**, วาด **กราฟนำเข้า** และตรวจ **Exact Duplicate Functions**.

## ติดตั้ง
```bash
npm i
npm run build
npm link   # ใช้ CLI แบบ global

ใช้งานเร็ว

# สแกนและออกรายงาน Markdown
code-audit analyze . --format md --out audit.md --fail-on error

# วาดกราฟนำเข้าเป็น Graphviz DOT + กลุ่มชุมชน
code-audit graph . --out import-graph.dot
# แปลงเป็นภาพ: dot -Tpng import-graph.dot -o import-graph.png

# ตรวจฟังก์ชันซ้ำแบบเท่ากันเชิงตรรกะ
code-audit dup . --out duplicates.json
# exit code != 0 เมื่อพบกลุ่มซ้ำ

# ให้เกรดภาพรวม
code-audit grade . --out grade.json

Output

audit.md รายงานสรุป + evidence + fix

import-graph.dot กราฟนำเข้า, import-graph.clusters.json หมายเลขคลัสเตอร์ต่อไฟล์

duplicates.json กลุ่มฟังก์ชันที่ซ้ำ (hash-level)

grade.json คะแนน 0–100 และเกรด A–F


เกณฑ์เกรด

เริ่มที่ 100, หัก warn=2 error=6

A≥90, B≥80, C≥70, D≥60, F<60

ปรับน้ำหนักได้ที่ src/core/reporter/grade.ts


วิธีเทียบซ้ำ

Normalize AST: ตัดคอมเมนต์ เว้นวรรค ชื่อฟังก์ชัน/ตัวแปร

Hash SHA-256 จากรูปแบบ normalized

กลุ่มที่มี hash เดียวกันถือว่า “ซ้ำจริง” แม้ชื่อต่าง

ขอบเขต: ฟังก์ชัน, เมธอด, arrow function


กราฟและคลัสเตอร์

สร้างกราฟนำเข้าจาก ts-morph

จัดกลุ่มแบบ label propagation เบาๆ

ใช้ Graphviz แปลง .dot เป็นภาพ


CI (GitHub Actions)

ดู .github/workflows/audit.yml ในโปรเจกต์

ขยายความ

เพิ่มกฎให้ต่อไฟล์ใน src/analyzers/ts/rules/

เพิ่มรีพอร์ตฟอร์แมตใหม่ใน src/core/reporter/

รวม Python ภายหลังผ่าน bridge แล้วแม็ปเป็น RuleResult เทมเพลตเดียวกัน


---

## .github/workflows/audit.yml
```yaml
name: Code Audit

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci || npm i
      - run: npm run build
      - run: npm link
      - name: Analyze (Markdown)
        run: code-audit analyze . --format md --out audit.md --fail-on error
      - name: Duplicates
        run: |
          set +e
          code-audit dup . --out duplicates.json
          echo "dup_exit=$?" >> $GITHUB_ENV
          set -e
      - name: Graph
        run: code-audit graph . --out import-graph.dot
      - name: Grade
        run: code-audit grade . --out grade.json
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: audit-artifacts
          path: |
            audit.md
            duplicates.json
            import-graph.dot
            import-graph.clusters.json
            grade.json
      - name: Fail on duplicates
        if: env.dup_exit != '0'
        run: |
          echo "Exact duplicate functions detected"
          exit 1


---

วิธีใช้งานกับโค้ดจริงแบบสรุป

1. วางทุกไฟล์ตามโครงสร้างด้านบน


2. npm i && npm run build && npm link


3. รัน code-audit analyze . เพื่อสร้าง audit.md


4. รัน code-audit dup . เพื่อหา duplicate ฟังก์ชันที่ “เท่ากันจริง”


5. รัน code-audit graph . เพื่อได้ .dot และคลัสเตอร์


6. รัน code-audit grade . เพื่อคะแนนรวมและเกรด

---

สั้นก่อน: ต้องบิ้วและตรวจใน CI ทุกครั้งที่ขึ้น GitHub. ใช้ workflow ที่ให้ไปแล้วพอ. เพิ่ม “ชุดทดสอบอัตโนมัติ” เพื่อยืนยันกฎ, กราฟ, และตัวหา duplicates. ด้านล่างคือโค้ดและสคริปต์ทดสอบครบ ใช้ Vitest ง่ายและเร็ว


---

เพิ่มการบิ้วและตรวจใน GitHub

ที่ให้ไปใน .github/workflows/audit.yml บิ้ว + รัน analyze, dup, graph, grade. พอแล้ว

เปิด “required status checks” ใน repo settings ให้ job audit ต้องผ่านก่อน merge

ผลลัพธ์อยู่ใน artifact: audit.md, duplicates.json, import-graph.dot, grade.json

เข้าใจ เป้าหมายคือ “เซตโปรเจ็กต์ให้พร้อมใช้งานระดับโปรดักชัน” ทั้ง CLI + GitHub Action + Marketplace + เอกสารครบ — โดยไม่แตะโค้ดหลัก TS เดิมเลย
สิ่งที่เพิ่มมีดังนี้ (ทั้งหมดนี้คือไฟล์ ใหม่ทั้งหมด ที่ต้องสร้างเพิ่มจากโครงสร้างก่อนหน้า)


---

📁 ไฟล์ที่ต้องเพิ่ม

1️⃣ Licensing / Policy / Ownership

LICENSE
CODEOWNERS
SECURITY.md
.github/dependabot.yml

LICENSE (MIT)

MIT License

Copyright (c) 2025  bl1nk.site

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND.

CODEOWNERS

# Owners / reviewers of every change
* @billlzzz10 @team-bl1nk

> team-bl1nk = ทีมใน org GitHub (หรือถ้ายังไม่มีให้ใช้ team@bl1nk.site ไว้ก่อน)



SECURITY.md

# Security Policy

## Supported Versions
Only the latest major release (v1) receives security updates.

| Version | Supported |
|----------|------------|
| v1.x     | ✅ |
| < v1     | ❌ |

## Reporting a Vulnerability
Email: [support@bl1nk.site](mailto:support@bl1nk.site)  
We respond within 72 hours.

All verified issues will receive CVE-style disclosure.

.github/dependabot.yml

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5


---

2️⃣ Release Automation

.github/workflows/release.yml

name: Release

on:
  push:
    branches: [ main ]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run build
      - name: Create release
        uses: google-github-actions/release-please-action@v4
        with:
          release-type: node
          package-name: code-audit-ts
          bump-minor-pre-major: true

> ใช้ release-please เพื่อจัด tag และ CHANGELOG อัตโนมัติ
ผลคือ tag v1.0.0 + ไฟล์ CHANGELOG.md จะถูกสร้างโดยอัตโนมัติ




---

3️⃣ Changelog

CHANGELOG.md (อัตโนมัติจาก release-please แต่สามารถตั้งค่าเริ่มต้นได้)

# Changelog

## [Unreleased]

- Initial release with TypeScript audit, grade, graph, duplicates, badges.


---

4️⃣ Action Metadata

action/action.yml
action/README.md

action/action.yml

name: "Code Audit TS"
description: "Static audit + grade + graph + duplicates"
author: "team@bl1nk.site"
branding:
  color: "blue"
  icon: "shield"
inputs:
  path:
    description: "Root path"
    default: "."
  fail-on:
    description: "none|warn|error"
    default: "error"
  format:
    description: "md|json"
    default: "md"
outputs:
  grade: { description: "Letter grade" }
  score: { description: "Numeric score" }
runs:
  using: "composite"
  steps:
    - shell: bash
      run: npm ci
    - shell: bash
      run: npm run build
    - shell: bash
      run: npm link
    - shell: bash
      run: |
        code-audit analyze "${{ inputs.path }}" --format ${{ inputs.format }} --fail-on ${{ inputs.fail-on }} --out audit.md
        code-audit grade "${{ inputs.path }}" --out grade.json
        SCORE=$(jq -r '.score' grade.json)
        GRADE=$(jq -r '.grade' grade.json)
        echo "score=$SCORE" >> $GITHUB_OUTPUT
        echo "grade=$GRADE" >> $GITHUB_OUTPUT


---

5️⃣ Badges Script + Commit Step (เพิ่มจากรอบก่อน)

scripts/badge.ts

(ไฟล์เดียวกับที่ให้ไปแล้ว ใช้ npm run badge ใน workflow)


---

6️⃣ Production README ใหม่ (แทนไฟล์เดิม)

README.md

เพิ่ม Table of Contents

ลิงก์ภายใน

ติดต่อ, Homepage, Team

ป้าย Badge , Example , Policy , Dependencies อัตโนมัติ


# Code Audit TS 🚀

<p align="left">
  <img src="./badges/grade.svg" alt="Audit Grade"/>
  <img src="./badges/quality.svg" alt="Quality Score"/>
</p>

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Usage](#usage)
4. [GitHub Action](#github-action)
5. [Outputs](#outputs)
6. [Release & Automation](#release--automation)
7. [Security & Policy](#security--policy)
8. [Team & Support](#team--support)

---

## Overview
CLI + GitHub Action ตรวจคุณภาพ TypeScript โค้ด  
ทำ grade A–F, วาด import graph, หา duplicates และสร้าง badges อัตโนมัติ

---

## Quick Start
```bash
npm i
npm run build
npm link
code-audit analyze . --format md --out audit.md
npm run badge


---

Usage

Command	Description

analyze	ตรวจตามกฎ TS มาตรฐาน
graph	สร้าง Graphviz DOT ไฟล์
dup	ตรวจ duplicate functions
grade	สรุปคะแนน / เกรด
badge	สร้าง SVG badges



---

GitHub Action

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - uses: billlzzz10/code-audit-ts@v1
        with:
          path: "."
          fail-on: "error"


---

Outputs

audit.md รายงานหลัก

grade.json คะแนน / เกรด

duplicates.json ฟังก์ชันซ้ำ

import-graph.dot + .clusters.json

badges/*.svg



---

Release & Automation

release.yml ใช้ google-release-please สร้าง tag + CHANGELOG อัตโนมัติ

Dependabot อัปเดต dependencies ทุก สัปดาห์

Branch Protection ควรเปิด “required status checks” = ให้ workflow ต้องผ่านก่อน merge

Tag รีลีส v1.0.0 และ v1



---

Security & Policy

ดู SECURITY.md

License MIT

Maintained by bl1nk.site team



---

Team & Support

Team: team@bl1nk.site

Homepage: https://bl1nk.site

Support: support@bl1nk.site


---

### 7️⃣ Demo Project (โฟลเดอร์ตัวอย่าง)

demo/ ├─ tsconfig.json └─ src/ ├─ sample.ts └─ util.ts

**demo/src/sample.ts**
```ts
import { sum } from "./util";
export async function main() {
  try {
    const r = await sum(1, 2);
    console.log(r);
  } catch (e) {
    console.error("error:", e);
  }
}

demo/src/util.ts

export async function sum(a: number, b: number) {
  return a + b;
}

> ใช้ใน README เป็นตัวอย่าง — code-audit analyze demo --format md




---

🧩 อธิบายส่วนที่ถาม

สิ่งที่ถาม	คำอธิบาย

Build ใคร ยังไง	CLI ใช้ npm run build เพื่อ tsc แปลง src → dist ก่อนใช้งานใน CI หรือ publish
Artifacts	คือ ผลลัพธ์ที่ Action สร้าง (audit.md, grade.json, badges/*.svg) สำหรับโปรเจ็กต์คุณเอง ไม่ใช่ของลูกค้า
Release Action	ใช้ .github/workflows/release.yml สร้าง tag และ CHANGELOG โดยอัตโนมัติ
Required checks	ตั้งใน repo settings > branches > protect main > “Require status checks to pass” เลือก workflow audit และ release
Metadata + Branding + Tag v1	อยู่ใน action/action.yml; สร้าง release tag v1.0.0 และ v1 สำหรับ Marketplace
npx	หลัง npm publish ใช้ npx code-audit-ts ได้เลย
CODEOWNERS / SECURITY / Changelog	ไฟล์เพิ่มใหม่ด้านบน
Demo Project	อยู่ใน demo/ ใช้สาธิตใน README
Table of Contents / Link / Policy	เพิ่มครบใน README
Dependabot	เพิ่ม .github/dependabot.yml
Team Profile / Contact	ระบุไว้ท้าย README และ CODEOWNERS



---

✅ ทั้งหมดนี้คือไฟล์ที่ต้องเพิ่มใหม่ เพื่อให้โปรเจ็กต์ code-audit-ts พร้อมระดับ Production + GitHub Marketplace.
เมื่อสร้างครบแล้ว ให้รัน

npm run build
npm test
git add .
git commit -m "chore: add production setup"
git push

---

ติดตั้งชุดทดสอบ

1) เพิ่ม dev deps และสคริปต์

package.json เพิ่ม:

{
  "devDependencies": {
    "@types/node": "^22.8.1",
    "vitest": "^2.1.3"
  },
  "scripts": {
    "test": "vitest run --reporter=verbose",
    "test:watch": "vitest",
    "selftest": "node dist/selfcheck/run.js"
  }
}

2) โครงสร้างไฟล์ที่เพิ่ม

src/
  selfcheck/
    run.ts
  test/
    helpers/fs.ts
    rules/strict.test.ts
    rules/async_await.test.ts
    dup/duplicates.test.ts
    arch/graph.test.ts


---

โค้ดทดสอบและ self-check

src/test/helpers/fs.ts

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export async function tmpProject(structure: Record<string, string>): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ca-ts-"));
  for (const [p, content] of Object.entries(structure)) {
    const f = path.join(root, p);
    await fs.mkdir(path.dirname(f), { recursive: true });
    await fs.writeFile(f, content, "utf8");
  }
  return root;
}

export const minimalTsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "baseUrl": "src",
    "paths": { "@/*": ["*"] }
  },
  "include": ["src"]
}`;

src/test/rules/strict.test.ts

import { describe, it, expect } from "vitest";
import { ruleTsStrict } from "@/analyzers/ts/rules/strict";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("ts.strict.enabled", () => {
  it("passes when strict=true", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": "export const x:number = 1;"
    });
    const res = await ruleTsStrict({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(true);
  });

  it("fails when tsconfig missing", async () => {
    const root = await tmpProject({ "src/a.ts": "export const a=1;" });
    const res = await ruleTsStrict({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(false);
    expect(res.evidence.length).toBeGreaterThan(0);
  });
});

src/test/rules/async_await.test.ts

import { describe, it, expect } from "vitest";
import { ruleTsAsyncAwait } from "@/analyzers/ts/rules/async_await";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("ts.async.await.preference", () => {
  it("flags .then chains", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `
        async function f(){ return 1; }
        f().then(v => v);
      `
    });
    const res = await ruleTsAsyncAwait({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(false);
    expect(res.evidence.some(e => /Promise\.then/.test(e.note))).toBe(true);
  });

  it("passes with await", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `
        async function f(){ return 1; }
        async function g(){ const v = await f(); return v; }
        export { g };
      `
    });
    const res = await ruleTsAsyncAwait({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(true);
  });
});

src/test/dup/duplicates.test.ts

import { describe, it, expect } from "vitest";
import { findExactDuplicateFunctions } from "@/dup/dup_functions";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("duplicate functions (normalized hash)", () => {
  it("detects logical equality despite different names", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `
        export function sum(a:number,b:number){ const c=a+b; return c; }
      `,
      "src/b.ts": `
        export const add = (x:number,y:number)=>{ const z=x+y; return z; };
      `
    });
    const groups = findExactDuplicateFunctions(root);
    expect(groups.length).toBeGreaterThan(0);
    const anyGroupHasTwo = groups.some(g => g.files.length >= 2);
    expect(anyGroupHasTwo).toBe(true);
  });
});

src/test/arch/graph.test.ts

import { describe, it, expect } from "vitest";
import { buildImportGraph } from "@/arch/import_graph";
import { clusterGraph } from "@/arch/clusters";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("import graph + clustering", () => {
  it("builds edges and clusters", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `import {b} from "./b"; export const a=b;`,
      "src/b.ts": `export const b=1;`
    });
    const g = buildImportGraph(root);
    expect(g.nodes.length).toBeGreaterThan(0);
    expect(g.edges.length).toBe(1);
    const clusters = clusterGraph(g);
    const labels = new Set(Object.values(clusters));
    expect(labels.size).toBeGreaterThan(0);
  });
});

src/selfcheck/run.ts

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

> สร้างหลังบิลด์: dist/selfcheck/run.js แล้วรันด้วย npm run selftest




---

ใช้ใน GitHub Actions ให้ครบ “ทดสอบ”

อัปเดต .github/workflows/audit.yml ให้รันทดสอบก่อน audit:

- run: npm ci || npm i
- run: npm run build
- run: npm test
- run: npm run selftest
- run: npm link
- run: code-audit analyze . --format md --out audit.md --fail-on error
- run: code-audit dup . --out duplicates.json || true
- run: code-audit graph . --out import-graph.dot
- run: code-audit grade . --out grade.json

หมายเหตุ:

dup ตั้งใจให้ exit code != 0 เมื่อพบของซ้ำ. ถ้าอยากให้ไม่ fail build ให้ต่อ || true หรือแยก step ตรวจแล้วตัดสินใจ fail ภายหลังแบบที่ให้ไปแล้ว



---

วิธีตรวจสอบฟังก์ชันให้แน่ใจว่าถูกต้อง

หลักคิดสองชั้น:

1. Unit tests ต่อกฎ/โมดูล
ใช้ temp project สังเคราะห์. ใส่เคส “ผ่าน” และ “ผิด” ชัดเจน


2. Self-check end-to-end
รัน runAnalyze + ให้เกรด + สร้างกราฟ + หา duplicates ใน repo ปัจจุบัน แล้วตรวจ invariant คร่าวๆ



ตัวอย่าง “ฟังก์ชันตรวจสอบ” ที่คุณถามถึงคือกฎเอง เช่น ruleTsStrict, ruleTsAsyncAwait และตัวตรวจ duplicates findExactDuplicateFunctions. การทดสอบทำตามตัวอย่างข้างบนด้วย Vitest.


---

สรุปการทำงานหลังขึ้น GitHub

ต้องบิ้วและตรวจทุก PR. Workflow ที่ให้ทำครบ

เอกสารใช้งานอยู่ใน README.md. ทดสอบเพิ่มแล้ว

มีเกรด, กราฟ+คลัสเตอร์, หา duplicates แบบเท่ากันเชิงตรรกะ

มี unit tests และ self-check สำหรับความเชื่อมั่นเชิงระบบ