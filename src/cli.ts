import { Command } from 'commander';
import { addServiceCommand, ciCommand, devCommand, exportSecretCommand, initCommand, listCommand, testCommand } from './commands.js';
import { serveCommand } from './serve.js';

const program = new Command();
program.name('gas-devkit').description('CLI toolkit for Google Apps Script').version('0.1.0');
program.command('init [directory]').action(initCommand);
program.command('test').option('--watch').option('--coverage').action(options => testCommand(options.watch, options.coverage));
program.command('serve').option('-p, --port <number>', 'Puerto HTTP', '3000').option('--document-id <id>').action(options => serveCommand(Number(options.port)));
program.command('run <function> [args...]').action(async (functionName, args) => { const mod = await import(`${process.cwd()}/dist/index.js`); const fn = mod[functionName]; if (typeof fn !== 'function') throw new Error(`Function not found: ${functionName}`); console.log(await fn(...args)); });
program.command('add').command('service').action(addServiceCommand);
program.command('auth').command('export-secret').action(exportSecretCommand);
program.command('ci').command('init').action(ciCommand);
program.command('list').action(listCommand);
program.command('dev').action(devCommand);
program.parseAsync().catch(error => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
