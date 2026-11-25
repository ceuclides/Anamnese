import type { FichaPayload, FichaTipo, SalvarResultado } from '@shared/types.ts';
import { CHAVE_ARMAZENAMENTO_LOCAL } from './config.ts';
import { ErroApi } from './api.ts';

interface RegistroLocal extends FichaPayload {
  id: number;
  /** Ainda não foi enviado para a API local. */
  pendente_sincronizacao: boolean;
}

interface Base {
  sequencia: number;
  fichas: RegistroLocal[];
}

function ler(): Base {
  try {
    const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO_LOCAL);
    if (bruto) return JSON.parse(bruto) as Base;
  } catch {
    // Armazenamento corrompido ou indisponível: recomeça vazio.
  }
  return { sequencia: 0, fichas: [] };
}

function gravar(base: Base) {
  try {
    localStorage.setItem(CHAVE_ARMAZENAMENTO_LOCAL, JSON.stringify(base));
  } catch {
    throw new ErroApi(507, 'Espaço insuficiente no navegador. Remova anexos grandes ou conecte a API local.');
  }
}

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Banco de reserva no navegador, com as mesmas regras de versão da API. */
export const armazenamentoLocal = {
  ultima(cpf: string, tipo: FichaTipo): FichaPayload | null {
    const candidatas = ler().fichas.filter((f) => f.paciente_cpf === cpf && f.tipo === tipo);
    candidatas.sort((a, b) => b.versao - a.versao);
    return candidatas[0] ?? null;
  },

  salvar(ficha: FichaPayload, id: number | null): SalvarResultado {
    const base = ler();
    const momento = agora();

    if (id !== null) {
      const indice = base.fichas.findIndex((f) => f.id === id);
      if (indice >= 0) {
        const atual = base.fichas[indice];
        if (atual.status === 'concluida') {
          throw new ErroApi(409, 'Esta versão já foi concluída. Salve uma nova versão para registrar alterações.');
        }
        base.fichas[indice] = { ...ficha, id, versao: atual.versao, criado_em: atual.criado_em, atualizado_em: momento, pendente_sincronizacao: true };
        gravar(base);
        return { id, versao: atual.versao, status: ficha.status, atualizado_em: momento };
      }
    }

    const versao =
      Math.max(0, ...base.fichas.filter((f) => f.paciente_cpf === ficha.paciente_cpf && f.tipo === ficha.tipo).map((f) => f.versao)) + 1;
    const novoId = base.sequencia + 1;
    base.sequencia = novoId;
    base.fichas.push({ ...ficha, id: novoId, versao, criado_em: momento, atualizado_em: momento, pendente_sincronizacao: true });
    gravar(base);
    return { id: novoId, versao, status: ficha.status, atualizado_em: momento };
  },

  pendentes(): RegistroLocal[] {
    return ler()
      .fichas.filter((f) => f.pendente_sincronizacao)
      .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.versao - b.versao);
  },

  remover(id: number) {
    const base = ler();
    base.fichas = base.fichas.filter((f) => f.id !== id);
    gravar(base);
  },
};
