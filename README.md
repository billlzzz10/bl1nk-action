# Code Audit TS 🚀

<p align="left">
  <img src="./badges/grade.svg" alt="Audit Grade"/>
  <img src="https://img.shields.io/badge/Architecture-Smithy_Model_Driven-blueviolet" alt="Architecture: Smithy Model-Driven"/>
</p>

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Usage](#usage)
4. [Architecture](#architecture)
5. [GitHub Action](#github-action)
6. [Outputs](#outputs)
7. [Release & Automation](#release--automation)
8. [Security & Policy](#security--policy)
9. [Team & Support](#team--support)

---

## Overview
CLI + GitHub Action ตรวจคุณภาพ TypeScript โค้ด
ทำ grade A–F, วาด import graph, หา duplicates และสร้าง badges อัตโนมัติ

This project is built on a **Model-Driven Architecture** with **Smithy**, ensuring that all of its capabilities are formally defined and governed by a strict model.

---

## Quick Start
```bash
npm i
npm run build
npm link
code-audit analyze . --format md --out audit.md
```

---

## Usage

| Command (Operation) | Description |
|---|---|
| `analyze` | Analyzes the codebase against a set of predefined rules. |
| `graph` | Generates an import graph of the project. |
| `dup` | Finds logically duplicate functions. |
| `grade` | Calculates a letter grade (A-F) for the project. |

---

## Architecture
Our architecture is centered around a formal Smithy model, which serves as the single source of truth for the tool's capabilities. This Model-Driven approach ensures reliability and provides a strong guardrail against unexpected behavior.

The "core" of our application (the TypeScript code) exists to implement the contract defined in our "shell" (the Smithy model).

For a detailed explanation of our design principles, please read our **[Architecture Document](./ARCHITECTURE.md)**.

---

## GitHub Action

```yaml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - uses: billlzzz10/code-audit-ts@v1
        with:
          path: "."
          fail-on: "error"
```

---

## Outputs

- `audit.md` รายงานหลัก
- `grade.json` คะแนน / เกรด
- `duplicates.json` ฟังก์ชันซ้ำ
- `import-graph.dot` + `.clusters.json`
- `badges/*.svg`

---

## Release & Automation

- `release.yml` ใช้ google-release-please สร้าง tag + CHANGELOG อัตโนมัติ
- Dependabot อัปเดต dependencies ทุก สัปดาห์

---

## Security & Policy

- See `SECURITY.md`
- License: MIT

---

## Team & Support

- **Team:** team@bl1nk.site
- **Homepage:** https://bl1nk.site
- **Support:** support@bl1nk.site
