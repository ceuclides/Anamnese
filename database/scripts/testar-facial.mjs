// Teste de integração ponta a ponta do Formulário Facial contra o SQL Server
const fichaFacial = {
  id: null,
  tipo: "facial",
  versao: 1,
  status: "concluida",
  procedimento: "Limpeza de Pele Profunda e Peeling Químico",
  aluno: {
    nome: "Aluno Teste Senac",
    email: "aluno.estetica@senac.br"
  },
  paciente_cpf: "123.456.789-00",
  identificacao: {
    data_avaliacao: "2026-11-25",
    nome: "Maria das Graças Silva",
    endereco: "Rua das Flores, 123",
    bairro: "Centro",
    cidade: "São Paulo",
    telefones: "(11) 98765-4321",
    nacionalidade: "Brasileira",
    naturalidade: "São Paulo - SP",
    estado_civil: "Casada",
    data_nascimento: "1990-05-15",
    profissao: "Arquiteta",
    email: "maria.silva@teste.com",
    contato_emergencia: "João Silva",
    telefone_emergencia: "(11) 91234-5678"
  },
  queixa_principal: "Manchas e oleosidade excessiva na zona T com comedões.",
  hda: "Paciente relata início dos sintomas há cerca de 6 meses após interrupção de anticoncepcional.",
  campos: {
    usa_medicamento: true,
    uso_prolongado: false,
    duracao_prescricao: "1 mês",
    alteracoes_tireoide: false,
    hepatite: false,
    antecedentes_oncologicos: false,
    problemas_endocrinos: false,
    diabetes: false,
    procedimento_cirurgico: false,
    rinite: true,
    psoriase: false,
    dermatites_cutaneas: false,
    pressao_arterial: "normal",
    faz_controle: "Não necessário",
    medicamento_pressao: null,
    alergias: "Alergia a frutos do mar",
    usa_maquiagem: true,
    alergia_medicamentos_cosmeticos: false,
    obs_maquiagem: "Usa base líquida e protetor solar diariamente",
    fumante: false,
    atividade_fisica: true,
    tipo_alimentacao: "Balanceada",
    numero_refeicoes: 4,
    obs_estilo_vida: "Pratica musculação 3x por semana",
    ciclo_menstrual: "Regular 28 dias",
    idade_menopausa: null,
    idade_andropausa: null,
    qualidade_sono: "Boa",
    horas_sono: 7.5,
    obs_ciclo_sono: "Dorme das 23h às 06h30",
    biotipo_cutaneo: "mista",
    tonus_muscular: "normal",
    grau_hidratacao: "normal",
    grau_acne: "grau_i",
    profundidade_tsuji: "superficial",
    fototipo: "iii"
  },
  opcoes: {},
  anexos: [],
  marcacoes: [
    {
      id: "marc-1",
      vista: "frontal",
      pos_x: 48.5,
      pos_y: 35.2,
      alteracao: null,
      grau: null,
      descricao: "Comedões abertos na região nasal"
    }
  ],
  medidas: [],
  evolucoes: [
    {
      id: "evo-1",
      data: "2026-11-25",
      descricao: "Realizada higienização, emoliência, extração por sucção e máscara calmante de camomila.",
      assinatura_aluno: "Aluno Teste Senac"
    }
  ],
  tcle: {
    aceito: true,
    assinatura_png: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    aceito_em: "2026-11-25T16:50:00Z"
  }
};

async function testar() {
  console.log("Enviando POST /api/fichas (Anamnese Facial)...");
  const resPost = await fetch("http://127.0.0.1:3333/api/fichas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fichaFacial)
  });
  const jsonPost = await resPost.json();
  console.log("Resultado POST:", jsonPost);

  if (!resPost.ok) throw new Error("Falha no POST: " + JSON.stringify(jsonPost));

  const fichaId = jsonPost.id;
  console.log("Consultando GET /api/fichas/" + fichaId + "...");
  const resGet = await fetch("http://127.0.0.1:3333/api/fichas/" + fichaId);
  const jsonGet = await resGet.json();
  console.log("Ficha recuperada do SQL Server:");
  console.log(" - ID:", jsonGet.id);
  console.log(" - Tipo:", jsonGet.tipo);
  console.log(" - Versão:", jsonGet.versao);
  console.log(" - Status:", jsonGet.status);
  console.log(" - Paciente:", jsonGet.identificacao.nome, "(" + jsonGet.paciente_cpf + ")");
  console.log(" - Biotipo Cutâneo:", jsonGet.campos.biotipo_cutaneo);
  console.log(" - Fototipo:", jsonGet.campos.fototipo);
  console.log(" - Marcações no rosto:", jsonGet.marcacoes.length);
  console.log(" - Evoluções:", jsonGet.evolucoes.length);
  console.log(" - TCLE Aceito:", jsonGet.tcle.aceito);

  console.log("\nConsultando GET /api/fichas (listagem)...");
  const resList = await fetch("http://127.0.0.1:3333/api/fichas?tipo=facial");
  const jsonList = await resList.json();
  console.log("Listagem Facial retornou", jsonList.length, "ficha(s).");
}

testar().catch(err => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
