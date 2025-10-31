import { RuleContext, RuleResult } from "@/types/rules";
import { ruleTsStrict } from "./rules/strict";
import { ruleTsAsyncAwait } from "./rules/async_await";
import { ruleTsImportGroups } from "./rules/imports";
import { ruleTsErrorSpecific } from "./rules/error_specific";

export async function analyzeTs(ctx: RuleContext): Promise<RuleResult[]> {
  const rules = [
    ruleTsStrict,
    ruleTsAsyncAwait,
    ruleTsImportGroups,
    ruleTsErrorSpecific,
  ];
  const results = await Promise.all(rules.map((rule) => rule(ctx)));
  return results;
}
