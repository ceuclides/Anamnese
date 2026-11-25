import { opcoes, type Bloco, type Campo, type SecaoInfo, type TipoColuna } from '../forms.ts';

export const CORPORAL_TITULO = 'Ficha de Anamnese Corporal';

export const CORPORAL_SECOES: SecaoInfo[] = [
  { id: 'identificacao', numero: 1, titulo: 'Identificação', rotuloNav: 'Identificação', icone: 'badge', descricao: 'Pré-preenchida com o cadastro da modelo. Confira e complete.' },
  { id: 'dados-clinicos', numero: 2, titulo: 'Dados clínicos', rotuloNav: 'Dados clínicos', icone: 'stethoscope' },
  { id: 'habitos', numero: 3, titulo: 'Hábitos de vida', rotuloNav: 'Hábitos de vida', icone: 'directions_run' },
  { id: 'antecedentes', numero: 4, titulo: 'Antecedentes pessoais', rotuloNav: 'Antecedentes pessoais', icone: 'history' },
  { id: 'exame-fisico', numero: 5, titulo: 'Exame físico', rotuloNav: 'Exame físico', icone: 'accessibility_new' },
  { id: 'perfil-morfologico', numero: 6, titulo: 'Perfil morfológico', rotuloNav: 'Perfil morfológico', icone: 'monitor_weight', descricao: 'IMC e RCQ são calculados automaticamente.' },
  { id: 'medidas', numero: 7, titulo: 'Perimetria e plicometria', rotuloNav: 'Perimetria e plicometria', icone: 'straighten', descricao: 'Registre as medidas no início, durante e na alta do tratamento.' },
  { id: 'tcle', numero: 8, titulo: 'Termo de Consentimento Livre e Esclarecido', rotuloNav: 'TCLE', icone: 'contract' },
];

const simNao = (chave: string, rotulo: string, largo = false): Campo => ({ tipo: 'simnao', chave, rotulo, largo });

export const CORPORAL_HABITOS: Bloco[] = [
  {
    id: 'habitos',
    colunas: 2,
    gapX: 40,
    gapY: 8,
    campos: [
      simNao('etilismo', 'Etilismo?'),
      simNao('tabagismo', 'Tabagismo?'),
      simNao('alteracoes_sono', 'Alterações de sono?'),
      simNao('permanece_sentada', 'Costuma permanecer muito tempo sentada?'),
      simNao('ortostase_prolongada', 'Tempo prolongado em ortostase?'),
      simNao('pratica_esporte', 'Pratica algum esporte?'),
      simNao('dieta_orientada', 'Dieta orientada?'),
      simNao('alimentacao_hipercalorica', 'Alimentação hipercalórica?'),
      simNao('ingestao_agua', 'Ingestão diária de 8 copos de água?'),
      simNao('exposicao_sol', 'Exposição ao sol?'),
    ],
  },
  {
    id: 'refeicoes',
    colunas: 1,
    gapX: 16,
    gapY: 16,
    larguraMaxima: 320,
    campos: [{ tipo: 'numero', chave: 'refeicoes_diarias', rotulo: 'Nº de refeições diárias', min: 0, max: 20 }],
  },
];

export const CORPORAL_ANTECEDENTES: Bloco[] = [
  {
    id: 'antecedentes',
    colunas: 2,
    gapX: 40,
    gapY: 8,
    campos: [
      simNao('padrao_intestinal_normal', 'Padrão intestinal normal?', true),
      simNao('sono_8h', 'Horas diárias de sono de 8 h?', true),
      simNao('ciclo_menstrual_normal', 'Ciclo menstrual normal?', true),
      simNao('menopausa', 'Menopausa?', true),
      simNao('gestante', 'Gestante?', true),
      simNao('diabetes', 'Diabetes?', true),
      simNao('hipertensao', 'Hipertensão?', true),
      simNao('marcapasso', 'Marcapasso?', true),
      simNao('doenca_endocrina', 'Doença endócrina?', true),
      simNao('doenca_dermica', 'Doença dérmica?', true),
      simNao('patologia_cardiaca', 'Patologia cardíaca?', true),
      simNao('epilepsia', 'Epilepsia?', true),
      simNao('varizes', 'Varizes?', true),
      simNao('trombose', 'Trombose?', true),
      simNao('fragilidade_capilar', 'Fragilidade capilar?', true),
      simNao('antecedentes_oncologicos', 'Antecedentes oncológicos?', true),
      simNao('alergias', 'Alergias?', true),
      simNao('cirurgias_recentes', 'Cirurgias recentes?', true),
      simNao('medicamento_em_uso', 'Medicamento em uso?', true),
      simNao('cosmetico_em_uso', 'Cosmético em uso?', true),
      simNao('tratamentos_esteticos', 'Tratamentos estéticos anteriores?', true),
    ],
  },
];

export const CORPORAL_EXAME: Bloco[] = [
  {
    id: 'pele-gordura',
    colunas: 2,
    gapX: 24,
    gapY: 24,
    campos: [
      {
        tipo: 'radio',
        chave: 'aspecto_pele',
        rotulo: 'Aspecto da pele',
        opcoes: opcoes(['hidratada', 'Hidratada'], ['desidratada', 'Desidratada']),
      },
      {
        tipo: 'radio',
        chave: 'gordura_localizada',
        rotulo: 'Gordura localizada',
        opcoes: opcoes(['ginecoide', 'Ginecóide'], ['androide', 'Andróide']),
      },
    ],
  },
  {
    id: 'alteracoes',
    colunas: 2,
    gapX: 40,
    gapY: 8,
    campos: [
      simNao('estrias', 'Estrias'),
      simNao('equimoses', 'Presença de equimoses?'),
      simNao('edemas', 'Presença de edemas?'),
      simNao('alteracao_temperatura', 'Alteração de temperatura?'),
      simNao('flacidez', 'Flacidez?'),
      simNao('fibroedema_geloide', 'Fibroedemagelóide?'),
    ],
  },
];

export const CORPORAL_OBSERVACOES: Bloco = {
  id: 'observacoes',
  colunas: 1,
  gapX: 20,
  gapY: 20,
  campos: [{ tipo: 'area', chave: 'obs_gerais', rotulo: 'Observações gerais', linhas: 3 }],
};

export const CORPORAL_MAPA = {
  imagem: 'assets/bf6c2.png',
  larguraNatural: 439,
  alturaNatural: 410,
  alt: 'Silhueta corporal em três posições: perfil, frontal e posterior',
  subtitulo: 'Delimitar as alterações corporais (regiões e graus)',
  dica: 'Clique na silhueta para marcar regiões com estrias, flacidez, gordura localizada ou fibroedemagelóide, indicando o grau.',
  vistas: [
    { valor: 'perfil', rotulo: 'Perfil' },
    { valor: 'frontal', rotulo: 'Frontal' },
    { valor: 'posterior', rotulo: 'Posterior' },
  ],
  alteracoes: opcoes(
    ['estrias', 'Estrias'],
    ['flacidez', 'Flacidez'],
    ['gordura_localizada', 'Gordura localizada'],
    ['fibroedema_geloide', 'Fibroedemagelóide'],
  ),
  graus: opcoes(['grau_i', 'Grau I'], ['grau_ii', 'Grau II'], ['grau_iii', 'Grau III'], ['grau_iv', 'Grau IV']),
} as const;

export const PERFIL_MORFOLOGICO = {
  peso: { chave: 'peso_kg', rotulo: 'Peso', sufixo: 'kg' },
  estatura: { chave: 'estatura_m', rotulo: 'Estatura', sufixo: 'm', placeholder: '1,65' },
  referencia: {
    chave: 'referencia_rcq',
    rotulo: 'Referência de RCQ',
    opcoes: opcoes(['feminino', 'Feminino'], ['masculino', 'Masculino']),
    padrao: 'feminino',
  },
  imc: { rotulo: 'IMC (kg/m²)', ajuda: 'Peso ÷ estatura²' },
  rcq: { rotulo: 'RCQ', ajuda: 'Preencha cintura e quadril na perimetria (início)' },
} as const;

/** Faixas de classificação usadas nos cartões de IMC (OMS) e RCQ. */
export const CLASSIFICACAO_IMC = [
  { ate: 18.5, rotulo: 'Abaixo do peso' },
  { ate: 25, rotulo: 'Peso adequado' },
  { ate: 30, rotulo: 'Sobrepeso' },
  { ate: 35, rotulo: 'Obesidade grau I' },
  { ate: 40, rotulo: 'Obesidade grau II' },
  { ate: Infinity, rotulo: 'Obesidade grau III' },
] as const;

/** Limite de RCQ a partir do qual há risco cardiovascular aumentado. */
export const LIMITE_RCQ = { feminino: 0.85, masculino: 0.9 } as const;

export const PERIMETRIA_REGIOES = [
  'Busto',
  'Braço esquerdo',
  'Braço direito',
  'Cintura',
  'Abdômen',
  'Flancos',
  'Quadril/Glúteos',
  'Coxa sup. esquerda',
  'Coxa sup. direita',
  'Coxa média esquerda',
  'Coxa média direita',
  'Panturrilha esquerda',
  'Panturrilha direita',
] as const;

export const PLICOMETRIA_REGIOES = [
  'Peitoral',
  'Subescapular',
  'Bíceps',
  'Tríceps',
  'Axilar média',
  'Suprailíaca',
  'Abdômen',
  'Coxa',
  'Perna',
] as const;

/** Regiões de perimetria usadas no cálculo do RCQ (medida de início). */
export const RCQ_REGIOES = { cintura: 'Cintura', quadril: 'Quadril/Glúteos' } as const;

export const MEDIDAS_TEXTOS = {
  perimetria: { titulo: 'Perimetria', unidade: '(cm)' },
  plicometria: { titulo: 'Plicometria', unidade: '(mm)' },
  colunas: { regiao: 'Região', inicio: 'Início', durante: 'Durante', alta: 'Alta', delta: 'Δ' },
  bioimpedancia: { titulo: 'Bioimpedância', rotulo: '% de gordura', sufixo: '%', chave: 'bioimpedancia_gordura' },
} as const;

/** Colunas de ficha_corporal que não vêm dos blocos declarativos. */
export const CORPORAL_COLUNAS_EXTRAS: Record<string, TipoColuna> = {
  peso_kg: 'REAL',
  estatura_m: 'REAL',
  referencia_rcq: 'TEXT',
  imc: 'REAL',
  rcq: 'REAL',
  perimetria_data_inicio: 'TEXT',
  perimetria_data_durante: 'TEXT',
  perimetria_data_alta: 'TEXT',
  plicometria_data_inicio: 'TEXT',
  plicometria_data_durante: 'TEXT',
  plicometria_data_alta: 'TEXT',
  bioimpedancia_gordura: 'REAL',
};

export const CORPORAL_BLOCOS: Bloco[] = [
  ...CORPORAL_HABITOS,
  ...CORPORAL_ANTECEDENTES,
  ...CORPORAL_EXAME,
  CORPORAL_OBSERVACOES,
];
