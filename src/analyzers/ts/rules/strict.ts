import { RuleContext, RuleResult, Evidence } from "@/types/rules";
import { Project } from "ts-morph";
import * as path from "node:path";

export async function ruleTsStrict(ctx: RuleContext): Promise<RuleResult> {
  const tsconfigPath = path.join(ctx.rootDir, "tsconfig.json");
  const evidence: Evidence[] = [];
  let passed = false;

  try {
    const project = new Project({
      tsConfigFilePath: tsconfigPath,
      skipAddingFilesFromTsConfig: true,
    });
    const config = project.getCompilerOptions();
    passed = config.strict === true;
    if (!passed) {
      evidence.push({
        file: "tsconfig.json",
        note: `"compilerOptions.strict" is not set to true.`,
      });
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      evidence.push({
        file: "tsconfig.json",
        note: "tsconfig.json is missing.",
      });
    } else {
      evidence.push({
        file: "tsconfig.json",
        note: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
    passed = false;
  }

  return {
    id: "ts.strict.enabled",
    title: "TS strict mode enabled",
    category: "TypeScript",
    severity: passed ? "info" : "error",
    passed,
    evidence,
    fix: `Set "compilerOptions.strict": true in tsconfig.json`,
  };
}
