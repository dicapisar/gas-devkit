import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, it, test } from 'vitest';
import { generateProject } from '../src/generator.js';

test('generates a Jest setup that runs without ts-node', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gas-devkit-'));
  await generateProject({
    directory,
    appName: 'generated-test',
    projectType: 'standalone',
    git: false,
    ci: false,
    emulation: true,
    packageManager: 'npm',
  });

  const packageJson = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  expect(packageJson.scripts.test).toBe('jest --config jest.config.cjs');
  expect(packageJson.devDependencies['@types/jest']).toBeDefined();
  await expect(readFile(path.join(directory, 'jest.config.cjs'), 'utf8')).resolves.toContain("preset: 'ts-jest'");
});

it.each([
  ['webapp', ['doGet', 'doPost']],
  ['addon', ['onOpen', 'onInstall']],
  ['chat-app', ['onMessage', 'onAppCommand']],
] as const)('generates the %s starter entry points', async (projectType, entryPoints) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gas-devkit-'));
  await generateProject({ directory, appName: 'generated-test', projectType, git: false, ci: false, emulation: true, packageManager: 'npm' });
  const source = await readFile(path.join(directory, 'src/index.ts'), 'utf8');
  for (const entryPoint of entryPoints) expect(source).toContain(`function ${entryPoint}`);
});
