import type { FichaPayload } from '../../shared/types.ts';
import { COLUNAS_POR_TIPO, GRUPOS_POR_TIPO } from '../../shared/constants/schema.ts';
import { ErroHttp } from './erros.ts';

const TIPOS = ['facial', 'corporal'];
const STATUS = ['rascunho', 'concluida'];

function texto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

/** Valida a estrutura do documento recebido antes de gravar no banco. */
export function validarFicha(corpo: unknown): FichaPayload {
  const erros: string[] = [];
  if (!corpo || typeof corpo !== 'object') throw new ErroHttp(400, 'Corpo da requisição inválido.');
  const ficha = corpo as FichaPayload;

  if (!TIPOS.includes(ficha.tipo)) erros.push('tipo deve ser "facial" ou "corporal".');
  if (!STATUS.includes(ficha.status)) erros.push('status deve ser "rascunho" ou "concluida".');
  if (!texto(ficha.paciente_cpf) || ficha.paciente_cpf.trim() === '') erros.push('paciente_cpf é obrigatório.');
  if (!ficha.identificacao || !texto(ficha.identificacao.nome) || ficha.identificacao.nome.trim() === '') {
    erros.push('identificacao.nome é obrigatório.');
  }
  if (!ficha.aluno || !texto(ficha.aluno.email) || !texto(ficha.aluno.nome)) erros.push('aluno.nome e aluno.email são obrigatórios.');
  if (!ficha.campos || typeof ficha.campos !== 'object') erros.push('campos deve ser um objeto.');
  if (!ficha.opcoes || typeof ficha.opcoes !== 'object') erros.push('opcoes deve ser um objeto.');
  for (const lista of ['anexos', 'marcacoes', 'medidas', 'evolucoes'] as const) {
    if (!Array.isArray(ficha[lista])) erros.push(`${lista} deve ser uma lista.`);
  }
  if (!ficha.tcle || typeof ficha.tcle.aceito !== 'boolean') erros.push('tcle.aceito é obrigatório.');

  if (erros.length === 0) {
    const colunas = COLUNAS_POR_TIPO[ficha.tipo].colunas;
    for (const chave of Object.keys(ficha.campos)) {
      if (!(chave in colunas)) erros.push(`Campo desconhecido para a ficha ${ficha.tipo}: ${chave}.`);
    }
    const grupos = GRUPOS_POR_TIPO[ficha.tipo];
    for (const [grupo, valores] of Object.entries(ficha.opcoes)) {
      if (!grupos.includes(grupo)) erros.push(`Grupo de opções desconhecido: ${grupo}.`);
      if (!Array.isArray(valores) || !valores.every(texto)) erros.push(`opcoes.${grupo} deve ser uma lista de textos.`);
    }

    // Regras de negócio para concluir a versão.
    if (ficha.status === 'concluida') {
      if (!texto(ficha.queixa_principal) || ficha.queixa_principal.trim() === '') erros.push('Queixa principal é obrigatória para concluir a ficha.');
      if (!ficha.tcle.aceito) erros.push('O aceite do TCLE é obrigatório para concluir a ficha.');
      if (!ficha.tcle.assinatura_png) erros.push('A assinatura do paciente é obrigatória para concluir a ficha.');
    }
  }

  if (erros.length > 0) throw new ErroHttp(422, 'Dados da ficha inválidos.', erros);
  return ficha;
}
