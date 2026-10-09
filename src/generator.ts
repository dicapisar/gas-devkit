import fs from 'fs-extra';
import path from 'node:path';
import { execa } from 'execa';
import type { ProjectType } from './types.js';

export interface InitOptions {
  directory: string;
  appName: string;
  projectType: ProjectType;
  git: boolean;
  ci: boolean;
  emulation: boolean;
  packageManager: 'npm' | 'pnpm' | 'yarn';
}

const validName = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
export const validateAppName = (name: string) => validName.test(name) || 'Use letters, numbers, hyphens, or underscores.';

export async function generateProject(options: InitOptions): Promise<void> {
  if (!validateAppName(options.appName)) throw new Error('The application name is not a safe identifier.');
  const root = path.resolve(options.directory);
  await fs.ensureDir(root);
  const source = path.join(root, 'src');
  const tests = path.join(root, 'tests');
  await fs.ensureDir(path.join(source, 'models'));
  await fs.ensureDir(path.join(source, 'services'));
  await fs.ensureDir(tests);
  await fs.ensureDir(path.join(root, '.vscode'));

  const packageJson = {
    name: options.appName.toLowerCase(), version: '0.1.0', private: true, type: 'module',
    scripts: { build: 'node esbuild.config.js', test: 'jest --config jest.config.cjs', 'test:watch': 'jest --config jest.config.cjs --watch', 'test:coverage': 'jest --config jest.config.cjs --coverage' },
    devDependencies: {
      '@types/google-apps-script': '^1.0.83', '@types/jest': '^30.0.0', '@types/node': '^22.13.4',
      '@mcpher/gas-fakes': '^1.1.0', esbuild: '^0.25.0', jest: '^30.5.2', 'ts-jest': '^29.4.5', typescript: '^5.7.3',
    },
  };
  if (!options.emulation) {
    const dependencies = packageJson.devDependencies as Record<string, string | undefined>;
    delete dependencies['@mcpher/gas-fakes'];
  }
  await fs.writeJson(path.join(root, 'package.json'), packageJson, { spaces: 2 });
  await fs.writeJson(path.join(root, 'appsscript.json'), {
    timeZone: 'America/Santiago', dependencies: { enabledAdvancedServices: [] }, exceptionLogging: 'STACKDRIVER', runtimeVersion: 'V8',
  }, { spaces: 2 });
  await fs.writeJson(path.join(root, '.clasp.json'), { scriptId: 'REPLACE_WITH_SCRIPT_ID', rootDir: 'dist' }, { spaces: 2 });
  await fs.writeJson(path.join(root, 'tsconfig.json'), {
    compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', lib: ['ES2022'], strict: true, esModuleInterop: true, types: ['node', 'jest', 'google-apps-script'], noEmit: true }, include: ['src', 'tests'],
  }, { spaces: 2 });
  await fs.writeFile(path.join(root, 'jest.config.cjs'), `module.exports = {\n  preset: 'ts-jest',\n  testEnvironment: 'node',\n  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],\n};\n`, 'utf8');
  await fs.writeFile(path.join(root, 'esbuild.config.js'), `import { build } from 'esbuild';\nawait build({ entryPoints: ['src/index.ts'], bundle: true, format: 'iife', outfile: 'dist/bundle.js', platform: 'neutral', target: 'es2020' });\n`, 'utf8');
  await fs.writeFile(path.join(root, '.gitignore'), 'node_modules/\ndist/\ncoverage/\n.env\n.clasprc.json\n.DS_Store\n', 'utf8');
  await fs.writeJson(path.join(root, '.vscode', 'extensions.json'), { recommendations: ['googlecloudtools.cloudcode', 'ms-vscode.vscode-typescript-next'] }, { spaces: 2 });
  await fs.writeJson(path.join(root, '.vscode', 'settings.json'), { 'typescript.tsdk': 'node_modules/typescript/lib' }, { spaces: 2 });
  await fs.writeFile(path.join(source, 'models', 'record.model.ts'), `export interface RecordModel { id: string; createdAt: string; data: Record<string, unknown>; }\n`, 'utf8');
  await fs.writeFile(path.join(source, 'services', 'base.service.ts'), `export abstract class BaseService<T> {\n  abstract execute(input: T): Promise<unknown>;\n}\n`, 'utf8');
  await fs.writeFile(path.join(source, 'services', 'sheets.service.ts'), `import { BaseService } from './base.service';\nexport class SheetsService extends BaseService<string> {\n  async execute(range: string): Promise<unknown> { return Sheets.Spreadsheets?.Values?.get('', range); }\n}\n`, 'utf8');
  const entry = options.projectType === 'webapp'
    ? `export function doGet(): GoogleAppsScript.Content.TextOutput { return ContentService.createTextOutput('gas-devkit webapp'); }\nexport function doPost(): GoogleAppsScript.Content.TextOutput { return ContentService.createTextOutput('ok'); }\n`
    : `export function main(): string { return 'gas-devkit'; }\n`;
  await fs.writeFile(path.join(source, 'index.ts'), entry, 'utf8');
  await fs.writeFile(path.join(tests, 'setup.ts'), options.emulation ? `// Initialize gas-fakes for each test to keep the environment isolated.\n` : '', 'utf8');
  const test = options.projectType === 'webapp'
    ? `import { doGet } from '../src/index';\ntest('webapp entry point is available', () => { expect(doGet).toBeDefined(); });\n`
    : `import { main } from '../src/index';\ntest('entry point is available', () => { expect(main()).toBe('gas-devkit'); });\n`;
  await fs.writeFile(path.join(tests, 'index.test.ts'), test, 'utf8');
  await fs.writeFile(path.join(root, 'README.md'), `# ${options.appName}\n\nGoogle Apps Script project generated by gas-devkit.\n\nRun npm install && npm test.\n`, 'utf8');
  if (options.ci) await writeCi(root);
  if (options.git) await execa('git', ['init'], { cwd: root });
}

export async function writeCi(root: string): Promise<void> {
  await fs.ensureDir(path.join(root, '.github', 'workflows'));
  const workflow = `name: Deploy Apps Script\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: npm test -- --runInBand\n      - run: mkdir -p ~/.config/@google/clasp && printf '%s' '${'{{ secrets.CLASPRC_JSON }}'}' > ~/.clasprc.json\n      - run: npm run build\n      - run: npx @google/clasp push --force\n      - run: npx @google/clasp deploy --description "CI Deploy $GITHUB_SHA"\n`;
  await fs.writeFile(path.join(root, '.github', 'workflows', 'deploy.yml'), workflow, 'utf8');
}
