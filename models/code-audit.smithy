namespace com.example.codeaudit

use smithy.api#documentation

/// This service provides tools for auditing TypeScript codebases.
@documentation("Provides a suite of tools for static analysis of TypeScript projects.")
service CodeAuditTs {
    version: "1.1.0",
    operations: [Analyze, Grade, Dup, Graph]
}

// --- Analyze Operation ---
@documentation("Analyzes the TypeScript codebase against a set of predefined rules.")
operation Analyze {
    input: AnalyzeInput,
    output: AnalyzeOutput
}

structure AnalyzeInput {
    @documentation("The root directory of the project to analyze.")
    @documentation("The root directory of the project to analyze.")
    @required
    root: String,

    @documentation("The output format for the report.")
    format: ReportFormat = "md",

    @documentation("The path to the output file.")
    out: String,

    @documentation("The severity level that will cause a non-zero exit code.")
    failOn: Severity = "error",
}

structure AnalyzeOutput {
    @documentation("The path to the generated analysis report.")
    reportFile: String
}

enum ReportFormat {
    MD = "md",
    JSON = "json"
}

enum Severity {
    NONE = "none",
    WARN = "warn",
    ERROR = "error"
}

// --- Grade Operation ---
@documentation("Calculates a letter grade (A-F) for the project.")
operation Grade {
    input: GradeInput,
    output: GradeOutput
}

structure GradeInput {
    @documentation("The root directory of the project to analyze.")
    root: String,

    @documentation("The path to the output file.")
    out: String,
}

structure GradeOutput {
    @documentation("The path to the generated grade JSON file.")
    gradeFile: String
}

// --- Dup Operation ---
@documentation("Finds logically duplicate functions within the codebase.")
operation Dup {
    input: DupInput,
    output: DupOutput
}

structure DupInput {
    @documentation("The root directory of the project to analyze.")
    root: String,

    @documentation("The path to the output file.")
    out: String,
}

structure DupOutput {
    @documentation("The path to the generated duplicates JSON file.")
    duplicatesFile: String
}

// --- Graph Operation ---
@documentation("Generates an import graph of the project.")
operation Graph {
    input: GraphInput,
    output: GraphOutput
}

structure GraphInput {
    @documentation("The root directory of the project to analyze.")
    root: String,

    @documentation("The path to the output file.")
    out: String,
}

structure GraphOutput {
    @documentation("The path to the generated Graphviz DOT file.")
    graphFile: String
}
