import type { FichaPayload, FichaTipo, SalvarResultado } from '@shared/types.ts';
import { API_URL } from './config.ts';
import { api, ApiIndisponivel } from './api.ts';
import { armazenamentoLocal } from './armazenamentoLocal.ts';

export type Origem = 'api' | 'local';

export interface RefFicha {
  id: number;
  origem: Origem;
}

export interface FichaCarregada {
  ficha: FichaPayload;
  origem: Origem;
}

export interface ResultadoSalvar extends SalvarResultado {
  origem: Origem;
}

export const apiConfigurada = API_URL !== null;

/** Busca a versão mais recente da ficha do paciente (API primeiro, depois navegador). */
export async function carregarUltimaFicha(cpf: string, tipo: FichaTipo): Promise<FichaCarregada | null> {
  if (apiConfigurada) {
    try {
      const ficha = await api.ultima(cpf, tipo);
      if (ficha) return { ficha, origem: 'api' };
    } catch (erro) {
      if (!(erro instanceof ApiIndisponivel)) throw erro;
    }
  }
  const local = armazenamentoLocal.ultima(cpf, tipo);
  return local ? { ficha: local, origem: 'local' } : null;
}

/**
 * Grava a ficha no banco local (SQLite via API). Se a API não responder,
 * grava no navegador e marca para sincronização posterior.
 */
export async function salvarFicha(ficha: FichaPayload, ref: RefFicha | null): Promise<ResultadoSalvar> {
  if (apiConfigurada) {
    try {
      const resultado =
        ref?.origem === 'api' ? await api.atualizar(ref.id, ficha) : await api.criar(ficha);
      if (ref?.origem === 'local') armazenamentoLocal.remover(ref.id);
      return { ...resultado, origem: 'api' };
    } catch (erro) {
      if (!(erro instanceof ApiIndisponivel)) throw erro;
    }
  }
  const idLocal = ref?.origem === 'local' ? ref.id : null;
  return { ...armazenamentoLocal.salvar(ficha, idLocal), origem: 'local' };
}

/** Envia para a API as fichas que ficaram gravadas apenas no navegador. */
export async function sincronizarPendentes(): Promise<number> {
  if (!apiConfigurada) return 0;
  const pendentes = armazenamentoLocal.pendentes();
  if (pendentes.length === 0 || !(await api.saude())) return 0;

  let enviadas = 0;
  for (const ficha of pendentes) {
    try {
      await api.criar(ficha);
      armazenamentoLocal.remover(ficha.id);
      enviadas += 1;
    } catch {
      // Mantém a ficha no navegador para nova tentativa.
    }
  }
  return enviadas;
}
