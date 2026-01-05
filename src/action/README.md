# Code Audit TS Action

This action runs the code-audit-ts tool on your repository.

## Usage

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