import { colunasDosBlocos, gruposDosBlocos, type TipoColuna } from '../forms.ts';
import type { FichaTipo } from '../types.ts';
import { FACIAL_BLOCOS } from './facial.ts';
import { CORPORAL_BLOCOS, CORPORAL_COLUNAS_EXTRAS } from './corporal.ts';

/** Tabela de detalhe e colunas escalares de cada tipo de ficha. */
export const COLUNAS_POR_TIPO: Record<FichaTipo, { tabela: string; colunas: Record<string, TipoColuna> }> = {
  facial: { tabela: 'ficha_facial', colunas: colunasDosBlocos(FACIAL_BLOCOS) },
  corporal: {
    tabela: 'ficha_corporal',
    colunas: { ...colunasDosBlocos(CORPORAL_BLOCOS), ...CORPORAL_COLUNAS_EXTRAS },
  },
};

/** Grupos de múltipla escolha aceitos em ficha_opcoes, por tipo. */
export const GRUPOS_POR_TIPO: Record<FichaTipo, string[]> = {
  facial: gruposDosBlocos(FACIAL_BLOCOS),
  corporal: gruposDosBlocos(CORPORAL_BLOCOS),
};
