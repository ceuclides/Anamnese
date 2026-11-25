import sql from 'mssql';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const config = {
  user: 'sa',
  password: 'SqlLocal@12345',
  server: 'localhost',
  port: 1433,
  database: 'master',
  options: { encrypt: false, trustServerCertificate: true },
};

async function executarScripts() {
  console.log('Conectando ao master...');
  const poolMaster = await sql.connect(config);

  const script001 = readFileSync(path.join(raiz, 'database/scripts/001_create_database.sql'), 'utf8');
  const partes001 = script001.split(/^\s*GO\s*$/gim).filter((c) => c.trim().length > 0);
  for (const cmd of partes001) {
    if (cmd.trim().toUpperCase().startsWith('USE ')) continue;
    await poolMaster.request().batch(cmd);
  }
  await poolMaster.close();
  console.log('Banco de dados ClinicaEscolaAnamnese verificado/criado com sucesso!');

  console.log('Conectando a ClinicaEscolaAnamnese...');
  const poolDb = await sql.connect({ ...config, database: 'ClinicaEscolaAnamnese' });

  const outrosScripts = [
    'database/scripts/002_create_tables.sql',
    'database/scripts/003_create_indexes_views.sql',
    'database/scripts/004_initial_data.sql',
  ];

  for (const rel of outrosScripts) {
    console.log(`Executando ${rel}...`);
    const conteudo = readFileSync(path.join(raiz, rel), 'utf8');
    const partes = conteudo.split(/^\s*GO\s*$/gim).filter((c) => c.trim().length > 0);
    for (const cmd of partes) {
      if (cmd.trim().toUpperCase().startsWith('USE ')) continue;
      await poolDb.request().batch(cmd);
    }
  }

  const tabelas = await poolDb.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
  `);
  console.log('Tabelas existentes no SQL Server:');
  for (const t of tabelas.recordset) {
    console.log(` - ${t.TABLE_NAME}`);
  }

  await poolDb.close();
  console.log('Migração concluída com sucesso!');
}

executarScripts().catch((err) => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
