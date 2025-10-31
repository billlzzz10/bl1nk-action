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
