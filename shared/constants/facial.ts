import { opcoes, type Bloco, type SecaoInfo } from '../forms.ts';

export const FACIAL_TITULO = 'Ficha de Anamnese Facial';

export const FACIAL_SECOES: SecaoInfo[] = [
  { id: 'identificacao', numero: 1, titulo: 'Identificação', rotuloNav: 'Identificação', icone: 'badge', descricao: 'Pré-preenchida com o cadastro da modelo. Confira e complete.' },
  { id: 'dados-clinicos', numero: 2, titulo: 'Dados clínicos', rotuloNav: 'Dados clínicos', icone: 'stethoscope' },
  { id: 'habitos', numero: 3, titulo: 'Hábitos de vida / Antecedentes patológicos e familiares', rotuloNav: 'Hábitos e antecedentes', icone: 'medication' },
  { id: 'exame-fisico', numero: 4, titulo: 'Exame físico facial — alterações cutâneas', rotuloNav: 'Exame físico facial', icone: 'face_retouching_natural' },
  { id: 'tcle', numero: 5, titulo: 'Termo de Consentimento Livre e Esclarecido', rotuloNav: 'TCLE', icone: 'contract' },
  { id: 'evolucao', numero: 6, titulo: 'Evolução e intercorrências', rotuloNav: 'Evolução', icone: 'timeline', descricao: 'Registro cronológico de cada sessão.' },
];

/** Seção 02 — bloco de medicamentos (após Queixa principal e HDA). */
export const FACIAL_MEDICAMENTOS: Bloco[] = [
  {
    id: 'medicamentos',
    subtitulo: 'Medicamentos',
    colunas: 1,
    gapX: 16,
    gapY: 16,
    campos: [
      { tipo: 'simnao', chave: 'usa_medicamento', rotulo: 'Faz uso de algum medicamento?' },
      { tipo: 'simnao', chave: 'uso_prolongado', rotulo: 'É de uso prolongado?' },
      { tipo: 'texto', chave: 'duracao_prescricao', rotulo: 'Duração e prescrição' },
    ],
  },
];

/** Seção 03 — Hábitos de vida / Antecedentes patológicos e familiares. */
export const FACIAL_HABITOS: Bloco[] = [
  {
    id: 'condicoes',
    subtitulo: 'Condições e dispositivos',
    colunas: 1,
    gapX: 16,
    gapY: 16,
    campos: [
      {
        tipo: 'checks',
        grupo: 'condicoes',
        opcoes: opcoes(
          ['epilepsia', 'Epilepsia'],
          ['marca_passo', 'Marca-passo'],
          ['pino_placa_metalica', 'Pino/Placa metálica'],
          ['protese', 'Prótese'],
          ['doenca_renal', 'Doença renal'],
          ['labirintite', 'Labirintite'],
          ['lupus', 'Lúpus'],
        ),
      },
    ],
  },
  {
    id: 'antecedentes',
    colunas: 2,
    gapX: 40,
    gapY: 8,
    campos: [
      { tipo: 'simnao', chave: 'alteracoes_tireoide', rotulo: 'Alterações na tireoide' },
      { tipo: 'simnao', chave: 'hepatite', rotulo: 'Hepatite' },
      { tipo: 'simnao', chave: 'antecedentes_oncologicos', rotulo: 'Antecedentes oncológicos' },
      { tipo: 'simnao', chave: 'problemas_endocrinos', rotulo: 'Problemas endócrinos' },
      { tipo: 'simnao', chave: 'diabetes', rotulo: 'Diabetes' },
      { tipo: 'simnao', chave: 'procedimento_cirurgico', rotulo: 'Já fez algum procedimento cirúrgico?' },
      { tipo: 'simnao', chave: 'rinite', rotulo: 'Rinite' },
      { tipo: 'simnao', chave: 'psoriase', rotulo: 'Psoríase' },
      { tipo: 'simnao', chave: 'dermatites_cutaneas', rotulo: 'Dermatites cutâneas' },
    ],
  },
  {
    id: 'pressao',
    colunas: 3,
    gapX: 16,
    gapY: 16,
    painel: true,
    campos: [
      {
        tipo: 'radio',
        chave: 'pressao_arterial',
        rotulo: 'Pressão arterial',
        span: 3,
        opcoes: opcoes(['hipertensao', 'Hipertensão'], ['hipotensao', 'Hipotensão'], ['normal', 'Normal']),
      },
      { tipo: 'texto', chave: 'faz_controle', rotulo: 'Faz controle?' },
      { tipo: 'texto', chave: 'medicamento_pressao', rotulo: 'Qual o medicamento?', span: 2 },
    ],
  },
  {
    id: 'alergias',
    colunas: 1,
    gapX: 16,
    gapY: 16,
    campos: [{ tipo: 'texto', chave: 'alergias', rotulo: 'Alergias' }],
  },
  {
    id: 'maquiagem',
    subtitulo: 'Maquiagem e cosméticos',
    colunas: 2,
    gapX: 16,
    gapY: 16,
    campos: [
      { tipo: 'simnao', chave: 'usa_maquiagem', rotulo: 'Usa maquiagem?' },
      { tipo: 'simnao', chave: 'alergia_medicamentos_cosmeticos', rotulo: 'Alergia a medicamentos / cosméticos?' },
      { tipo: 'area', chave: 'obs_maquiagem', rotulo: 'Observações pertinentes', span: 2 },
    ],
  },
  {
    id: 'estilo-vida',
    subtitulo: 'Estilo de vida',
    colunas: 2,
    gapX: 16,
    gapY: 16,
    campos: [
      { tipo: 'simnao', chave: 'fumante', rotulo: 'Fumante' },
      { tipo: 'simnao', chave: 'atividade_fisica', rotulo: 'Atividade física' },
      { tipo: 'texto', chave: 'tipo_alimentacao', rotulo: 'Tipo de alimentação' },
      { tipo: 'numero', chave: 'numero_refeicoes', rotulo: 'Número de refeições', min: 0, max: 20 },
      {
        tipo: 'checks',
        grupo: 'consumo_frequente',
        rotulo: 'Consumo frequente',
        span: 2,
        opcoes: opcoes(
          ['acucar_doces', 'Açúcar e/ou doces'],
          ['frutas', 'Frutas'],
          ['leite_derivados', 'Leite e derivados'],
          ['frituras_gorduras', 'Frituras/gorduras'],
          ['verduras', 'Verduras'],
          ['bebida_alcoolica', 'Bebida alcoólica'],
        ),
      },
      { tipo: 'area', chave: 'obs_estilo_vida', rotulo: 'Observações', span: 2 },
    ],
  },
  {
    id: 'ciclo-sono',
    subtitulo: 'Ciclo hormonal e sono',
    colunas: 3,
    gapX: 16,
    gapY: 16,
    campos: [
      { tipo: 'texto', chave: 'ciclo_menstrual', rotulo: 'Ciclo menstrual' },
      { tipo: 'numero', chave: 'idade_menopausa', rotulo: 'Idade da menopausa', min: 0, max: 120 },
      { tipo: 'numero', chave: 'idade_andropausa', rotulo: 'Idade da andropausa (homens)', min: 0, max: 120 },
      { tipo: 'texto', chave: 'qualidade_sono', rotulo: 'Qualidade do sono' },
      { tipo: 'numero', chave: 'horas_sono', rotulo: 'Horas diárias de sono', sufixo: 'h', min: 0, max: 24, passo: 0.5 },
      { tipo: 'area', chave: 'obs_ciclo_sono', rotulo: 'Observações pertinentes', span: 3 },
    ],
  },
];

/** Seção 04 — classificações cutâneas (abaixo do mapa facial). */
export const FACIAL_EXAME: Bloco[] = [
  {
    id: 'classificacao',
    colunas: 2,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'radio',
        chave: 'biotipo_cutaneo',
        rotulo: 'Biótipo cutâneo',
        opcoes: opcoes(
          ['normal', 'Pele normal (eudérmica)'],
          ['mista', 'Pele mista'],
          ['lipidica', 'Pele lipídica'],
          ['alipica', 'Pele alípica'],
        ),
      },
      {
        tipo: 'checks',
        grupo: 'textura',
        rotulo: 'Textura',
        opcoes: opcoes(
          ['lisa', 'Lisa'],
          ['aspera', 'Áspera'],
          ['fina', 'Fina'],
          ['muito_fina', 'Muito fina'],
          ['espessa', 'Espessa'],
          ['rugosa', 'Rugosa'],
        ),
      },
      {
        tipo: 'radio',
        chave: 'tonus_muscular',
        rotulo: 'Tônus muscular',
        opcoes: opcoes(['normal', 'Normal'], ['hipotonico', 'Hipotônico'], ['hipertonico', 'Hipertônico']),
      },
      {
        tipo: 'radio',
        chave: 'grau_hidratacao',
        rotulo: 'Grau de hidratação',
        opcoes: opcoes(['desidratada', 'Desidratada'], ['normal', 'Normal']),
      },
      {
        tipo: 'radio',
        chave: 'grau_acne',
        rotulo: 'Pele com acne',
        opcoes: opcoes(['grau_i', 'Grau I'], ['grau_ii', 'Grau II'], ['grau_iii', 'Grau III'], ['grau_iv', 'Grau IV']),
      },
      {
        tipo: 'checks',
        grupo: 'manchas_pigmentares',
        rotulo: 'Manchas pigmentares relacionadas à melanina',
        opcoes: opcoes(
          ['acromia', 'Acromia'],
          ['efelides', 'Efélides'],
          ['hipocromias', 'Hipocromias'],
          ['cloasma', 'Cloasma'],
          ['hipercromias', 'Hipercromias'],
        ),
      },
    ],
  },
  {
    id: 'rugas',
    colunas: 1,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'checks',
        grupo: 'rugas',
        rotulo: 'Presença de rugas',
        opcoes: opcoes(
          ['expressao', 'Rugas de expressão (30+) — periorbitais / glabela'],
          ['estaticas', 'Rugas estáticas (40+) — sulco nasogeniano / bolsas oculares'],
          ['gravitacionais', 'Rugas gravitacionais (50+) — labiais / contorno mandibular'],
          ['compostas', 'Rugas compostas (60+) — generalizadas / perda volumétrica'],
        ),
      },
    ],
  },
  {
    id: 'localizacao',
    colunas: 1,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'checks',
        grupo: 'localizacao_rugas',
        rotulo: 'Localização',
        opcoes: opcoes(
          ['glabelar', 'Glabelar'],
          ['frontal', 'Frontal'],
          ['malar', 'Malar'],
          ['periorbicular', 'Periorbicular'],
          ['perioral', 'Perioral'],
          ['nasogeniano', 'Nasogeniano'],
          ['mentoniano', 'Mentoniano'],
          ['cervical', 'Cervical'],
        ),
      },
    ],
  },
  {
    id: 'tsuji',
    colunas: 1,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'radio',
        chave: 'profundidade_tsuji',
        rotulo: 'Profundidade (Classificação de Tsuji)',
        disposicao: 'grade',
        opcoes: opcoes(
          ['superficial', 'Superficial: desaparece com o estiramento'],
          ['profunda', 'Profunda: não desaparece com o estiramento'],
        ),
      },
    ],
  },
  {
    id: 'fototipo',
    colunas: 1,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'radio',
        chave: 'fototipo',
        rotulo: 'Fototipo — reatividade à luz ultravioleta (Escala Fitzpatrick)',
        disposicao: 'grade',
        opcoes: opcoes(
          ['i', 'I — Branco / loiro — nunca bronzeia'],
          ['ii', 'II — Branco — dificilmente bronzeia'],
          ['iii', 'III — Moreno claro — bronzeia moderadamente'],
          ['iv', 'IV — Moreno moderado — bronzeia facilmente'],
          ['v', 'V — Moreno escuro — bronzeia intensamente'],
          ['vi', 'VI — Negro — não se queima'],
        ),
      },
    ],
  },
];

export const FACIAL_MAPA = {
  imagem: 'assets/fcb12.png',
  larguraNatural: 696,
  alturaNatural: 283,
  alt: 'Rosto em três ângulos: perfil direito, frontal e perfil esquerdo',
  dica: 'Clique sobre o rosto para marcar manchas, lesões, rugas ou acne e descreva cada ponto.',
  vistas: [
    { valor: 'perfil_direito', rotulo: 'Perfil direito' },
    { valor: 'frontal', rotulo: 'Frontal' },
    { valor: 'perfil_esquerdo', rotulo: 'Perfil esquerdo' },
  ],
} as const;

export const FACIAL_EVOLUCAO = {
  colunas: ['Data', 'Evolução e intercorrência', 'Assinatura do aluno'],
  vazio: 'Nenhum registro de evolução.',
  botao: 'Adicionar registro',
} as const;

/** Todos os blocos declarativos da ficha facial (usados para gerar colunas do banco). */
export const FACIAL_BLOCOS: Bloco[] = [...FACIAL_MEDICAMENTOS, ...FACIAL_HABITOS, ...FACIAL_EXAME];
