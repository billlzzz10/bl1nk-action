---
navigation_title: Repository Structure for GitHub Action
title: Repository Structure for GitHub Action
description: ตัวอย่างโครงสร้างรีโปสำหรับการเพิ่ม GitHub Action ในโปรเจกต์ TypeScript CLI
created_at: 2025-10-31
updated_at: 2025-12-17
---

# roportory structure

```
code-audit-ts/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml              # Test + Lint
│  │  ├─ build.yml           # Build dist และ check dist
│  │  ├─ release.yml         # Automated release (ใช้ release-please หรือ similar)
│  │  └─ test-action.yml     # Workflow สำหรับ test action เองใน repo
│  └─ dependabot.yml         # Optional: อัปเดต dependencies
├─ src/
│  ├─ action/                # Code เฉพาะสำหรับ GitHub Action (entrypoint)
│  │  └─ main.ts             # ไฟล์หลักที่เรียก CLI หรือ logic ของ action
│  ├─ cli/
│  │  └─ main.ts             # CLI entrypoint (เดิม)
│  ├─ core/                  # คงเดิม
│  ├─ analyzers/             # คงเดิม
│  ├─ arch/                  # คงเดิม
│  ├─ dup/                   # คงเดิม
│  ├─ fingerprint/           # คงเดิม
│  └─ types/                 # คงเดิม (เช่น rules.ts)
├─ bin/
│  └─ code-audit             # คงเดิม (shebang สำหรับ CLI)
├─ dist/                     # **ต้อง commit เข้า repo** (generated โดย ncc)
│  └─ index.js               # Bundle เดียวจาก src/action/main.ts
├─ action.yml                # **ไฟล์หลักสำหรับ GitHub Action** (metadata)
├─ package.json
├─ tsconfig.json
├─ jest.config.js            # ถ้ามี tests
├─ README.md                 # อัปเดตให้มี YAML example สำหรับ uses:
├─ LICENSE
└─ .gitignore                # **ลบ dist/ ออกจาก ignore**
```
