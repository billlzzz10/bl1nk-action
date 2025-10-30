import { RuleContext, RuleResult } from "@/types/rules";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function ruleTsStrict(ctx: RuleContext): Promise<RuleResult> {
  const tsconfig = path.join(ctx.rootDir, "tsconfig.json");
  let passed = false;
  const evidence = [];
  try {
    const raw = await fs.readFile(tsconfig, "utf8");
    const json = JSON.parse(raw);
    const strict = json.compilerOptions?.strict === true;
    passed = strict;
    if (!strict) {
      evidence.push({ file: tsconfig, note: `"compilerOptions.strict" must be true` });
    }
  } catch {
    evidence.push({ file: tsconfig, note: "tsconfig.json missing or invalid" });
  }
  return {
    id: "ts.strict.enabled",
    title: "TS strict mode enabled",
    category: "TypeScript",
    severity: passed ? "info" : "error",
    passed,
    evidence,
    fix: `Set "compilerOptions.strict": true in tsconfig.json`,
    refs: ["TypeScript Handbook: Strict Options"]
  };
}