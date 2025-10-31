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
