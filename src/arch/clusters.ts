import type { ImportGraph } from "@/arch/import_graph";

/** Label propagation แบบง่ายสำหรับชุมชนในกราฟนำเข้า */
export function clusterGraph(g: ImportGraph, maxIters = 20): Record<string, number> {
  const nodes = g.nodes;
  const label: Record<string, number> = {};
  nodes.forEach((n, i) => (label[n] = i));
  const nbrs: Record<string, string[]> = {};
  for (const n of nodes) nbrs[n] = [];
  // for (const e of g.edges) {
  //   if (nbrs[e.from] && nbrs[e.to]) {
  //     nbrs[e.from].push(e.to);
  //     nbrs[e.to].push(e.from);
  //   }
  // }

  for (let t = 0; t < maxIters; t++) {
    let changed = 0;
    for (const n of nodes) {
      const neighbors = nbrs[n];
      if (!neighbors) {
        continue;
      }
      const counts = new Map<number, number>();
      for (const m of neighbors) {
        const l = label[m];
        if (l !== undefined) {
          counts.set(l, (counts.get(l) ?? 0) + 1);
        }
      }
      if (counts.size === 0) {
        continue;
      }

      const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const bestEntry = sortedCounts[0];
      if (bestEntry) {
        const best = bestEntry[0];
        if (best !== label[n]) {
          label[n] = best;
          changed++;
        }
      }
    }
    if (changed === 0) {
      break;
    }
  }
  return label;
}