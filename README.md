# gas-devkit

TypeScript CLI for Google Apps Script projects with esbuild bundling, local testing, and clasp automation.

## Development

```bash
npm install
npm run build
node dist/cli.js --help
npm test
```

## Comands

- `gas-devkit init [directory]`: generates a TypeScript-ready GAS project.
- `gas-devkit test [--watch] [--coverage]`: runs the project test suite.
- `gas-devkit serve [--port 3000]`: serves `doGet` and `doPost` locally.
- `gas-devkit run <function> [arguments...]`: invokes an exported function.
- `gas-devkit add service`: adds advanced services idempotently.
- `gas-devkit auth export-secret`: copies `.clasprc.json` to the clipboard without storing it in the project.
- `gas-devkit ci init`: creates the GitHub Actions workflow.
- `gas-devkit list`: displays scripts available through clasp.
- `gas-devkit dev`: runs build/watch, clasp push watch, and logs watch.
