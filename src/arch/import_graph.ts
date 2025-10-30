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