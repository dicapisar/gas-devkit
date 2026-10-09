import { createServer } from 'node:http';
import { execa } from 'execa';

export async function serveCommand(port: number): Promise<void> {
  const module = await import(`${process.cwd()}/dist/bundle.js`).catch(() => undefined) as { doGet?: Function; doPost?: Function } | undefined;
  const server = createServer(async (request, response) => {
    try {
      const handler = request.method === 'POST' ? module?.doPost : module?.doGet;
      if (!handler) { response.writeHead(404); response.end('doGet/doPost was not found. Run npm run build.'); return; }
      const result = await handler({ parameter: Object.fromEntries(new URL(request.url ?? '/', `http://${request.headers.host}`).searchParams) });
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(result?.getContent?.() ?? String(result ?? ''));
    } catch (error) { response.writeHead(500); response.end(error instanceof Error ? error.message : String(error)); }
  });
  await new Promise<void>((resolve) => server.listen(port, () => { console.log(`Servidor local: http://localhost:${port}`); resolve(); }));
  await execa('node', ['-e', ''], { stdio: 'ignore' }).catch(() => undefined);
}
