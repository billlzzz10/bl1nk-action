import { RuleContext, RuleResult, Evidence } from "@/types/rules";
import { Project, SyntaxKind } from "ts-morph";
import * as path from "node:path";

export async function ruleTsImportGroups(ctx: RuleContext): Promise<RuleResult> {
  const project = new Project({
    tsConfigFilePath: path.join(ctx.rootDir, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  const evidence: Evidence[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    // We only care about files in the src directory for this rule
    if (!sourceFile.getFilePath().startsWith(path.join(ctx.rootDir, "src"))) {
      continue;
    }

    const importDeclarations = sourceFile.getImportDeclarations();
    let hasRelativeImport = false;
    let hasAbsoluteImport = false;

    for (const importDeclaration of importDeclarations) {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith("@/")) {
        hasAbsoluteImport = true;
      } else if (moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../")) {
        hasRelativeImport = true;
      }
    }

    if (hasRelativeImport && !hasAbsoluteImport) {
      const line = importDeclarations[0]?.getStartLineNumber();
      const evidenceEntry: Evidence = {
        file: sourceFile.getFilePath(),
        note: "File contains relative imports but no absolute imports using '@/'. Prefer absolute imports for better readability and maintenance.",
      };
      if (line) {
        evidenceEntry.line = line;
      }
      evidence.push(evidenceEntry);
    }
  }

  const passed = evidence.length === 0;
  return {
    id: "ts.import.groups",
    title: "Absolute imports and grouped imports",
    category: "TypeScript",
    severity: passed ? "info" : "warn",
    passed,
    evidence,
    fix: "Configure tsconfig paths to @/* and use absolute imports for modules inside the src directory."
  };
}
