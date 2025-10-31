import { Project, FunctionDeclaration, MethodDeclaration, ArrowFunction, Node, SyntaxKind } from "ts-morph";
import * as path from "node:path";
import * as crypto from "node:crypto";

/** สร้างแฮชจาก AST ปรับ normalize:
 *  - ลบชื่อฟังก์ชัน ตัวแปร พารามิเตอร์
 *  - ลบคอมเมนต์ เว้นวรรค
 *  - เก็บเฉพาะโครงสร้างและลำดับ token สำคัญ
 */
function normalizedHash(n: FunctionDeclaration | MethodDeclaration | ArrowFunction): string {
  const body = n.getBody();
  if (!body) return "";

  const text = body.getText();
  const noComments = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  const noIds = noComments
    .replace(/\b[A-Za-z_]\w*\b/g, (m) => {
      if (/^(if|else|for|while|switch|case|return|await|async|try|catch|finally|throw|new|in|of|typeof|instanceof|break|continue|yield|const|let|var|this|super)$/.test(m)) {
        return m;
      }
      return "_";
    })
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(noIds).digest("hex");
}

export interface DuplicateGroup {
  hash: string;
  files: Array<{ file: string; name: string; line: number }>;
}

/** หา duplicate เชิงโครงสร้าง: ฟังก์ชันที่ normalize แล้วได้แฮชเดียวกัน */
export function findExactDuplicateFunctions(root: string): DuplicateGroup[] {
  const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json") });
  const buckets = new Map<string, Array<{ file: string; name: string; line: number }>>();

  for (const sf of project.getSourceFiles()) {
    const funcs = [
      ...sf.getFunctions(),
      ...sf.getDescendantsOfKind(SyntaxKind.ArrowFunction),
      ...sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration)
    ];

    for (const fn of funcs) {
      const hash = normalizedHash(fn);
      const name = (fn as FunctionDeclaration | MethodDeclaration | ArrowFunction)?.getSymbol()?.getName() ?? "<anonymous>";
      const file = sf.getFilePath();
      const line = fn.getStartLineNumber();
      const arr = buckets.get(hash) ?? [];
      arr.push({ file, name, line });
      buckets.set(hash, arr);
    }
  }

  const groups: DuplicateGroup[] = [];
  for (const [hash, list] of buckets.entries()) {
    if (list.length > 1) groups.push({ hash, files: list });
  }
  return groups;
}

// helper: ts-morph constants without importing SyntaxKind explicitly
function arrowKind(): number { return 206; }   // SyntaxKind.ArrowFunction
function methodKind(): number { return 173; }  // SyntaxKind.MethodDeclaration