import { Command } from 'commander';
import inspector from 'node:inspector';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execa } from 'execa';
import { addServiceCommand, ciCommand, devCommand, exportSecretCommand, initCommand, listCommand, testCommand } from './commands.js';
import { serveCommand } from './serve.js';

const program = new Command();
program.name('gas-devkit').description('CLI toolkit for Google Apps Script').version('0.1.2');
program.command('init [directory]').action(initCommand);
program.command('test').option('--watch').option('--coverage').action(options => testCommand(options.watch, options.coverage));
program.command('serve').option('-p, --port <number>', 'Puerto HTTP', '3000').option('--document-id <id>').action(options => serveCommand(Number(options.port)));
program.command('run <function> [args...]')
	.option('--inspect [port]', 'Open the Node.js inspector without pausing')
	.option('--inspect-brk [port]', 'Open the inspector and pause before running')
	.action(async (functionName, args, options) => {
		await execa('npm', ['run', 'build'], { stdio: 'inherit' });
		const debugPort = options.inspectBrk ?? options.inspect;
		if (debugPort) inspector.open(Number(debugPort === true ? 9229 : debugPort), '127.0.0.1', Boolean(options.inspectBrk));
		try {
			const moduleUrl = pathToFileURL(path.resolve('dist/index.js')).href;
			const mod = await import(`${moduleUrl}?run=${Date.now()}`);
			const fn = mod[functionName];
			if (typeof fn !== 'function') throw new Error(`Function not found: ${functionName}`);
			console.log(await fn(...args));
		} finally {
			if (debugPort) inspector.close();
		}
	});
program.command('add').command('service').action(addServiceCommand);
program.command('auth').command('export-secret').action(exportSecretCommand);
program.command('ci').command('init').action(ciCommand);
program.command('list').action(listCommand);
program.command('dev').action(devCommand);
program.parseAsync().catch(error => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
