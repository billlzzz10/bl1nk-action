import { RuleContext, RuleResult, Evidence } from "@/types/rules";
import { Project, Node, CatchClause } from "ts-morph";
import * as path from "node:path";

export async function ruleTsErrorSpecific(ctx: RuleContext): Promise<RuleResult> {
  const project = new Project({
    tsConfigFilePath: path.join(ctx.rootDir, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false
  });
  const evidence: Evidence[] = [];
  for (const sf of project.getSourceFiles()) {
    const catches = sf.getDescendants().filter(Node.isCatchClause);
    for (const c of catches) {
      const varName = c.getVariableDeclaration()?.getName() ?? "e";
      const body = c.getBlock().getText();
      const hasTypeGuard =
        new RegExp(`(instanceof|in)\\s+`).test(body) ||
        new RegExp(`${varName}\\.name|${varName}\\.code`).test(body);
      const hasLogContext = /logger\.(error|warn)\(/.test(body);
      if (!hasTypeGuard || !hasLogContext) {
        evidence.push({
          file: sf.getFilePath(),
          line: c.getStartLineNumber(),
          note: "catch without narrowing or structured logging"
        });
      }
    }
  }
  const passed = evidence.length === 0;
  return {
    id: "ts.error.specific",
    title: "Specific error handling with context",
    category: "TypeScript",
    severity: passed ? "info" : "warn",
    passed,
    evidence,
    fix: "Narrow error type with guards and log with context fields"
  };
}