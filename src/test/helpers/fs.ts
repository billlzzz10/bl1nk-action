import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export async function tmpProject(structure: Record<string, string>): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ca-ts-"));
  for (const [p, content] of Object.entries(structure)) {
    const f = path.join(root, p);
    await fs.mkdir(path.dirname(f), { recursive: true });
    await fs.writeFile(f, content, "utf8");
  }
  return root;
}

export const minimalTsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "baseUrl": "src",
    "paths": { "@/*": ["*"] }
  },
  "include": ["src"]
}`;
