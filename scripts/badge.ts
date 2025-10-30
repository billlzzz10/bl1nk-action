// scripts/badge.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";

type Grade = "A"|"B"|"C"|"D"|"E"|"F";

const COLOR: Record<Grade, string> = {
  A: "#b9f2ff", // Diamond-like
  B: "#e5e4e2", // Platinum
  C: "#ffd700", // Gold
  D: "#C0C0C0", // Silver
  E: "#b87333", // Copper
  F: "#71797E"  // Steel
};

function svg(label: string, message: string, color: string) {
  // badge แบบเรียบง่าย ขนาดคงที่
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="20" role="img" aria-label="${label}: ${message}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <mask id="m"><rect width="220" height="20" rx="3" fill="#fff"/></mask>
  <g mask="url(#m)">
    <rect width="120" height="20" fill="#555"/>
    <rect x="120" width="100" height="20" fill="${color}"/>
    <rect width="220" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva" font-size="11">
    <text x="60" y="14">${label}</text>
    <text x="170" y="14">${message}</text>
  </g>
</svg>`;
}

async function main() {
  const root = process.cwd();
  const gradePath = path.join(root, "grade.json");
  const raw = await fs.readFile(gradePath, "utf8");
  const { grade, score } = JSON.parse(raw) as { grade: Grade; score: number };
  const g = grade as Grade;
  const color = COLOR[g] ?? "#555";
  const badge1 = svg("code quality", `${score} 💯`, color);
  const badge2 = svg("audit grade", g, color);
  await fs.mkdir(path.join(root, "badges"), { recursive: true });
  await fs.writeFile(path.join(root, "badges", "quality.svg"), badge1, "utf8");
  await fs.writeFile(path.join(root, "badges", "grade.svg"), badge2, "utf8");
  console.log(`Generated badges for grade ${g} score ${score}`);
}
main().catch(e => { console.error(e); process.exit(2); });