import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.ts';
import { COLUNAS_POR_TIPO } from '../../shared/constants/schema.ts';

let instancia: DatabaseSync | null = null;

/** Abre (ou cria) o banco SQLite e aplica o schema idempotente. */
export function abrirBanco(): DatabaseSync {
  if (instancia) return instancia;

  mkdirSync(path.dirname(config.caminhoBanco), { recursive: true });
  const db = new DatabaseSync(config.caminhoBanco);
  db.exec(readFileSync(config.caminhoSchema, 'utf8'));
  db.exec('PRAGMA foreign_keys = ON;');
  verificarColunas(db);

  instancia = db;
  return db;
}

/**
 * Confere se cada campo declarado nas constantes do formulário possui coluna
 * correspondente no banco. Interrompe a inicialização se o schema estiver desatualizado.
 */
function verificarColunas(db: DatabaseSync) {
  const faltando: string[] = [];
  for (const { tabela, colunas } of Object.values(COLUNAS_POR_TIPO)) {
    const existentes = new Set(
      (db.prepare(`PRAGMA table_info(${tabela})`).all() as { name: string }[]).map((c) => c.name),
    );
    for (const coluna of Object.keys(colunas)) {
      if (!existentes.has(coluna)) faltando.push(`${tabela}.${coluna}`);
    }
  }
  if (faltando.length > 0) {
    throw new Error(
      `O banco não possui as colunas: ${faltando.join(', ')}. Atualize database/schema.sql ou recrie o banco.`,
    );
  }
}

/** Executa a função dentro de uma transação, com rollback em caso de erro. */
export function emTransacao<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const resultado = fn();
    db.exec('COMMIT');
    return resultado;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}
