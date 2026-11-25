import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import type sql from 'mssql';
import type { FichaTipo } from '../../shared/types.ts';
import { config } from './config.ts';
import { abrirBanco } from './db.ts';
import { obterPoolSql, fecharPoolSql, inicializarBancoSql } from './db-mssql.ts';
import { ErroHttp } from './erros.ts';
import {
  atualizarFicha,
  criarFicha,
  listarFichas,
  obterFicha,
  obterUltimaFicha,
} from './fichas.ts';
import {
  atualizarFichaSql,
  criarFichaSql,
  listarFichasSql,
  obterFichaSql,
  obterUltimaFichaSql,
} from './fichas-mssql.ts';
import { validarFicha } from './validacao.ts';

let dbSqlite: DatabaseSync | null = null;
let poolMssql: sql.ConnectionPool | null = null;

if (config.tipoBanco === 'mssql') {
  try {
    await inicializarBancoSql();
    poolMssql = await obterPoolSql();
    console.log(`[Banco de Dados] Microsoft SQL Server conectado em ${config.mssql.server}:${config.mssql.port} (DB: ${config.mssql.database})`);
  } catch (err) {
    console.error('[Banco de Dados] Falha ao conectar no SQL Server:', err);
    console.log('[Banco de Dados] Recorrendo ao SQLite local como contingência...');
    dbSqlite = abrirBanco();
  }
} else {
  dbSqlite = abrirBanco();
  console.log(`[Banco de Dados] SQLite conectado em ${config.caminhoBanco}`);
}

function cabecalhosCors(req: IncomingMessage): Record<string, string> {
  const origem = req.headers.origin;
  const liberado = config.origensPermitidas.includes('*') || (origem && config.origensPermitidas.includes(origem));
  if (!origem || !liberado) return {};
  return {
    'Access-Control-Allow-Origin': config.origensPermitidas.includes('*') ? '*' : origem,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
    Vary: 'Origin',
  };
}

function responder(req: IncomingMessage, res: ServerResponse, status: number, corpo?: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...cabecalhosCors(req) });
  res.end(corpo === undefined ? undefined : JSON.stringify(corpo));
}

async function lerJson(req: IncomingMessage): Promise<unknown> {
  const partes: Buffer[] = [];
  let total = 0;
  for await (const parte of req) {
    total += (parte as Buffer).length;
    if (total > config.limiteCorpoBytes) throw new ErroHttp(413, 'Corpo da requisição muito grande.');
    partes.push(parte as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8'));
  } catch {
    throw new ErroHttp(400, 'JSON inválido.');
  }
}

function tipoValido(tipo: string | null): FichaTipo {
  if (tipo === 'facial' || tipo === 'corporal') return tipo;
  throw new ErroHttp(400, 'Parâmetro "tipo" deve ser "facial" ou "corporal".');
}

async function rotear(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const caminho = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  const metodo = req.method ?? 'GET';

  if (metodo === 'OPTIONS') return responder(req, res, 204);

  if (metodo === 'GET' && caminho === '/health') {
    return responder(req, res, 200, {
      ok: true,
      banco: poolMssql ? 'mssql' : 'sqlite',
      bancoNome: poolMssql ? config.mssql.database : config.caminhoBanco,
    });
  }

  if (caminho === '/fichas' && metodo === 'GET') {
    const filtro = {
      cpf: url.searchParams.get('cpf') ?? undefined,
      tipo: url.searchParams.get('tipo') ?? undefined,
    };
    const lista = poolMssql ? await listarFichasSql(poolMssql, filtro) : listarFichas(dbSqlite!, filtro);
    return responder(req, res, 200, lista);
  }

  if (caminho === '/fichas' && metodo === 'POST') {
    const ficha = validarFicha(await lerJson(req));
    const resultado = poolMssql ? await criarFichaSql(poolMssql, ficha) : criarFicha(dbSqlite!, ficha);
    return responder(req, res, 201, resultado);
  }

  if (caminho === '/fichas/ultima' && metodo === 'GET') {
    const cpf = url.searchParams.get('cpf');
    if (!cpf) throw new ErroHttp(400, 'Parâmetro "cpf" é obrigatório.');
    const tipo = tipoValido(url.searchParams.get('tipo'));
    const ficha = poolMssql ? await obterUltimaFichaSql(poolMssql, cpf, tipo) : obterUltimaFicha(dbSqlite!, cpf, tipo);
    return ficha ? responder(req, res, 200, ficha) : responder(req, res, 404, { erro: 'Nenhuma ficha encontrada.' });
  }

  const porId = /^\/fichas\/(\d+)$/.exec(caminho);
  if (porId) {
    const id = Number(porId[1]);
    if (metodo === 'GET') {
      const ficha = poolMssql ? await obterFichaSql(poolMssql, id) : obterFicha(dbSqlite!, id);
      return ficha ? responder(req, res, 200, ficha) : responder(req, res, 404, { erro: 'Ficha não encontrada.' });
    }
    if (metodo === 'PUT') {
      const ficha = validarFicha(await lerJson(req));
      const resultado = poolMssql ? await atualizarFichaSql(poolMssql, id, ficha) : atualizarFicha(dbSqlite!, id, ficha);
      return responder(req, res, 200, resultado);
    }
  }

  throw new ErroHttp(404, 'Rota não encontrada.');
}

const servidor = createServer((req, res) => {
  rotear(req, res).catch((erro: unknown) => {
    if (erro instanceof ErroHttp) {
      return responder(req, res, erro.status, { erro: erro.message, detalhes: erro.detalhes });
    }
    console.error(erro);
    responder(req, res, 500, { erro: 'Erro interno ao processar a requisição.' });
  });
});

servidor.listen(config.porta, config.host, () => {
  console.log(`API das fichas de anamnese em http://${config.host}:${config.porta}`);
});

for (const sinal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sinal, async () => {
    servidor.close();
    if (poolMssql) await fecharPoolSql();
    if (dbSqlite) dbSqlite.close();
    process.exit(0);
  });
}
