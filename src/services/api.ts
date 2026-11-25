import type { FichaPayload, FichaTipo, SalvarResultado } from '@shared/types.ts';
import { API_URL, TEMPO_LIMITE_API_MS } from './config.ts';

/** Erro de regra/validação devolvido pela API (não deve cair no modo local). */
export class ErroApi extends Error {
  status: number;
  detalhes: string[];

  constructor(status: number, mensagem: string, detalhes: string[] = []) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

/** A API não respondeu (servidor desligado, rede, tempo esgotado). */
export class ApiIndisponivel extends Error {}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiIndisponivel('API não configurada.');
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_API_MS);
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
      signal: controle.signal,
    });
  } catch {
    throw new ApiIndisponivel('Não foi possível conectar à API local.');
  } finally {
    clearTimeout(temporizador);
  }

  // Proxy do Vite sem API ativa responde 502/504.
  if (resposta.status === 502 || resposta.status === 503 || resposta.status === 504) {
    throw new ApiIndisponivel('A API local está desligada.');
  }

  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, corpo?.erro ?? `Erro ${resposta.status}`, corpo?.detalhes ?? []);
  }
  return corpo as T;
}

export const api = {
  async saude(): Promise<boolean> {
    try {
      const resposta = await requisitar<{ ok: boolean }>('/health');
      return resposta.ok === true;
    } catch {
      return false;
    }
  },

  async ultima(cpf: string, tipo: FichaTipo): Promise<FichaPayload | null> {
    try {
      return await requisitar<FichaPayload>(`/fichas/ultima?cpf=${encodeURIComponent(cpf)}&tipo=${tipo}`);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 404) return null;
      throw erro;
    }
  },

  criar(ficha: FichaPayload): Promise<SalvarResultado> {
    return requisitar<SalvarResultado>('/fichas', { method: 'POST', body: JSON.stringify({ ...ficha, id: null }) });
  },

  atualizar(id: number, ficha: FichaPayload): Promise<SalvarResultado> {
    return requisitar<SalvarResultado>(`/fichas/${id}`, { method: 'PUT', body: JSON.stringify({ ...ficha, id }) });
  },
};
