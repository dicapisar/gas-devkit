import { execa } from 'execa';
import { existsSync } from 'node:fs';

export const runClasp = async (args: string[], cwd = process.cwd()) => {
  try {
    return await execa('npx', ['@google/clasp', ...args], { cwd, stdio: 'inherit' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/permission|api|enable/i.test(message)) {
      throw new Error(`${message}\nActiva la API de Apps Script en https://script.google.com/home/usersettings`);
    }
    throw error;
  }
};

export const assertProject = (cwd = process.cwd()) => {
  if (!existsSync(`${cwd}/package.json`)) throw new Error('package.json was not found in the current directory.');
};

export const safeJson = (value: string): unknown => {
  try { return JSON.parse(value); } catch { throw new Error('El archivo JSON no es valido.'); }
};
