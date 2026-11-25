import sql from 'mssql';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.ts';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let poolMssql: sql.ConnectionPool | null = null;

export async function obterPoolSql(): Promise<sql.ConnectionPool> {
  if (poolMssql && poolMssql.connected) return poolMssql;
  const pool = new sql.ConnectionPool(config.mssql);
  await pool.connect();
  poolMssql = pool;
  return poolMssql;
}

export async function fecharPoolSql(): Promise<void> {
  if (poolMssql) {
    await poolMssql.close();
    poolMssql = null;
  }
}

export async function inicializarBancoSql(): Promise<void> {
  const configMaster: sql.config = {
    ...config.mssql,
    database: 'master',
  };

  const poolMaster = new sql.ConnectionPool(configMaster);
  await poolMaster.connect();

  try {
    const scriptDb = readFileSync(path.join(raiz, 'database/scripts/001_create_database.sql'), 'utf8');
    const comandosDb = scriptDb.split(/^\s*GO\s*$/gim).filter((c) => c.trim().length > 0);
    for (const cmd of comandosDb) {
      if (cmd.trim().toUpperCase().startsWith('USE ')) continue;
      await poolMaster.request().batch(cmd);
    }
  } finally {
    await poolMaster.close();
  }

  const poolApp = await obterPoolSql();
  const scripts = [
    'database/scripts/002_create_tables.sql',
    'database/scripts/003_create_indexes_views.sql',
    'database/scripts/004_initial_data.sql',
  ];

  for (const relPath of scripts) {
    const conteudo = readFileSync(path.join(raiz, relPath), 'utf8');
    const comandos = conteudo.split(/^\s*GO\s*$/gim).filter((c) => c.trim().length > 0);
    for (const cmd of comandos) {
      if (cmd.trim().toUpperCase().startsWith('USE ')) continue;
      await poolApp.request().batch(cmd);
    }
  }
}
