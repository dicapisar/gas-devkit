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
- `gas-devkit run <function> [arguments...] --inspect-brk`: pauses execution for VS Code debugging.
- `gas-devkit add service`: adds advanced services idempotently.
- `gas-devkit auth export-secret`: copies `.clasprc.json` to the clipboard without storing it in the project.
- `gas-devkit ci init`: creates the GitHub Actions workflow.
- `gas-devkit link <scriptId>`: links the local project to an Apps Script project.
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

For local line-by-line debugging, run `gas-devkit run helloWorld --inspect-brk`,
then attach to port `9229` using VS Code's Node.js debugger. The command builds
the local ESM entry point before invoking the function, while keeping the GAS
bundle in `dist/bundle.js`.

The generated esbuild configuration emits source maps, so breakpoints, stepping,
variables, and stack traces resolve back to the original TypeScript files under
`src/` instead of showing only bundled JavaScript.

If port `9229` is already in use, choose another port, for example:

```bash
gas-devkit run helloWorld --inspect-brk 9230
```

## Linking to Google Workspace

The Apps Script link is stored in `.clasp.json` and committed to the repository.
Local development never pushes code to Google. GitHub Actions performs the push
and deployment only after a successful push to `main`.

```bash
npx @google/clasp login
gas-devkit link YOUR_SCRIPT_ID
git add .clasp.json
git commit -m "Link Apps Script project"
git push
```

The script ID is available in the Apps Script editor under **Project Settings**.
The build copies `appsscript.json` into `dist/`, which is the directory used by
`.clasp.json` in GitHub Actions. Pull Requests run tests and build only. A push
to `main` runs those checks first, then restores `CLASPRC_JSON`, pushes the build,
and creates the Apps Script deployment.
