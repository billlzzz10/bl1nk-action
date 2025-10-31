import { describe, it, expect } from "vitest";
import { ruleTsAsyncAwait } from "@/analyzers/ts/rules/async_await";
import { tmpProject, minimalTsconfig } from "@/test/helpers/fs";

describe("ts.async.await.preference", () => {
  it("flags .then chains", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `
        async function f(){ return 1; }
        f().then(v => v);
      `
    });
    const res = await ruleTsAsyncAwait({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(false);
    expect(res.evidence.some(e => /Promise.then detected/.test(e.note))).toBe(true);
  });

  it("passes with await", async () => {
    const root = await tmpProject({
      "tsconfig.json": minimalTsconfig,
      "src/a.ts": `
        async function f(){ return 1; }
        async function g(){ const v = await f(); return v; }
        export { g };
      `
    });
    const res = await ruleTsAsyncAwait({ rootDir: root, files: [], language: "ts", timeoutMs: 10000 });
    expect(res.passed).toBe(true);
  });
});
