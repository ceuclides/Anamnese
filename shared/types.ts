/**
 * Tipos de domínio compartilhados entre o front-end (React) e a API local (Node).
 * As chaves usam snake_case para corresponder 1:1 às colunas do banco SQLite
 * (ver database/schema.sql).
 */

export type FichaTipo = 'facial' | 'corporal';
export type FichaStatus = 'rascunho' | 'concluida';

/** Valor de um campo escalar armazenado em ficha_facial / ficha_corporal. */
export type ValorCampo = string | number | boolean | null;

export interface Identificacao {
  data_avaliacao: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  telefones: string;
  nacionalidade: string;
  naturalidade: string;
  estado_civil: string;
  data_nascimento: string;
  profissao: string;
  email: string;
  contato_emergencia: string;
  telefone_emergencia: string;
}

export interface Anexo {
  id: string;
  nome_arquivo: string;
  tipo_mime: string;
  tamanho_bytes: number;
  /** Conteúdo do arquivo em data URL (base64). */
  conteudo_base64: string;
}

export interface Marcacao {
  id: string;
  /** Vista da imagem (ex.: frontal, perfil_direito, posterior). */
  vista: string;
  /** Posição relativa (0–100) sobre a imagem. */
  pos_x: number;
  pos_y: number;
  /** Tipo de alteração (somente ficha corporal). */
  alteracao: string | null;
  /** Grau da alteração (somente ficha corporal). */
  grau: string | null;
  descricao: string;
}

export type TipoMedida = 'perimetria' | 'plicometria';

export interface Medida {
  tipo: TipoMedida;
  regiao: string;
  inicio: number | null;
  durante: number | null;
  alta: number | null;
}

export interface Evolucao {
  id: string;
  data: string;
  descricao: string;
  assinatura_aluno: string;
}

export interface Tcle {
  aceito: boolean;
  /** Assinatura desenhada, em data URL PNG. */
  assinatura_png: string | null;
  aceito_em: string | null;
}

export interface AlunoRef {
  nome: string;
  email: string;
}

/** Documento completo enviado e recebido pela API ao salvar uma ficha. */
export interface FichaPayload {
  id: number | null;
  tipo: FichaTipo;
  versao: number;
  status: FichaStatus;
  procedimento: string;
  aluno: AlunoRef;
  paciente_cpf: string;
  identificacao: Identificacao;
  queixa_principal: string;
  hda: string;
  /** Campos específicos da ficha (colunas de ficha_facial ou ficha_corporal). */
  campos: Record<string, ValorCampo>;
  /** Grupos de múltipla escolha: grupo → códigos marcados (tabela ficha_opcoes). */
  opcoes: Record<string, string[]>;
  anexos: Anexo[];
  marcacoes: Marcacao[];
  medidas: Medida[];
  evolucoes: Evolucao[];
  tcle: Tcle;
  criado_em?: string;
  atualizado_em?: string;
}

export interface FichaResumo {
  id: number;
  tipo: FichaTipo;
  versao: number;
  status: FichaStatus;
  paciente_cpf: string;
  paciente_nome: string;
  atualizado_em: string;
}

export interface SalvarResultado {
  id: number;
  versao: number;
  status: FichaStatus;
  atualizado_em: string;
}
