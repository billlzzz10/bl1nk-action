# Code Audit TS 🚀

<p align="left">
  <img src="./badges/grade.svg" alt="Audit Grade"/>
  <img src="https://img.shields.io/github/v/release/billlzzz10/code-audit-ts?label=Version" alt="GitHub Release"/>
  <img src="https://img.shields.io/github/license/billlzzz10/code-audit-ts" alt="License"/>
  <img src="https://img.shields.io/github/actions/workflow/status/billlzzz10/code-audit-ts/ci.yml?branch=main" alt="CI Status"/>
</p>

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Quick Start (CLI)](#quick-start-cli)
- [GitHub Action](#github-action)
  - [Usage](#usage)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Example Workflows](#example-workflows)
- [Architecture](#architecture)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [Release & Automation](#release--automation)
- [Security & Policy](#security--policy)
- [License](#license)
- [Support](#support)

---

## Overview

**Code Audit TS** เป็นเครื่องมือตรวจสอบคุณภาพโค้ด TypeScript ทั้งในรูปแบบ CLI และ GitHub Action

ให้คะแนนเกรด A–F, สร้างกราฟการ import, ตรวจจับฟังก์ชันที่ซ้ำกันในเชิงตรรกะ, และสร้างรายงานพร้อม badges อัตโนมัติ

ออกแบบด้วย **Model-Driven Architecture** โดยใช้ **Smithy** เป็นแหล่งข้อมูลหลัก (single source of truth) ทำให้พฤติกรรมของเครื่องมือมีความน่าเชื่อถือสูงและมีการควบคุมอย่างเข้มงวด

---

## Features

- ตรวจสอบโค้ดตามกฎคุณภาพที่กำหนดไว้ล่วงหน้า
- คำนวณเกรดตัวอักษร (A–F) จากผลการตรวจ
- สร้างกราฟการ import ของโปรเจกต์ (Graphviz DOT)
- ตรวจจับฟังก์ชันที่ซ้ำกันในเชิงตรรกะ (logical duplicates)
- สร้างรายงาน Markdown และ JSON
- สร้าง badges SVG อัตโนมัติสำหรับใส่ใน README
- รองรับทั้งการใช้งานแบบ CLI และ GitHub Action

---

## Quick Start (CLI)

```bash
# ติดตั้งและลิงก์เป็น global command
npm i
npm run build
npm link

# รันการตรวจสอบโปรเจกต์ปัจจุบัน
code-audit analyze . --format md --out audit.md
```

---

## GitHub Action

### Usage

เพิ่มขั้นตอนนี้ใน workflow ของคุณเพื่อตรวจสอบคุณภาพโค้ดอัตโนมัติในทุก pull request หรือ push

```yaml
name: Code Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Code Audit TS
        uses: billlzzz10/code-audit-ts@v1
        with:
          path: "."
          fail-on: "C"           # Fail workflow ถ้าเกรดต่ำกว่า C
```

### Inputs

| Input       | Description                          | Required | Default |
|-------------|--------------------------------------|----------|---------|
| `path`      | Path to analyze                      | No       | `"."`   |
| `fail-on`   | Fail workflow if grade is below this (A–F or "error") | No       | —       |

### Outputs

ไฟล์ที่สร้างใน workspace:

- `audit.md` – รายงานหลักแบบ Markdown
- `grade.json` – คะแนนและเกรด
- `duplicates.json` – รายการฟังก์ชันที่ซ้ำกัน
- `import-graph.dot` + `clusters.json` – กราฟการ import
- `badges/*.svg` – badges สำหรับใส่ใน README

---

## Architecture

โครงการนี้ใช้ **Model-Driven Architecture** โดยมี Smithy model เป็นศูนย์กลางกำหนดพฤติกรรมทั้งหมดของเครื่องมือ

TypeScript code ทำหน้าที่เพียง implement สัญญาที่กำหนดไว้ใน model เท่านั้น ทำให้มั่นใจได้ว่าพฤติกรรมจะสอดคล้องกับที่ออกแบบไว้อย่างเคร่งครัด

อ่านรายละเอียดเพิ่มเติมได้ที่: **[Architecture Document](./ARCHITECTURE.md)**

---

## Local Development

```bash
# Clone และติดตั้ง
git clone https://github.com/billlzzz10/code-audit-ts.git
cd code-audit-ts
npm install

# Build
npm run build

# รัน CLI
npm link
code-audit --help

# รัน tests (ถ้ามี)
npm test
```

---

## Contributing

เรายินดีรับ contribution ทุกชนิด!

1. Fork repository
2. สร้าง branch (`git checkout -b feature/amazing`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing`)
5. เปิด Pull Request

ดูรายละเอียดเพิ่มเติมใน **[CONTRIBUTING.md](./CONTRIBUTING.md)** (ถ้ามี)

---

## Release & Automation

- อัปเดตเวอร์ชันและ CHANGELOG อัตโนมัติด้วย **Release Please**
- Dependabot อัปเดต dependencies ทุกสัปดาห์
- CI ตรวจสอบ build, lint และ test ทุก commit

---

## Security & Policy

- รายงานช่องโหว่ด้านความปลอดภัย: อ่าน **[SECURITY.md](./SECURITY.md)**
- Code of Conduct: ผู้ร่วมพัฒนาทุกคนต้องปฏิบัติตามมาตรฐานชุมชน

---

## License

โปรเจกต์นี้เผยแพร่ภายใต้ **MIT License** – ดูรายละเอียดใน **[LICENSE](./LICENSE)**

---

## Support

- **Homepage:** https://bl1nk.site
- **Team:** team@bl1nk.site
- **Support:** support@bl1nk.site
- **Issues:** https://github.com/billlzzz10/code-audit-ts/issues

---

ขอบคุณที่ใช้ Code Audit TS ✨