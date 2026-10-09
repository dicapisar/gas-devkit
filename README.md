# gas-devkit

TypeScript CLI for Google Apps Script projects with esbuild bundling, local testing, and clasp automation.

## Installation

```bash
npm install --global gas-devkit
# or run without installing globally
npx gas-devkit --help
```

## Development

```bash
npm install
npm run build
node dist/cli.js --help
npm test
```

## Commands

- `gas-devkit init [directory]`: generates a TypeScript-ready GAS project.
- `gas-devkit test [--watch] [--coverage]`: runs the project test suite.
- `gas-devkit serve [--port 3000]`: serves `doGet` and `doPost` locally.
- `gas-devkit run <function> [arguments...]`: invokes an exported function.
- `gas-devkit add service`: adds advanced services idempotently.
- `gas-devkit auth export-secret`: copies `.clasprc.json` to the clipboard without storing it in the project.
- `gas-devkit ci init`: creates the GitHub Actions workflow.
- `gas-devkit list`: displays scripts available through clasp.
- `gas-devkit dev`: runs build/watch, clasp push watch, and logs watch.

The `init` command offers focused starter templates for `standalone`, `webapp`,
`api-executable`, `addon`, `library`, `chat-app`, `sheets`, `docs`, and `forms`.
Each template starts with only the relevant Hello World entry points:

- Web App: `doGet` and `doPost`
- API executable, standalone script, and library: `helloWorld`
- Add-on: `onOpen` and `onInstall`
- Chat app: `onMessage` and `onAppCommand`
- Sheets, Docs, and Forms: `onOpen` and `helloWorld`
