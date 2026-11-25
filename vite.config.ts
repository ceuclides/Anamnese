import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const portaApi = Number(process.env.API_PORT ?? 3333);

/**
 * Em `pnpm dev`, inicia a API local (SQLite) junto com o Vite.
 * Reinicia sozinha ao editar server/ ou shared/ (o banco em database/ não é observado).
 * Defina API_AUTO=0 para iniciar a API manualmente com `pnpm api`.
 */
function apiLocal(): Plugin {
  let processo: ChildProcess | null = null;
  const encerrar = () => {
    processo?.kill('SIGTERM');
    processo = null;
  };
  return {
    name: 'api-local',
    apply: 'serve',
    configureServer(server) {
      if (process.env.API_AUTO === '0' || processo) return;
      processo = spawn(
        process.execPath,
        [
          '--disable-warning=ExperimentalWarning',
          '--watch-path=server',
          '--watch-path=shared',
          'server/src/index.ts',
        ],
        { stdio: 'inherit', env: { ...process.env, API_PORT: String(portaApi) } },
      );
      processo.on('exit', () => {
        processo = null;
      });
      server.httpServer?.on('close', encerrar);
      process.once('exit', encerrar);
    },
  };
}

export default defineConfig(({ command }) => {
  // Garante o React de produção no build mesmo se NODE_ENV=development estiver no ambiente.
  if (command === 'build') process.env.NODE_ENV = 'production';

  return {
    // Caminhos relativos: o build funciona em qualquer subpasta do GitHub Pages.
    base: './',
    plugins: [react(), apiLocal()],
    resolve: {
      alias: { '@shared': fileURLToPath(new URL('./shared', import.meta.url)) },
    },
    server: {
      // Em desenvolvimento, /api é encaminhado para a API local (pnpm api).
      proxy: {
        '/api': { target: `http://127.0.0.1:${portaApi}`, changeOrigin: true },
      },
    },
  };
});
