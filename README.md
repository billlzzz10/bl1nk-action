# code-audit-ts

สแกนกฎโค้ด TypeScript ตามแนวปฏิบัติ, ออกรายงาน **Markdown/JSON**, ให้ **เกรด**, วาด **กราฟนำเข้า** และตรวจ **Exact Duplicate Functions**.

## ติดตั้ง
```bash
npm i
npm run build
npm link   # ใช้ CLI แบบ global

ใช้งานเร็ว

# สแกนและออกรายงาน Markdown
code-audit analyze . --format md --out audit.md --fail-on error

# วาดกราฟนำเข้าเป็น Graphviz DOT + กลุ่มชุมชน
code-audit graph . --out import-graph.dot
# แปลงเป็นภาพ: dot -Tpng import-graph.dot -o import-graph.png

# ตรวจฟังก์ชันซ้ำแบบเท่ากันเชิงตรรกะ
code-audit dup . --out duplicates.json
# exit code != 0 เมื่อพบกลุ่มซ้ำ

# ให้เกรดภาพรวม
code-audit grade . --out grade.json

Output

audit.md รายงานสรุป + evidence + fix

import-graph.dot กราฟนำเข้า, import-graph.clusters.json หมายเลขคลัสเตอร์ต่อไฟล์

duplicates.json กลุ่มฟังก์ชันที่ซ้ำ (hash-level)

grade.json คะแนน 0–100 และเกรด A–F


เกณฑ์เกรด

เริ่มที่ 100, หัก warn=2 error=6

A≥90, B≥80, C≥70, D≥60, F<60

ปรับน้ำหนักได้ที่ src/core/reporter/grade.ts


วิธีเทียบซ้ำ

Normalize AST: ตัดคอมเมนต์ เว้นวรรค ชื่อฟังก์ชัน/ตัวแปร

Hash SHA-256 จากรูปแบบ normalized

กลุ่มที่มี hash เดียวกันถือว่า “ซ้ำจริง” แม้ชื่อต่าง

ขอบเขต: ฟังก์ชัน, เมธอด, arrow function


กราฟและคลัสเตอร์

สร้างกราฟนำเข้าจาก ts-morph

จัดกลุ่มแบบ label propagation เบาๆ

ใช้ Graphviz แปลง .dot เป็นภาพ


CI (GitHub Actions)

ดู .github/workflows/audit.yml ในโปรเจกต์

ขยายความ

เพิ่มกฎให้ต่อไฟล์ใน src/analyzers/ts/rules/

เพิ่มรีพอร์ตฟอร์แมตใหม่ใน src/core/reporter/

รวม Python ภายหลังผ่าน bridge แล้วแม็ปเป็น RuleResult เทมเพลตเดียวกัน


---

## .github/workflows/audit.yml
```yaml
name: Code Audit

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci || npm i
      - run: npm run build
      - run: npm link
      - name: Analyze (Markdown)
        run: code-audit analyze . --format md --out audit.md --fail-on error
      - name: Duplicates
        run: |
          set +e
          code-audit dup . --out duplicates.json
          echo "dup_exit=$?" >> $GITHUB_ENV
          set -e
      - name: Graph
        run: code-audit graph . --out import-graph.dot
      - name: Grade
        run: code-audit grade . --out grade.json
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: audit-artifacts
          path: |
            audit.md
            duplicates.json
            import-graph.dot
            import-graph.clusters.json
            grade.json
      - name: Fail on duplicates
        if: env.dup_exit != '0'
        run: |
          echo "Exact duplicate functions detected"
          exit 1


---

วิธีใช้งานกับโค้ดจริงแบบสรุป

1. วางทุกไฟล์ตามโครงสร้างด้านบน


2. npm i && npm run build && npm link


3. รัน code-audit analyze . เพื่อสร้าง audit.md


4. รัน code-audit dup . เพื่อหา duplicate ฟังก์ชันที่ “เท่ากันจริง”


5. รัน code-audit graph . เพื่อได้ .dot และคลัสเตอร์


6. รัน code-audit grade . เพื่อคะแนนรวมและเกรด