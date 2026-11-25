import type { Anexo, Evolucao, Identificacao, Marcacao, TipoMedida, Tcle, ValorCampo } from '@shared/types.ts';

/** Linha da tabela de medidas mantida como texto durante a edição. */
export interface MedidaEstado {
  tipo: TipoMedida;
  regiao: string;
  inicio: string;
  durante: string;
  alta: string;
}

/** Estado editável de uma ficha no navegador. */
export interface EstadoFicha {
  identificacao: Identificacao;
  queixa_principal: string;
  hda: string;
  campos: Record<string, ValorCampo>;
  opcoes: Record<string, string[]>;
  anexos: Anexo[];
  marcacoes: Marcacao[];
  medidas: MedidaEstado[];
  evolucoes: Evolucao[];
  tcle: Tcle;
}

export type ChavePendencia = 'queixa' | 'aceite' | 'assinatura';
