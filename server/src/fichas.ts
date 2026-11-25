import type { DatabaseSync } from 'node:sqlite';
import type {
  Anexo,
  Evolucao,
  FichaPayload,
  FichaResumo,
  FichaTipo,
  Marcacao,
  Medida,
  SalvarResultado,
  ValorCampo,
} from '../../shared/types.ts';
import type { TipoColuna } from '../../shared/forms.ts';
import { COLUNAS_POR_TIPO } from '../../shared/constants/schema.ts';
import { emTransacao } from './db.ts';
import { ErroHttp } from './erros.ts';

type Linha = Record<string, unknown>;
type ValorSql = string | number | bigint | null | Uint8Array;

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

function vazioParaNulo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const limpo = valor.trim();
  return limpo === '' ? null : limpo;
}

/** Converte data URL base64 em bytes + MIME para armazenar como BLOB. */
function dataUrlParaBlob(dataUrl: string): { mime: string; bytes: Uint8Array } {
  const correspondencia = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!correspondencia) throw new ErroHttp(422, 'Arquivo em formato inválido (esperado data URL base64).');
  const [, mime = 'application/octet-stream', base64, conteudo] = correspondencia;
  const bytes = base64 ? Buffer.from(conteudo, 'base64') : Buffer.from(decodeURIComponent(conteudo));
  return { mime, bytes };
}

function blobParaDataUrl(bytes: unknown, mime: string): string | null {
  if (!(bytes instanceof Uint8Array)) return null;
  return `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
}

/** Converte valores do formulário para o tipo da coluna SQLite. */
function paraColuna(valor: ValorCampo | undefined, tipo: TipoColuna): ValorSql {
  if (valor === undefined || valor === null || valor === '') return null;
  if (tipo === 'INTEGER' && typeof valor === 'boolean') return valor ? 1 : 0;
  if (tipo === 'TEXT') return String(valor).trim() || null;
  const numero = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

function daColuna(valor: unknown, tipo: TipoColuna): ValorCampo {
  if (valor === null || valor === undefined) return null;
  // Somente respostas Sim/Não são declaradas como INTEGER (1 = Sim, 0 = Não).
  if (tipo === 'INTEGER') return Number(valor) === 1;
  if (tipo === 'REAL') return Number(valor);
  return String(valor);
}

function obterOuCriarAluno(db: DatabaseSync, nome: string, email: string): number {
  db.prepare(
    `INSERT INTO alunos (nome, email) VALUES (?, ?)
     ON CONFLICT(email) DO UPDATE SET nome = excluded.nome`,
  ).run(nome, email);
  const linha = db.prepare('SELECT id FROM alunos WHERE email = ?').get(email) as { id: number };
  return linha.id;
}

function obterOuCriarPaciente(db: DatabaseSync, ficha: FichaPayload): number {
  const i = ficha.identificacao;
  db.prepare(
    `INSERT INTO pacientes (cpf, nome, endereco, bairro, cidade, telefones, nacionalidade, naturalidade,
                            estado_civil, data_nascimento, profissao, email, contato_emergencia, telefone_emergencia)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(cpf) DO UPDATE SET
       nome = excluded.nome, endereco = excluded.endereco, bairro = excluded.bairro, cidade = excluded.cidade,
       telefones = excluded.telefones, nacionalidade = excluded.nacionalidade, naturalidade = excluded.naturalidade,
       estado_civil = excluded.estado_civil, data_nascimento = excluded.data_nascimento, profissao = excluded.profissao,
       email = excluded.email, contato_emergencia = excluded.contato_emergencia,
       telefone_emergencia = excluded.telefone_emergencia, atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
  ).run(
    ficha.paciente_cpf.trim(),
    i.nome.trim(),
    vazioParaNulo(i.endereco),
    vazioParaNulo(i.bairro),
    vazioParaNulo(i.cidade),
    vazioParaNulo(i.telefones),
    vazioParaNulo(i.nacionalidade),
    vazioParaNulo(i.naturalidade),
    vazioParaNulo(i.estado_civil),
    vazioParaNulo(i.data_nascimento),
    vazioParaNulo(i.profissao),
    vazioParaNulo(i.email),
    vazioParaNulo(i.contato_emergencia),
    vazioParaNulo(i.telefone_emergencia),
  );
  const linha = db.prepare('SELECT id FROM pacientes WHERE cpf = ?').get(ficha.paciente_cpf.trim()) as { id: number };
  return linha.id;
}

/** Remove e regrava os registros filhos de uma ficha. */
function gravarDetalhes(db: DatabaseSync, fichaId: number, ficha: FichaPayload) {
  const { tabela, colunas } = COLUNAS_POR_TIPO[ficha.tipo];

  for (const filha of [tabela, 'ficha_opcoes', 'ficha_anexos', 'mapa_marcacoes', 'medidas_corporais', 'evolucoes', 'tcle_aceites']) {
    db.prepare(`DELETE FROM ${filha} WHERE ficha_id = ?`).run(fichaId);
  }

  const nomes = Object.keys(colunas);
  db.prepare(
    `INSERT INTO ${tabela} (ficha_id${nomes.map((n) => `, ${n}`).join('')})
     VALUES (?${nomes.map(() => ', ?').join('')})`,
  ).run(fichaId, ...nomes.map((nome) => paraColuna(ficha.campos[nome], colunas[nome])));

  const inserirOpcao = db.prepare('INSERT OR IGNORE INTO ficha_opcoes (ficha_id, grupo, opcao) VALUES (?, ?, ?)');
  for (const [grupo, valores] of Object.entries(ficha.opcoes)) {
    for (const opcao of valores) inserirOpcao.run(fichaId, grupo, opcao);
  }

  const inserirAnexo = db.prepare(
    'INSERT INTO ficha_anexos (ficha_id, nome_arquivo, tipo_mime, tamanho_bytes, conteudo) VALUES (?, ?, ?, ?, ?)',
  );
  for (const anexo of ficha.anexos) {
    const { mime, bytes } = dataUrlParaBlob(anexo.conteudo_base64);
    inserirAnexo.run(fichaId, anexo.nome_arquivo, anexo.tipo_mime || mime, bytes.byteLength, bytes);
  }

  const inserirMarcacao = db.prepare(
    `INSERT INTO mapa_marcacoes (ficha_id, ordem, vista, pos_x, pos_y, alteracao, grau, descricao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  ficha.marcacoes.forEach((m, indice) => {
    inserirMarcacao.run(fichaId, indice + 1, m.vista, m.pos_x, m.pos_y, m.alteracao ?? null, m.grau ?? null, vazioParaNulo(m.descricao));
  });

  const inserirMedida = db.prepare(
    'INSERT INTO medidas_corporais (ficha_id, tipo, regiao, inicio, durante, alta) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const medida of ficha.medidas) {
    if (medida.inicio === null && medida.durante === null && medida.alta === null) continue;
    inserirMedida.run(fichaId, medida.tipo, medida.regiao, medida.inicio, medida.durante, medida.alta);
  }

  const inserirEvolucao = db.prepare(
    'INSERT INTO evolucoes (ficha_id, data, descricao, assinatura_aluno) VALUES (?, ?, ?, ?)',
  );
  for (const evolucao of ficha.evolucoes) {
    if (!evolucao.descricao.trim() && !evolucao.data) continue;
    inserirEvolucao.run(fichaId, evolucao.data, evolucao.descricao.trim(), vazioParaNulo(evolucao.assinatura_aluno));
  }

  const assinatura = ficha.tcle.assinatura_png ? dataUrlParaBlob(ficha.tcle.assinatura_png).bytes : null;
  db.prepare('INSERT INTO tcle_aceites (ficha_id, aceito, assinatura_png, aceito_em) VALUES (?, ?, ?, ?)').run(
    fichaId,
    ficha.tcle.aceito ? 1 : 0,
    assinatura,
    ficha.tcle.aceito ? (ficha.tcle.aceito_em ?? agora()) : null,
  );
}

export function criarFicha(db: DatabaseSync, ficha: FichaPayload): SalvarResultado {
  return emTransacao(db, () => {
    const alunoId = obterOuCriarAluno(db, ficha.aluno.nome, ficha.aluno.email);
    const pacienteId = obterOuCriarPaciente(db, ficha);
    const { proxima } = db
      .prepare('SELECT COALESCE(MAX(versao), 0) + 1 AS proxima FROM fichas WHERE paciente_id = ? AND tipo = ?')
      .get(pacienteId, ficha.tipo) as { proxima: number };

    const resultado = db
      .prepare(
        `INSERT INTO fichas (paciente_id, aluno_id, tipo, versao, status, procedimento, data_avaliacao, queixa_principal, hda)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        pacienteId,
        alunoId,
        ficha.tipo,
        proxima,
        ficha.status,
        vazioParaNulo(ficha.procedimento),
        vazioParaNulo(ficha.identificacao.data_avaliacao),
        vazioParaNulo(ficha.queixa_principal),
        vazioParaNulo(ficha.hda),
      );
    const id = Number(resultado.lastInsertRowid);
    gravarDetalhes(db, id, ficha);
    return resumoSalvamento(db, id);
  });
}

export function atualizarFicha(db: DatabaseSync, id: number, ficha: FichaPayload): SalvarResultado {
  return emTransacao(db, () => {
    const atual = db
      .prepare('SELECT f.status, f.tipo, p.cpf FROM fichas f JOIN pacientes p ON p.id = f.paciente_id WHERE f.id = ?')
      .get(id) as { status: string; tipo: FichaTipo; cpf: string } | undefined;
    if (!atual) throw new ErroHttp(404, 'Ficha não encontrada.');
    if (atual.tipo !== ficha.tipo) throw new ErroHttp(409, 'O tipo da ficha não pode ser alterado.');
    if (atual.status === 'concluida') {
      throw new ErroHttp(409, 'Esta versão já foi concluída. Salve uma nova versão para registrar alterações.');
    }

    const alunoId = obterOuCriarAluno(db, ficha.aluno.nome, ficha.aluno.email);
    const pacienteId = obterOuCriarPaciente(db, ficha);
    db.prepare(
      `UPDATE fichas SET paciente_id = ?, aluno_id = ?, status = ?, procedimento = ?, data_avaliacao = ?,
              queixa_principal = ?, hda = ?, atualizado_em = ?
       WHERE id = ?`,
    ).run(
      pacienteId,
      alunoId,
      ficha.status,
      vazioParaNulo(ficha.procedimento),
      vazioParaNulo(ficha.identificacao.data_avaliacao),
      vazioParaNulo(ficha.queixa_principal),
      vazioParaNulo(ficha.hda),
      agora(),
      id,
    );
    gravarDetalhes(db, id, ficha);
    return resumoSalvamento(db, id);
  });
}

function resumoSalvamento(db: DatabaseSync, id: number): SalvarResultado {
  return db.prepare('SELECT id, versao, status, atualizado_em FROM fichas WHERE id = ?').get(id) as unknown as SalvarResultado;
}

export function obterFicha(db: DatabaseSync, id: number): FichaPayload | null {
  const f = db
    .prepare(
      `SELECT f.*, p.cpf, p.nome AS p_nome, p.endereco, p.bairro, p.cidade, p.telefones, p.nacionalidade, p.naturalidade,
              p.estado_civil, p.data_nascimento, p.profissao, p.email AS p_email, p.contato_emergencia,
              p.telefone_emergencia, a.nome AS a_nome, a.email AS a_email
       FROM fichas f
       JOIN pacientes p ON p.id = f.paciente_id
       JOIN alunos a ON a.id = f.aluno_id
       WHERE f.id = ?`,
    )
    .get(id) as Linha | undefined;
  if (!f) return null;

  const tipo = f.tipo as FichaTipo;
  const { tabela, colunas } = COLUNAS_POR_TIPO[tipo];
  const detalhe = (db.prepare(`SELECT * FROM ${tabela} WHERE ficha_id = ?`).get(id) ?? {}) as Linha;
  const campos: Record<string, ValorCampo> = {};
  for (const [nome, tipoColuna] of Object.entries(colunas)) campos[nome] = daColuna(detalhe[nome], tipoColuna);

  const opcoes: Record<string, string[]> = {};
  for (const linha of db.prepare('SELECT grupo, opcao FROM ficha_opcoes WHERE ficha_id = ? ORDER BY id').all(id) as Linha[]) {
    (opcoes[String(linha.grupo)] ??= []).push(String(linha.opcao));
  }

  const anexos: Anexo[] = (db.prepare('SELECT * FROM ficha_anexos WHERE ficha_id = ? ORDER BY id').all(id) as Linha[]).map((a) => ({
    id: `anexo-${a.id}`,
    nome_arquivo: String(a.nome_arquivo),
    tipo_mime: String(a.tipo_mime),
    tamanho_bytes: Number(a.tamanho_bytes),
    conteudo_base64: blobParaDataUrl(a.conteudo, String(a.tipo_mime)) ?? '',
  }));

  const marcacoes: Marcacao[] = (db.prepare('SELECT * FROM mapa_marcacoes WHERE ficha_id = ? ORDER BY ordem').all(id) as Linha[]).map((m) => ({
    id: `marcacao-${m.id}`,
    vista: String(m.vista),
    pos_x: Number(m.pos_x),
    pos_y: Number(m.pos_y),
    alteracao: m.alteracao === null ? null : String(m.alteracao),
    grau: m.grau === null ? null : String(m.grau),
    descricao: m.descricao === null ? '' : String(m.descricao),
  }));

  const medidas: Medida[] = (db.prepare('SELECT * FROM medidas_corporais WHERE ficha_id = ? ORDER BY id').all(id) as Linha[]).map((m) => ({
    tipo: m.tipo as Medida['tipo'],
    regiao: String(m.regiao),
    inicio: m.inicio === null ? null : Number(m.inicio),
    durante: m.durante === null ? null : Number(m.durante),
    alta: m.alta === null ? null : Number(m.alta),
  }));

  const evolucoes: Evolucao[] = (db.prepare('SELECT * FROM evolucoes WHERE ficha_id = ? ORDER BY data, id').all(id) as Linha[]).map((e) => ({
    id: `evolucao-${e.id}`,
    data: String(e.data),
    descricao: String(e.descricao),
    assinatura_aluno: e.assinatura_aluno === null ? '' : String(e.assinatura_aluno),
  }));

  const tcle = db.prepare('SELECT * FROM tcle_aceites WHERE ficha_id = ?').get(id) as Linha | undefined;
  const texto = (valor: unknown) => (valor === null || valor === undefined ? '' : String(valor));

  return {
    id: Number(f.id),
    tipo,
    versao: Number(f.versao),
    status: f.status as FichaPayload['status'],
    procedimento: texto(f.procedimento),
    aluno: { nome: texto(f.a_nome), email: texto(f.a_email) },
    paciente_cpf: texto(f.cpf),
    identificacao: {
      data_avaliacao: texto(f.data_avaliacao),
      nome: texto(f.p_nome),
      endereco: texto(f.endereco),
      bairro: texto(f.bairro),
      cidade: texto(f.cidade),
      telefones: texto(f.telefones),
      nacionalidade: texto(f.nacionalidade),
      naturalidade: texto(f.naturalidade),
      estado_civil: texto(f.estado_civil),
      data_nascimento: texto(f.data_nascimento),
      profissao: texto(f.profissao),
      email: texto(f.p_email),
      contato_emergencia: texto(f.contato_emergencia),
      telefone_emergencia: texto(f.telefone_emergencia),
    },
    queixa_principal: texto(f.queixa_principal),
    hda: texto(f.hda),
    campos,
    opcoes,
    anexos,
    marcacoes,
    medidas,
    evolucoes,
    tcle: {
      aceito: Number(tcle?.aceito ?? 0) === 1,
      assinatura_png: tcle ? blobParaDataUrl(tcle.assinatura_png, 'image/png') : null,
      aceito_em: tcle?.aceito_em ? String(tcle.aceito_em) : null,
    },
    criado_em: texto(f.criado_em),
    atualizado_em: texto(f.atualizado_em),
  };
}

export function obterUltimaFicha(db: DatabaseSync, cpf: string, tipo: FichaTipo): FichaPayload | null {
  const linha = db
    .prepare(
      `SELECT f.id FROM fichas f JOIN pacientes p ON p.id = f.paciente_id
       WHERE p.cpf = ? AND f.tipo = ? ORDER BY f.versao DESC LIMIT 1`,
    )
    .get(cpf, tipo) as { id: number } | undefined;
  return linha ? obterFicha(db, linha.id) : null;
}

export function listarFichas(db: DatabaseSync, filtros: { cpf?: string; tipo?: string }): FichaResumo[] {
  const condicoes: string[] = [];
  const parametros: string[] = [];
  if (filtros.cpf) {
    condicoes.push('paciente_cpf = ?');
    parametros.push(filtros.cpf);
  }
  if (filtros.tipo) {
    condicoes.push('tipo = ?');
    parametros.push(filtros.tipo);
  }
  const onde = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  return db
    .prepare(
      `SELECT id, tipo, versao, status, paciente_cpf, paciente_nome, atualizado_em
       FROM vw_fichas_resumo ${onde} ORDER BY atualizado_em DESC`,
    )
    .all(...parametros) as unknown as FichaResumo[];
}
