import { config } from './config.ts';
import { abrirBanco } from './db.ts';

// Cria o arquivo SQLite (se necessário) e aplica database/schema.sql.
const db = abrirBanco();
const tabelas = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all() as { name: string }[];
db.close();

console.log(`Banco pronto em ${config.caminhoBanco}`);
console.log(`Tabelas: ${tabelas.map((t) => t.name).join(', ')}`);
