import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Carrega variáveis do arquivo .env caso não estejam no process.env
const caminhoEnv = path.resolve(raiz, '.env');
if (existsSync(caminhoEnv)) {
  const linhas = readFileSync(caminhoEnv, 'utf8').split('\n');
  for (const linha of linhas) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    const idx = limpa.indexOf('=');
    if (idx > 0) {
      const chave = limpa.slice(0, idx).trim();
      const valor = limpa.slice(idx + 1).trim();
      if (!process.env[chave]) {
        process.env[chave] = valor;
      }
    }
  }
}

/** Configuração da API local (sobrescrita via variáveis de ambiente). */
export const config = {
  host: process.env.API_HOST ?? '127.0.0.1',
  porta: Number(process.env.API_PORT ?? 3333),

  /** Tipo de persistência: 'mssql' ou 'sqlite' (fallback) */
  tipoBanco: (process.env.DB_TYPE ?? 'mssql') as 'mssql' | 'sqlite',

  /** Configurações Microsoft SQL Server */
  mssql: {
    server: process.env.DB_SERVER ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 1433),
    user: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'ClinicaEscolaAnamnese',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT ?? 15000),
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },

  /** Caminho do arquivo SQLite (fallback) */
  caminhoBanco: path.resolve(raiz, process.env.DB_PATH ?? 'database/clinica.db'),
  caminhoSchema: path.resolve(raiz, 'database/schema.sql'),

  /** Origens autorizadas para CORS */
  origensPermitidas: (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean),

  /** Tamanho máximo do corpo JSON */
  limiteCorpoBytes: Number(process.env.API_BODY_LIMIT ?? 30 * 1024 * 1024),
};
