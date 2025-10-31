import { describe, it, expect } from "vitest";
import { ruleTsStrict } from "@/analyzers/ts/rules/strict";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("ts.strict.enabled", () => {
  it("passes when strict=true", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": "export const x:number = 1;"
    });
    const res = await ruleTsStrict({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(true);
  });

  it("fails when tsconfig missing", async () => {
    const root = await tmpProject({ "src/a.ts": "export const a=1;" });
    const res = await ruleTsStrict({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(false);
    expect(res.evidence.length).toBeGreaterThan(0);
  });
});
