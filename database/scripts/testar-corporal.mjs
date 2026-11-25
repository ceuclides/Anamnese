// Teste de integração ponta a ponta do Formulário Corporal contra o SQL Server
const fichaCorporal = {
  id: null,
  tipo: "corporal",
  versao: 1,
  status: "concluida",
  procedimento: "Tratamento para Lipodistrofia e Flacidez Tissular",
  aluno: {
    nome: "Aluno Teste Senac",
    email: "aluno.estetica@senac.br"
  },
  paciente_cpf: "987.654.321-99",
  identificacao: {
    data_avaliacao: "2026-11-25",
    nome: "Carlos Eduardo Souza",
    endereco: "Av. Paulista, 1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    telefones: "(11) 97777-8888",
    nacionalidade: "Brasileira",
    naturalidade: "Curitiba - PR",
    estado_civil: "Solteiro",
    data_nascimento: "1994-08-20",
    profissao: "Desenvolvedor de Software",
    email: "carlos.souza@teste.com",
    contato_emergencia: "Ana Souza",
    telefone_emergencia: "(11) 96666-5555"
  },
  queixa_principal: "Acúmulo de gordura localizada na região abdominal e flacidez nos flancos.",
  hda: "Paciente relata sedentarismo nos últimos 2 anos devido a rotina de trabalho.",
  campos: {
    etilismo: false,
    tabagismo: false,
    alteracoes_sono: true,
    permanece_sentada: true,
    ortostase_prolongada: false,
    pratica_esporte: false,
    dieta_orientada: false,
    alimentacao_hipercalorica: true,
    ingestao_agua: false,
    exposicao_sol: false,
    refeicoes_diarias: 3,
    padrao_intestinal_normal: true,
    sono_8h: false,
    ciclo_menstrual_normal: null,
    menopausa: null,
    gestante: null,
    diabetes: false,
    hipertensao: false,
    marcapasso: false,
    doenca_endocrina: false,
    doenca_dermica: false,
    patologia_cardiaca: false,
    epilepsia: false,
    varizes: false,
    trombose: false,
    fragilidade_capilar: false,
    antecedentes_oncologicos: false,
    alergias: false,
    cirurgias_recentes: false,
    medicamento_em_uso: false,
    cosmetico_em_uso: false,
    tratamentos_esteticos: false,
    aspecto_pele: "hidratada",
    gordura_localizada: "androide",
    estrias: false,
    equimoses: false,
    edemas: false,
    alteracao_temperatura: false,
    flacidez: true,
    fibroedema_geloide: false,
    obs_gerais: "Avaliação inicial para protocolo de radiofrequência e drenagem.",
    peso_kg: 82.5,
    estatura_m: 1.78,
    referencia_rcq: "masculino",
    imc: 26.04,
    rcq: 0.92,
    perimetria_data_inicio: "2026-11-25",
    perimetria_data_durante: null,
    perimetria_data_alta: null,
    plicometria_data_inicio: "2026-11-25",
    plicometria_data_durante: null,
    plicometria_data_alta: null,
    bioimpedancia_gordura: 22.4
  },
  opcoes: {},
  anexos: [],
  marcacoes: [
    {
      id: "marc-corp-1",
      vista: "frontal",
      pos_x: 50.0,
      pos_y: 55.0,
      alteracao: "gordura_localizada",
      grau: "grau_ii",
      descricao: "Adiposidade infraumbilical"
    }
  ],
  medidas: [
    {
      tipo: "perimetria",
      regiao: "Cintura",
      inicio: 88.0,
      durante: null,
      alta: null
    },
    {
      tipo: "perimetria",
      regiao: "Abdômen",
      inicio: 94.0,
      durante: null,
      alta: null
    },
    {
      tipo: "perimetria",
      regiao: "Quadril",
      inicio: 102.0,
      durante: null,
      alta: null
    }
  ],
  evolucoes: [],
  tcle: {
    aceito: true,
    assinatura_png: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    aceito_em: "2026-11-25T16:51:00Z"
  }
};

async function testarCorporal() {
  console.log("Enviando POST /api/fichas (Anamnese Corporal)...");
  const resPost = await fetch("http://127.0.0.1:3333/api/fichas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fichaCorporal)
  });
  const jsonPost = await resPost.json();
  console.log("Resultado POST:", jsonPost);

  if (!resPost.ok) throw new Error("Falha no POST: " + JSON.stringify(jsonPost));

  const fichaId = jsonPost.id;
  console.log("Consultando GET /api/fichas/" + fichaId + "...");
  const resGet = await fetch("http://127.0.0.1:3333/api/fichas/" + fichaId);
  const jsonGet = await resGet.json();
  console.log("Ficha Corporal recuperada do SQL Server:");
  console.log(" - ID:", jsonGet.id);
  console.log(" - Tipo:", jsonGet.tipo);
  console.log(" - Versão:", jsonGet.versao);
  console.log(" - Status:", jsonGet.status);
  console.log(" - Paciente:", jsonGet.identificacao.nome, "(" + jsonGet.paciente_cpf + ")");
  console.log(" - Peso (kg):", jsonGet.campos.peso_kg);
  console.log(" - Altura (m):", jsonGet.campos.estatura_m);
  console.log(" - IMC Calculado:", jsonGet.campos.imc);
  console.log(" - RCQ Calculado:", jsonGet.campos.rcq);
  console.log(" - Medidas cadastradas:", jsonGet.medidas.length);
  console.log(" - Marcações corporais:", jsonGet.marcacoes.length);

  console.log("\nConsultando GET /api/fichas (listagem geral)...");
  const resList = await fetch("http://127.0.0.1:3333/api/fichas");
  const jsonList = await resList.json();
  console.log("Listagem total retornou", jsonList.length, "fichas cadastradas no SQL Server.");
}

testarCorporal().catch(err => {
  console.error("Erro no teste corporal:", err);
  process.exit(1);
});
