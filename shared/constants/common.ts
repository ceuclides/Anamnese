import type { Identificacao } from '../types.ts';

/** Dados institucionais exibidos na barra lateral e no TCLE. */
export const CLINICA = {
  rotuloSuperior: 'Clínica',
  rotuloInferior: 'Escola',
  cidade: 'Natal',
  endereco: 'R. São Tomé, 444 - Cidade Alta, Natal - RN, 59025-030',
  whatsapp: '84 4005-1013',
} as const;

/** Aluno autenticado (no design: Camila Rocha, perfil Aluno). */
export const ALUNO_ATUAL = {
  nome: 'Camila Rocha',
  email: 'aluno@senac.br',
  iniciais: 'CR',
  perfil: 'Aluno',
} as const;

export const MENU_PRINCIPAL = [
  { id: 'atendimentos', rotulo: 'Meus atendimentos', icone: 'assignment_ind', contador: 2, ativo: true },
  { id: 'eventos', rotulo: 'Mural de eventos', icone: 'event_available', ativo: false },
] as const;

/** Procedimento do atendimento em curso (texto mantido conforme o Figma nas duas fichas). */
export const PROCEDIMENTO_ATUAL = 'Peeling e Revitalização Facial';

/** Cadastro da modelo usado para pré-preencher a Seção 01. */
export const PACIENTE_ATUAL: { cpf: string; idadeCadastro: number; identificacao: Identificacao } = {
  cpf: '128.554.907-30',
  idadeCadastro: 36,
  identificacao: {
    data_avaliacao: '',
    nome: 'Mariana Alves',
    endereco: '',
    bairro: '',
    cidade: 'Natal/RN',
    telefones: '(84) 99812-7745',
    nacionalidade: 'Brasileira',
    naturalidade: 'Natal/RN',
    estado_civil: 'Casado(a)',
    data_nascimento: '',
    profissao: 'Professora',
    email: 'modelo@senac.br',
    contato_emergencia: '',
    telefone_emergencia: '',
  },
};

export interface CampoIdentificacao {
  chave: keyof Identificacao;
  rotulo: string;
  /** Coluna inicial e largura no grid de 6 colunas do design. */
  coluna: number;
  span: number;
  tipo?: 'texto' | 'data' | 'email' | 'telefone';
}

/** Layout da Seção 01 — grid de 6 colunas, 6 linhas. "Idade" é calculada. */
export const IDENTIFICACAO_CAMPOS: CampoIdentificacao[][] = [
  [
    { chave: 'data_avaliacao', rotulo: 'Data da avaliação', coluna: 1, span: 2, tipo: 'data' },
    { chave: 'nome', rotulo: 'Nome', coluna: 3, span: 4 },
  ],
  [{ chave: 'endereco', rotulo: 'Endereço', coluna: 1, span: 6 }],
  [
    { chave: 'bairro', rotulo: 'Bairro', coluna: 1, span: 2 },
    { chave: 'cidade', rotulo: 'Cidade', coluna: 3, span: 2 },
    { chave: 'telefones', rotulo: 'Telefones', coluna: 5, span: 2, tipo: 'telefone' },
  ],
  [
    { chave: 'nacionalidade', rotulo: 'Nacionalidade', coluna: 1, span: 2 },
    { chave: 'naturalidade', rotulo: 'Naturalidade', coluna: 3, span: 2 },
    { chave: 'estado_civil', rotulo: 'Estado civil', coluna: 5, span: 2 },
  ],
  [
    { chave: 'data_nascimento', rotulo: 'Data de nascimento', coluna: 1, span: 2, tipo: 'data' },
    { chave: 'profissao', rotulo: 'Profissão', coluna: 4, span: 3 },
  ],
  [
    { chave: 'email', rotulo: 'E-mail', coluna: 1, span: 2, tipo: 'email' },
    { chave: 'contato_emergencia', rotulo: 'Em caso de emergência avisar a', coluna: 3, span: 2 },
    { chave: 'telefone_emergencia', rotulo: 'Telefone', coluna: 5, span: 2, tipo: 'telefone' },
  ],
];

export const TCLE_CLAUSULAS: string[] = [
  `Os atendimentos acontecerão na ${CLINICA.endereco}.`,
  'Os atendimentos serão realizados por alunos em estágio supervisionado, sob a supervisão de profissionais habilitados. Os horários de atendimento obedecerão à ordem de chegada dos pacientes. Caso haja atraso no atendimento, pedimos compreensão e paciência.',
  'O paciente tem o direito de recusar qualquer procedimento ou intervenção.',
  `A comunicação quanto ao não comparecimento à sessão deverá ser realizada com no mínimo 2 horas de antecedência, via telefone/WhatsApp ${CLINICA.whatsapp}. Caso o(a) paciente não comunique, a sessão será considerada como realizada.`,
  'O horário de duração da sessão será de 30 a 45 minutos. Os atendimentos serão realizados no horário informado no ato do pagamento.',
  'O estabelecimento não se responsabilizará por nenhum produto deixado nas suas dependências.',
  'O prazo para conclusão da(s) sessão(ões) adquirida(s) será de acordo com a duração da unidade curricular vigente. Caso o prazo informado não seja respeitado, as sessões não utilizadas serão consideradas perdidas.',
];

export const TCLE_TEXTOS = {
  aberturaAntes: 'Eu, ',
  aberturaDepois: ', estou ciente e de acordo com todas as informações contidas neste documento.',
  aceite: 'O(a) paciente leu, compreendeu e concorda com o Termo de Consentimento Livre e Esclarecido.',
  assinatura: 'Assinatura do paciente',
  assinaturaDica: 'Assine aqui com o dedo, caneta ou mouse',
} as const;

/** Pendências obrigatórias para concluir a ficha (barra fixa inferior). */
export const PENDENCIAS = {
  queixa: 'Queixa principal',
  aceite: 'Aceite do TCLE',
  assinatura: 'Assinatura do paciente',
} as const;

export const DADOS_CLINICOS_TEXTOS = {
  queixa: 'Queixa principal',
  queixaPlaceholder: 'Relato do paciente com suas palavras',
  hda: 'História da Doença Atual (HDA)',
  hdaPlaceholder: 'Início, evolução, tratamentos prévios, fatores de piora e melhora',
  anexosSubtitulo: 'Liberação médica (anexos)',
  anexosBotao: 'Anexar liberação / laudo',
} as const;

export const LIMITE_ANEXO_BYTES = 5 * 1024 * 1024;
export const TIPOS_ANEXO_ACEITOS = 'application/pdf,image/*';
