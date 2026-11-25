import sql from 'mssql';
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
import { ErroHttp } from './erros.ts';

type Linha = Record<string, unknown>;

function vazioParaNulo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const limpo = valor.trim();
  return limpo === '' ? null : limpo;
}

function dataUrlParaBuffer(dataUrl: string): { mime: string; buffer: Buffer } {
  const correspondencia = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!correspondencia) throw new ErroHttp(422, 'Arquivo em formato inválido (esperado data URL base64).');
  const [, mime = 'application/octet-stream', base64, conteudo] = correspondencia;
  const buffer = base64 ? Buffer.from(conteudo, 'base64') : Buffer.from(decodeURIComponent(conteudo));
  return { mime, buffer };
}

function bufferParaDataUrl(buffer: unknown, mime: string): string | null {
  if (!buffer) return null;
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as Uint8Array);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function paraColunaSql(valor: ValorCampo | undefined, tipo: TipoColuna): unknown {
  if (valor === undefined || valor === null || valor === '') return null;
  if (tipo === 'INTEGER' && typeof valor === 'boolean') return valor ? 1 : 0;
  if (tipo === 'TEXT') return String(valor).trim() || null;
  const numero = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

function daColunaSql(valor: unknown, tipo: TipoColuna): ValorCampo {
  if (valor === null || valor === undefined) return null;
  if (tipo === 'INTEGER') return Number(valor) === 1;
  if (tipo === 'REAL') return Number(valor);
  return String(valor);
}

async function obterOuCriarAlunoSql(tx: sql.Transaction, nome: string, email: string): Promise<number> {
  const req = tx.request();
  req.input('nome', sql.NVarChar(255), nome.trim());
  req.input('email', sql.NVarChar(255), email.trim());
  const res = await req.query(`
    MERGE dbo.alunos AS target
    USING (SELECT @email AS email, @nome AS nome) AS source
    ON (target.email = source.email)
    WHEN MATCHED THEN
        UPDATE SET nome = source.nome
    WHEN NOT MATCHED THEN
        INSERT (nome, email) VALUES (source.nome, source.email);
    SELECT id FROM dbo.alunos WHERE email = @email;
  `);
  return res.recordset[0].id;
}

async function obterOuCriarPacienteSql(tx: sql.Transaction, ficha: FichaPayload): Promise<number> {
  const i = ficha.identificacao;
  const req = tx.request();
  req.input('cpf', sql.NVarChar(20), ficha.paciente_cpf.trim());
  req.input('nome', sql.NVarChar(255), i.nome.trim());
  req.input('endereco', sql.NVarChar(255), vazioParaNulo(i.endereco));
  req.input('bairro', sql.NVarChar(100), vazioParaNulo(i.bairro));
  req.input('cidade', sql.NVarChar(100), vazioParaNulo(i.cidade));
  req.input('telefones', sql.NVarChar(100), vazioParaNulo(i.telefones));
  req.input('nacionalidade', sql.NVarChar(100), vazioParaNulo(i.nacionalidade));
  req.input('naturalidade', sql.NVarChar(100), vazioParaNulo(i.naturalidade));
  req.input('estado_civil', sql.NVarChar(50), vazioParaNulo(i.estado_civil));
  req.input('data_nascimento', sql.NVarChar(20), vazioParaNulo(i.data_nascimento));
  req.input('profissao', sql.NVarChar(100), vazioParaNulo(i.profissao));
  req.input('email', sql.NVarChar(255), vazioParaNulo(i.email));
  req.input('contato_emergencia', sql.NVarChar(100), vazioParaNulo(i.contato_emergencia));
  req.input('telefone_emergencia', sql.NVarChar(100), vazioParaNulo(i.telefone_emergencia));

  const res = await req.query(`
    MERGE dbo.pacientes AS target
    USING (SELECT @cpf AS cpf) AS source
    ON (target.cpf = source.cpf)
    WHEN MATCHED THEN
        UPDATE SET nome = @nome, endereco = @endereco, bairro = @bairro, cidade = @cidade,
                   telefones = @telefones, nacionalidade = @nacionalidade, naturalidade = @naturalidade,
                   estado_civil = @estado_civil, data_nascimento = @data_nascimento, profissao = @profissao,
                   email = @email, contato_emergencia = @contato_emergencia, telefone_emergencia = @telefone_emergencia,
                   atualizado_em = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (cpf, nome, endereco, bairro, cidade, telefones, nacionalidade, naturalidade,
                estado_civil, data_nascimento, profissao, email, contato_emergencia, telefone_emergencia)
        VALUES (@cpf, @nome, @endereco, @bairro, @cidade, @telefones, @nacionalidade, @naturalidade,
                @estado_civil, @data_nascimento, @profissao, @email, @contato_emergencia, @telefone_emergencia);
    SELECT id FROM dbo.pacientes WHERE cpf = @cpf;
  `);
  return res.recordset[0].id;
}

async function gravarDetalhesSql(tx: sql.Transaction, fichaId: number, ficha: FichaPayload) {
  const { tabela, colunas } = COLUNAS_POR_TIPO[ficha.tipo];

  // Exclui detalhes anteriores (idempotência para atualização)
  const reqDel = tx.request();
  reqDel.input('fichaId', sql.Int, fichaId);
  await reqDel.query(`
    DELETE FROM dbo.${tabela} WHERE ficha_id = @fichaId;
    DELETE FROM dbo.ficha_opcoes WHERE ficha_id = @fichaId;
    DELETE FROM dbo.ficha_anexos WHERE ficha_id = @fichaId;
    DELETE FROM dbo.mapa_marcacoes WHERE ficha_id = @fichaId;
    DELETE FROM dbo.medidas_corporais WHERE ficha_id = @fichaId;
    DELETE FROM dbo.evolucoes WHERE ficha_id = @fichaId;
    DELETE FROM dbo.tcle_aceites WHERE ficha_id = @fichaId;
  `);

  // Insere tabela específica (ficha_facial ou ficha_corporal)
  const nomes = Object.keys(colunas);
  const reqDet = tx.request();
  reqDet.input('fichaId', sql.Int, fichaId);
  for (const nome of nomes) {
    const val = paraColunaSql(ficha.campos[nome], colunas[nome]);
    reqDet.input(nome, val);
  }
  await reqDet.query(`
    INSERT INTO dbo.${tabela} (ficha_id${nomes.map((n) => `, ${n}`).join('')})
    VALUES (@fichaId${nomes.map((n) => `, @${n}`).join('')})
  `);

  // Opções de múltipla escolha
  for (const [grupo, valores] of Object.entries(ficha.opcoes)) {
    for (const opcao of valores) {
      const r = tx.request();
      r.input('fichaId', sql.Int, fichaId);
      r.input('grupo', sql.NVarChar(100), grupo);
      r.input('opcao', sql.NVarChar(100), opcao);
      await r.query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.ficha_opcoes WHERE ficha_id = @fichaId AND grupo = @grupo AND opcao = @opcao)
        BEGIN
            INSERT INTO dbo.ficha_opcoes (ficha_id, grupo, opcao) VALUES (@fichaId, @grupo, @opcao);
        END
      `);
    }
  }

  // Anexos
  for (const anexo of ficha.anexos) {
    const { mime, buffer } = dataUrlParaBuffer(anexo.conteudo_base64);
    const r = tx.request();
    r.input('fichaId', sql.Int, fichaId);
    r.input('nome_arquivo', sql.NVarChar(255), anexo.nome_arquivo);
    r.input('tipo_mime', sql.NVarChar(100), anexo.tipo_mime || mime);
    r.input('tamanho_bytes', sql.Int, buffer.length);
    r.input('conteudo', sql.VarBinary(sql.MAX), buffer);
    await r.query(`
      INSERT INTO dbo.ficha_anexos (ficha_id, nome_arquivo, tipo_mime, tamanho_bytes, conteudo)
      VALUES (@fichaId, @nome_arquivo, @tipo_mime, @tamanho_bytes, @conteudo)
    `);
  }

  // Marcações de mapa
  let ordem = 1;
  for (const m of ficha.marcacoes) {
    const r = tx.request();
    r.input('fichaId', sql.Int, fichaId);
    r.input('ordem', sql.Int, ordem++);
    r.input('vista', sql.NVarChar(50), m.vista);
    r.input('pos_x', sql.Float, m.pos_x);
    r.input('pos_y', sql.Float, m.pos_y);
    r.input('alteracao', sql.NVarChar(50), m.alteracao ?? null);
    r.input('grau', sql.NVarChar(20), m.grau ?? null);
    r.input('descricao', sql.NVarChar(sql.MAX), vazioParaNulo(m.descricao));
    await r.query(`
      INSERT INTO dbo.mapa_marcacoes (ficha_id, ordem, vista, pos_x, pos_y, alteracao, grau, descricao)
      VALUES (@fichaId, @ordem, @vista, @pos_x, @pos_y, @alteracao, @grau, @descricao)
    `);
  }

  // Medidas Corporais
  for (const medida of ficha.medidas) {
    if (medida.inicio === null && medida.durante === null && medida.alta === null) continue;
    const r = tx.request();
    r.input('fichaId', sql.Int, fichaId);
    r.input('tipo', sql.NVarChar(20), medida.tipo);
    r.input('regiao', sql.NVarChar(100), medida.regiao);
    r.input('inicio', sql.Float, medida.inicio);
    r.input('durante', sql.Float, medida.durante);
    r.input('alta', sql.Float, medida.alta);
    await r.query(`
      INSERT INTO dbo.medidas_corporais (ficha_id, tipo, regiao, inicio, durante, alta)
      VALUES (@fichaId, @tipo, @regiao, @inicio, @durante, @alta)
    `);
  }

  // Evoluções
  for (const evo of ficha.evolucoes) {
    if (!evo.descricao.trim() && !evo.data) continue;
    const r = tx.request();
    r.input('fichaId', sql.Int, fichaId);
    r.input('data', sql.NVarChar(30), evo.data);
    r.input('descricao', sql.NVarChar(sql.MAX), evo.descricao.trim());
    r.input('assinatura', sql.NVarChar(255), vazioParaNulo(evo.assinatura_aluno));
    await r.query(`
      INSERT INTO dbo.evolucoes (ficha_id, data, descricao, assinatura_aluno)
      VALUES (@fichaId, @data, @descricao, @assinatura)
    `);
  }

  // TCLE e Assinatura
  const assinaturaBuf = ficha.tcle.assinatura_png ? dataUrlParaBuffer(ficha.tcle.assinatura_png).buffer : null;
  const rTcle = tx.request();
  rTcle.input('fichaId', sql.Int, fichaId);
  rTcle.input('aceito', sql.TinyInt, ficha.tcle.aceito ? 1 : 0);
  rTcle.input('assinatura', sql.VarBinary(sql.MAX), assinaturaBuf);
  rTcle.input('aceito_em', sql.NVarChar(50), ficha.tcle.aceito ? (ficha.tcle.aceito_em ?? new Date().toISOString()) : null);
  await rTcle.query(`
    INSERT INTO dbo.tcle_aceites (ficha_id, aceito, assinatura_png, aceito_em)
    VALUES (@fichaId, @aceito, @assinatura, @aceito_em)
  `);
}

export async function criarFichaSql(pool: sql.ConnectionPool, ficha: FichaPayload): Promise<SalvarResultado> {
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const alunoId = await obterOuCriarAlunoSql(tx, ficha.aluno.nome, ficha.aluno.email);
    const pacienteId = await obterOuCriarPacienteSql(tx, ficha);

    const reqVersao = tx.request();
    reqVersao.input('pacienteId', sql.Int, pacienteId);
    reqVersao.input('tipo', sql.NVarChar(20), ficha.tipo);
    const resVersao = await reqVersao.query(`
      SELECT ISNULL(MAX(versao), 0) + 1 AS proxima FROM dbo.fichas WHERE paciente_id = @pacienteId AND tipo = @tipo
    `);
    const proxima = resVersao.recordset[0].proxima;

    const reqFicha = tx.request();
    reqFicha.input('pacienteId', sql.Int, pacienteId);
    reqFicha.input('alunoId', sql.Int, alunoId);
    reqFicha.input('tipo', sql.NVarChar(20), ficha.tipo);
    reqFicha.input('versao', sql.Int, proxima);
    reqFicha.input('status', sql.NVarChar(20), ficha.status);
    reqFicha.input('procedimento', sql.NVarChar(255), vazioParaNulo(ficha.procedimento));
    reqFicha.input('data_avaliacao', sql.NVarChar(30), vazioParaNulo(ficha.identificacao.data_avaliacao));
    reqFicha.input('queixa_principal', sql.NVarChar(sql.MAX), vazioParaNulo(ficha.queixa_principal));
    reqFicha.input('hda', sql.NVarChar(sql.MAX), vazioParaNulo(ficha.hda));

    const resFicha = await reqFicha.query(`
      INSERT INTO dbo.fichas (paciente_id, aluno_id, tipo, versao, status, procedimento, data_avaliacao, queixa_principal, hda)
      OUTPUT INSERTED.id, INSERTED.versao, INSERTED.status, INSERTED.atualizado_em
      VALUES (@pacienteId, @alunoId, @tipo, @versao, @status, @procedimento, @data_avaliacao, @queixa_principal, @hda)
    `);

    const id = resFicha.recordset[0].id;
    await gravarDetalhesSql(tx, id, ficha);

    await tx.commit();
    return {
      id,
      versao: resFicha.recordset[0].versao,
      status: resFicha.recordset[0].status,
      atualizado_em: resFicha.recordset[0].atualizado_em.toISOString(),
    };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export async function atualizarFichaSql(pool: sql.ConnectionPool, id: number, ficha: FichaPayload): Promise<SalvarResultado> {
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const reqAtual = tx.request();
    reqAtual.input('id', sql.Int, id);
    const resAtual = await reqAtual.query(`
      SELECT f.status, f.tipo, p.cpf FROM dbo.fichas f JOIN dbo.pacientes p ON p.id = f.paciente_id WHERE f.id = @id
    `);
    const atual = resAtual.recordset[0];
    if (!atual) throw new ErroHttp(404, 'Ficha não encontrada.');
    if (atual.tipo !== ficha.tipo) throw new ErroHttp(409, 'O tipo da ficha não pode ser alterado.');
    if (atual.status === 'concluida') {
      throw new ErroHttp(409, 'Esta versão já foi concluída. Salve uma nova versão para registrar alterações.');
    }

    const alunoId = await obterOuCriarAlunoSql(tx, ficha.aluno.nome, ficha.aluno.email);
    const pacienteId = await obterOuCriarPacienteSql(tx, ficha);

    const reqUpdate = tx.request();
    reqUpdate.input('id', sql.Int, id);
    reqUpdate.input('pacienteId', sql.Int, pacienteId);
    reqUpdate.input('alunoId', sql.Int, alunoId);
    reqUpdate.input('status', sql.NVarChar(20), ficha.status);
    reqUpdate.input('procedimento', sql.NVarChar(255), vazioParaNulo(ficha.procedimento));
    reqUpdate.input('data_avaliacao', sql.NVarChar(30), vazioParaNulo(ficha.identificacao.data_avaliacao));
    reqUpdate.input('queixa_principal', sql.NVarChar(sql.MAX), vazioParaNulo(ficha.queixa_principal));
    reqUpdate.input('hda', sql.NVarChar(sql.MAX), vazioParaNulo(ficha.hda));

    const resUpdate = await reqUpdate.query(`
      UPDATE dbo.fichas
      SET paciente_id = @pacienteId, aluno_id = @alunoId, status = @status, procedimento = @procedimento,
          data_avaliacao = @data_avaliacao, queixa_principal = @queixa_principal, hda = @hda,
          atualizado_em = SYSUTCDATETIME()
      OUTPUT INSERTED.id, INSERTED.versao, INSERTED.status, INSERTED.atualizado_em
      WHERE id = @id
    `);

    await gravarDetalhesSql(tx, id, ficha);
    await tx.commit();

    return {
      id,
      versao: resUpdate.recordset[0].versao,
      status: resUpdate.recordset[0].status,
      atualizado_em: resUpdate.recordset[0].atualizado_em.toISOString(),
    };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export async function obterFichaSql(pool: sql.ConnectionPool, id: number): Promise<FichaPayload | null> {
  const req = pool.request();
  req.input('id', sql.Int, id);
  const res = await req.query(`
    SELECT f.*, p.cpf, p.nome AS p_nome, p.endereco, p.bairro, p.cidade, p.telefones, p.nacionalidade, p.naturalidade,
           p.estado_civil, p.data_nascimento, p.profissao, p.email AS p_email, p.contato_emergencia,
           p.telefone_emergencia, a.nome AS a_nome, a.email AS a_email
    FROM dbo.fichas f
    JOIN dbo.pacientes p ON p.id = f.paciente_id
    JOIN dbo.alunos a ON a.id = f.aluno_id
    WHERE f.id = @id
  `);

  const f = res.recordset[0] as Linha | undefined;
  if (!f) return null;

  const tipo = f.tipo as FichaTipo;
  const { tabela, colunas } = COLUNAS_POR_TIPO[tipo];

  const reqDet = pool.request();
  reqDet.input('id', sql.Int, id);
  const resDet = await reqDet.query(`SELECT * FROM dbo.${tabela} WHERE ficha_id = @id`);
  const detalhe = (resDet.recordset[0] ?? {}) as Linha;

  const campos: Record<string, ValorCampo> = {};
  for (const [nome, tipoColuna] of Object.entries(colunas)) {
    campos[nome] = daColunaSql(detalhe[nome], tipoColuna);
  }

  const reqOp = pool.request();
  reqOp.input('id', sql.Int, id);
  const resOp = await reqOp.query('SELECT grupo, opcao FROM dbo.ficha_opcoes WHERE ficha_id = @id ORDER BY id');
  const opcoes: Record<string, string[]> = {};
  for (const linha of resOp.recordset) {
    (opcoes[String(linha.grupo)] ??= []).push(String(linha.opcao));
  }

  const reqAnexos = pool.request();
  reqAnexos.input('id', sql.Int, id);
  const resAnexos = await reqAnexos.query('SELECT * FROM dbo.ficha_anexos WHERE ficha_id = @id ORDER BY id');
  const anexos: Anexo[] = resAnexos.recordset.map((a: Linha) => ({
    id: `anexo-${a.id}`,
    nome_arquivo: String(a.nome_arquivo),
    tipo_mime: String(a.tipo_mime),
    tamanho_bytes: Number(a.tamanho_bytes),
    conteudo_base64: bufferParaDataUrl(a.conteudo, String(a.tipo_mime)) ?? '',
  }));

  const reqMarc = pool.request();
  reqMarc.input('id', sql.Int, id);
  const resMarc = await reqMarc.query('SELECT * FROM dbo.mapa_marcacoes WHERE ficha_id = @id ORDER BY ordem');
  const marcacoes: Marcacao[] = resMarc.recordset.map((m: Linha) => ({
    id: `marcacao-${m.id}`,
    vista: String(m.vista),
    pos_x: Number(m.pos_x),
    pos_y: Number(m.pos_y),
    alteracao: m.alteracao === null ? null : String(m.alteracao),
    grau: m.grau === null ? null : String(m.grau),
    descricao: m.descricao === null ? '' : String(m.descricao),
  }));

  const reqMed = pool.request();
  reqMed.input('id', sql.Int, id);
  const resMed = await reqMed.query('SELECT * FROM dbo.medidas_corporais WHERE ficha_id = @id ORDER BY id');
  const medidas: Medida[] = resMed.recordset.map((m: Linha) => ({
    tipo: m.tipo as Medida['tipo'],
    regiao: String(m.regiao),
    inicio: m.inicio === null ? null : Number(m.inicio),
    durante: m.durante === null ? null : Number(m.durante),
    alta: m.alta === null ? null : Number(m.alta),
  }));

  const reqEvo = pool.request();
  reqEvo.input('id', sql.Int, id);
  const resEvo = await reqEvo.query('SELECT * FROM dbo.evolucoes WHERE ficha_id = @id ORDER BY data, id');
  const evolucoes: Evolucao[] = resEvo.recordset.map((e: Linha) => ({
    id: `evolucao-${e.id}`,
    data: String(e.data),
    descricao: String(e.descricao),
    assinatura_aluno: e.assinatura_aluno === null ? '' : String(e.assinatura_aluno),
  }));

  const reqTcle = pool.request();
  reqTcle.input('id', sql.Int, id);
  const resTcle = await reqTcle.query('SELECT * FROM dbo.tcle_aceites WHERE ficha_id = @id');
  const tcle = resTcle.recordset[0] as Linha | undefined;

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
      aceito: Number(tcle?.aceito) === 1,
      assinatura_png: tcle?.assinatura_png ? bufferParaDataUrl(tcle.assinatura_png, 'image/png') : null,
      aceito_em: tcle?.aceito_em ? String(tcle.aceito_em) : null,
    },
    criado_em: f.criado_em ? (f.criado_em as Date).toISOString() : undefined,
    atualizado_em: f.atualizado_em ? (f.atualizado_em as Date).toISOString() : undefined,
  };
}

export async function obterUltimaFichaSql(
  pool: sql.ConnectionPool,
  cpf: string,
  tipo: FichaTipo,
): Promise<FichaPayload | null> {
  const req = pool.request();
  req.input('cpf', sql.NVarChar(20), cpf.trim());
  req.input('tipo', sql.NVarChar(20), tipo);
  const res = await req.query(`
    SELECT TOP 1 f.id
    FROM dbo.fichas f
    JOIN dbo.pacientes p ON p.id = f.paciente_id
    WHERE p.cpf = @cpf AND f.tipo = @tipo
    ORDER BY f.versao DESC
  `);
  if (!res.recordset[0]) return null;
  return obterFichaSql(pool, res.recordset[0].id);
}

export async function listarFichasSql(
  pool: sql.ConnectionPool,
  filtro?: { cpf?: string; tipo?: string },
): Promise<FichaResumo[]> {
  const req = pool.request();
  let where = 'WHERE 1=1';
  if (filtro?.cpf) {
    req.input('cpf', sql.NVarChar(20), filtro.cpf.trim());
    where += ' AND paciente_cpf = @cpf';
  }
  if (filtro?.tipo) {
    req.input('tipo', sql.NVarChar(20), filtro.tipo.trim());
    where += ' AND tipo = @tipo';
  }
  const res = await req.query(`
    SELECT id, tipo, versao, status, paciente_cpf, paciente_nome, atualizado_em
    FROM dbo.vw_fichas_resumo
    ${where}
    ORDER BY atualizado_em DESC
  `);
  return res.recordset.map((r: Linha) => ({
    id: Number(r.id),
    tipo: r.tipo as FichaTipo,
    versao: Number(r.versao),
    status: r.status as FichaResumo['status'],
    paciente_cpf: String(r.paciente_cpf),
    paciente_nome: String(r.paciente_nome),
    atualizado_em: (r.atualizado_em as Date).toISOString(),
  }));
}
