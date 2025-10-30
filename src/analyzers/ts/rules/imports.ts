import { RuleContext, RuleResult, Evidence } from "@/types/rules";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function ruleTsImportGroups(ctx: RuleContext): Promise<RuleResult> {
  const evidence: Evidence[] = [];
  const src = path.join(ctx.rootDir, "src");
  // heuristic: ต้องมี absolute import เริ่มด้วย "@/"; แจ้งเตือนถ้าไฟล์ไม่มีเลย
  async function checkFile(p: string) {
    const text = await fs.readFile(p, "utf8");
    const lines = text.split("\n");
    const hasAbs = lines.some(l => /^import .+ from ["']@\/.+["']/.test(l));
    if (!hasAbs && /import .+ from ["']\.\.?\//.test(text)) {
      evidence.push({ file: p, note: "use absolute imports with @/ path mapping" });
    }
  }
  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (p.endsWith(".ts") || p.endsWith(".tsx")) await checkFile(p);
    }
  }
  try {
    await walk(src);
  } catch {
    // ignore if no src folder
  }
  const passed = evidence.length === 0;
  return {
    id: "ts.import.groups",
    title: "Absolute imports and grouped imports",
    category: "TypeScript",
    severity: passed ? "info" : "warn",
    passed,
    evidence,
    fix: "Configure tsconfig paths to @/* and group imports by source"
  };
}