import { checkbox, confirm, input, select } from '@inquirer/prompts';
import clipboard from 'clipboardy';
import { execa } from 'execa';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import fs from 'fs-extra';
import ora from 'ora';
import pc from 'picocolors';
import { generateProject, writeCi } from './generator.js';
import { SERVICE_CATALOG } from './services/catalog.js';
import { assertProject, runClasp, safeJson } from './utils.js';
import type { ProjectType } from './types.js';

export async function initCommand(directory = '.'): Promise<void> {
  const appName = await input({ message: 'Application name:', default: path.basename(path.resolve(directory)) });
  const projectTypes: ProjectType[] = ['standalone', 'webapp', 'api-executable', 'addon', 'library', 'chat-app', 'sheets', 'docs', 'forms'];
  const projectType = await select<ProjectType>({ message: 'Project type:', choices: projectTypes.map(value => ({ name: value, value })) });
  const emulation = await confirm({ message: 'Enable gas-fakes?', default: true });
  const packageManager = await select<'npm' | 'pnpm' | 'yarn'>({ message: 'Package manager:', choices: ['npm', 'pnpm', 'yarn'].map(value => ({ name: value, value: value as 'npm' | 'pnpm' | 'yarn' })) });
  const git = await confirm({ message: 'Initialize Git?', default: true });
  const ci = await confirm({ message: 'Generate GitHub Actions?', default: true });
  const spinner = ora('Generating project').start();
  try { await generateProject({ directory, appName, projectType, emulation, packageManager, git, ci }); spinner.succeed(`Project created at ${path.resolve(directory)}`); }
  catch (error) { spinner.fail('Could not create the project'); throw error; }
}

export async function testCommand(watch = false, coverage = false): Promise<void> {
  const args = ['test']; if (watch) args.push('--watch'); if (coverage) args.push('--coverage');
  await execa('npm', args, { stdio: 'inherit' });
}

export async function addServiceCommand(): Promise<void> {
  assertProject();
  const selected = await checkbox({ message: 'Advanced services:', choices: SERVICE_CATALOG.map(item => ({ name: `${item.name} - ${item.description}`, value: item.id })) });
  const manifestPath = path.resolve('appsscript.json');
  const manifest = await fs.readJson(manifestPath);
  manifest.dependencies ??= {};
  manifest.dependencies.enabledAdvancedServices ??= [];
  for (const id of selected) {
    const item = SERVICE_CATALOG.find(service => service.id === id)!;
    const services = manifest.dependencies.enabledAdvancedServices as Array<Record<string, string>>;
    if (!services.some(service => service.serviceId === item.serviceId)) services.push({ userSymbol: item.userSymbol, serviceId: item.serviceId, version: item.version });
    await fs.ensureDir('src/services');
    await fs.writeFile(path.join('src/services', `${item.serviceId}.service.ts`), `${item.sampleCode}\n`, 'utf8');
    console.log(`${pc.green('Added')} ${item.name}. Cloud project activation may be required.`);
  }
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}

export async function exportSecretCommand(): Promise<void> {
  const file = path.join(process.env.HOME ?? '', '.clasprc.json');
  if (!existsSync(file)) throw new Error('~/.clasprc.json was not found. Run npx @google/clasp login first.');
  const sanitized = JSON.stringify(safeJson(readFileSync(file, 'utf8')));
  await clipboard.write(sanitized);
  console.log(`${pc.green('Copied')} to the clipboard. Save it in GitHub Secrets as CLASPRC_JSON.`);
  console.log('https://github.com/settings/secrets/actions');
}

export async function ciCommand(): Promise<void> { assertProject(); await writeCi(process.cwd()); console.log(pc.green('Created .github/workflows/deploy.yml')); }

export async function linkCommand(scriptId: string): Promise<void> {
  assertProject();
  if (!/^[A-Za-z0-9_-]+$/.test(scriptId)) throw new Error('The Apps Script ID is not valid.');
  const claspPath = path.resolve('.clasp.json');
  const clasp = (await fs.pathExists(claspPath)) ? await fs.readJson(claspPath) : { rootDir: 'dist' };
  clasp.scriptId = scriptId;
  clasp.rootDir ??= 'dist';
  await fs.writeJson(claspPath, clasp, { spaces: 2 });
  console.log(pc.green(`Linked local project to Apps Script ${scriptId}.`));
}

export async function listCommand(): Promise<void> { await runClasp(['list']); }

export async function devCommand(): Promise<void> {
  assertProject();
  await execa('npm', ['run', 'build', '--', '--watch'], { stdio: 'inherit' });
}
