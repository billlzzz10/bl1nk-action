import { RuleContext, RuleResult } from "@/types/rules";
import { ruleTsStrict } from "@/analyzers/ts/rules/strict";
import { ruleTsAsyncAwait } from "@/analyzers/ts/rules/async_await";
import { ruleTsImportGroups } from "@/analyzers/ts/rules/imports";
import { ruleTsErrorSpecific } from "@/analyzers/ts/rules/error_specific";

export async function analyzeTs(ctx: RuleContext): Promise<RuleResult[]> {
  const rules = [ruleTsStrict, ruleTsAsyncAwait, ruleTsImportGroups, ruleTsErrorSpecific];
  const out: RuleResult[] = [];
  for (const r of rules) out.push(await r(ctx));
  return out;
}