/**
 * Linguagem declarativa usada para descrever os blocos de campos das fichas.
 * O front-end renderiza os blocos e a API usa as mesmas definições para
 * mapear cada campo para sua coluna no banco.
 */

export interface Opcao {
  valor: string;
  rotulo: string;
}

interface CampoBase {
  /** Largura em colunas do grid do bloco. */
  span?: number;
}

export interface CampoTexto extends CampoBase {
  tipo: 'texto' | 'email';
  chave: string;
  rotulo: string;
  placeholder?: string;
}

export interface CampoNumero extends CampoBase {
  tipo: 'numero';
  chave: string;
  rotulo: string;
  sufixo?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  passo?: number;
}

export interface CampoArea extends CampoBase {
  tipo: 'area';
  chave: string;
  rotulo: string;
  placeholder?: string;
  /** Linhas visíveis (2 = 70px, 3 = 95px, 4 = 119px no design). */
  linhas?: number;
}

export interface CampoSimNao extends CampoBase {
  tipo: 'simnao';
  chave: string;
  rotulo: string;
  /** Botões com largura mínima de 56px (padrão da seção Antecedentes pessoais). */
  largo?: boolean;
}

export interface CampoRadio extends CampoBase {
  tipo: 'radio';
  chave: string;
  rotulo?: string;
  opcoes: Opcao[];
  /** "grade" organiza as opções em duas colunas; padrão é quebra de linha. */
  disposicao?: 'fluxo' | 'grade';
}

export interface CampoChecks extends CampoBase {
  tipo: 'checks';
  /** Grupo gravado em ficha_opcoes.grupo. */
  grupo: string;
  rotulo?: string;
  opcoes: Opcao[];
  disposicao?: 'fluxo' | 'grade';
}

export type Campo = CampoTexto | CampoNumero | CampoArea | CampoSimNao | CampoRadio | CampoChecks;

export interface Bloco {
  id: string;
  /** Subtítulo em caixa alta com marcador laranja. */
  subtitulo?: string;
  colunas: 1 | 2 | 3;
  gapX: number;
  gapY: number;
  /** Fundo cinza-claro com contorno (ex.: bloco de Pressão arterial). */
  painel?: boolean;
  larguraMaxima?: number;
  campos: Campo[];
}

export interface SecaoInfo {
  id: string;
  numero: number;
  titulo: string;
  /** Rótulo curto usado na navegação lateral. */
  rotuloNav: string;
  icone: string;
  descricao?: string;
}

export type TipoColuna = 'TEXT' | 'REAL' | 'INTEGER';

/** Lista as colunas escalares (nome → tipo SQLite) declaradas em um conjunto de blocos. */
export function colunasDosBlocos(blocos: Bloco[]): Record<string, TipoColuna> {
  const colunas: Record<string, TipoColuna> = {};
  for (const bloco of blocos) {
    for (const campo of bloco.campos) {
      switch (campo.tipo) {
        case 'texto':
        case 'email':
        case 'area':
        case 'radio':
          colunas[campo.chave] = 'TEXT';
          break;
        case 'numero':
          colunas[campo.chave] = 'REAL';
          break;
        case 'simnao':
          colunas[campo.chave] = 'INTEGER';
          break;
        case 'checks':
          break;
      }
    }
  }
  return colunas;
}

/** Lista os grupos de múltipla escolha declarados em um conjunto de blocos. */
export function gruposDosBlocos(blocos: Bloco[]): string[] {
  return blocos.flatMap((bloco) =>
    bloco.campos.flatMap((campo) => (campo.tipo === 'checks' ? [campo.grupo] : [])),
  );
}

export function opcoes(...rotulos: [valor: string, rotulo: string][]): Opcao[] {
  return rotulos.map(([valor, rotulo]) => ({ valor, rotulo }));
}
