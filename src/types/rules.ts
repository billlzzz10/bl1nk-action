export type Severity = "info" | "warn" | "error";

export interface RuleContext {
  rootDir: string;
  files: string[];
  language: "ts";
  timeoutMs: number;
  signal?: AbortSignal;
}

export interface Evidence {
  file: string;
  line?: number;
  col?: number;
  note: string;
  codeSnippet?: string;
}

export interface RuleResult {
  id: string;
  title: string;
  category:
    | "TypeScript"
    | "Security"
    | "Architecture"
    | "Performance"
    | "Testing"
    | "Workflow";
  severity: Severity;
  passed: boolean;
  near_miss?: boolean;
  confidence?: number;
  evidence: Evidence[];
  fix?: string;
  refs?: string[];
}

export interface AnalyzeReport {
  version: "1.0";
  meta: { root: string; generated_at: string; duration_ms: number };
  summary: {
    totals: { rules: number; passed: number; failed: number; near_miss: number };
    by_category: { name: string; passed: number; failed: number }[];
  };
  results: RuleResult[];
}