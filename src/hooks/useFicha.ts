import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FichaPayload, FichaTipo, Identificacao, Tcle, ValorCampo } from '@shared/types.ts';
import { COLUNAS_POR_TIPO } from '@shared/constants/schema.ts';
import { ALUNO_ATUAL, PACIENTE_ATUAL, PENDENCIAS, PROCEDIMENTO_ATUAL } from '@shared/constants/common.ts';
import {
  PERFIL_MORFOLOGICO,
  PERIMETRIA_REGIOES,
  PLICOMETRIA_REGIOES,
  RCQ_REGIOES,
} from '@shared/constants/corporal.ts';
import { calcularImc, calcularRcq } from '../lib/calculos.ts';
import { hojeIso, numeroParaTexto, paraNumero } from '../lib/formatos.ts';
import { carregarUltimaFicha, salvarFicha, sincronizarPendentes, type Origem, type RefFicha } from '../services/fichas.ts';
import type { ChavePendencia, EstadoFicha, MedidaEstado } from '../types.ts';

function medidasIniciais(tipo: FichaTipo): MedidaEstado[] {
  if (tipo !== 'corporal') return [];
  const linha = (t: MedidaEstado['tipo'], regiao: string): MedidaEstado => ({ tipo: t, regiao, inicio: '', durante: '', alta: '' });
  return [
    ...PERIMETRIA_REGIOES.map((regiao) => linha('perimetria', regiao)),
    ...PLICOMETRIA_REGIOES.map((regiao) => linha('plicometria', regiao)),
  ];
}

function estadoInicial(tipo: FichaTipo): EstadoFicha {
  const campos: Record<string, ValorCampo> = {};
  if (tipo === 'corporal') campos[PERFIL_MORFOLOGICO.referencia.chave] = PERFIL_MORFOLOGICO.referencia.padrao;
  return {
    identificacao: { ...PACIENTE_ATUAL.identificacao, data_avaliacao: hojeIso() },
    queixa_principal: '',
    hda: '',
    campos,
    opcoes: {},
    anexos: [],
    marcacoes: [],
    medidas: medidasIniciais(tipo),
    evolucoes: [],
    tcle: { aceito: false, assinatura_png: null, aceito_em: null },
  };
}

/** Converte uma ficha gravada no formato editável do formulário. */
function estadoDaFicha(tipo: FichaTipo, ficha: FichaPayload): EstadoFicha {
  const base = estadoInicial(tipo);
  const { colunas } = COLUNAS_POR_TIPO[tipo];
  const campos: Record<string, ValorCampo> = { ...base.campos };
  for (const [chave, valor] of Object.entries(ficha.campos ?? {})) {
    if (valor === null || valor === undefined) continue;
    campos[chave] = colunas[chave] === 'REAL' ? numeroParaTexto(valor) : valor;
  }
  const medidas = base.medidas.map((linha) => {
    const salva = ficha.medidas?.find((m) => m.tipo === linha.tipo && m.regiao === linha.regiao);
    return salva
      ? { ...linha, inicio: numeroParaTexto(salva.inicio), durante: numeroParaTexto(salva.durante), alta: numeroParaTexto(salva.alta) }
      : linha;
  });
  return {
    identificacao: { ...base.identificacao, ...ficha.identificacao },
    queixa_principal: ficha.queixa_principal ?? '',
    hda: ficha.hda ?? '',
    campos,
    opcoes: ficha.opcoes ?? {},
    anexos: ficha.anexos ?? [],
    marcacoes: ficha.marcacoes ?? [],
    medidas,
    evolucoes: ficha.evolucoes ?? [],
    tcle: ficha.tcle ?? base.tcle,
  };
}

/** Campos calculados da ficha corporal (gravados junto para relatórios). */
export function indicesCorporais(estado: EstadoFicha) {
  const { campos, medidas } = estado;
  const imc = calcularImc(campos[PERFIL_MORFOLOGICO.peso.chave], campos[PERFIL_MORFOLOGICO.estatura.chave]);
  const inicio = (regiao: string) => medidas.find((m) => m.tipo === 'perimetria' && m.regiao === regiao)?.inicio;
  const rcq = calcularRcq(
    inicio(RCQ_REGIOES.cintura),
    inicio(RCQ_REGIOES.quadril),
    String(campos[PERFIL_MORFOLOGICO.referencia.chave] ?? PERFIL_MORFOLOGICO.referencia.padrao),
  );
  return { imc, rcq };
}

function montarPayload(tipo: FichaTipo, estado: EstadoFicha, versao: number, status: FichaPayload['status'], ref: RefFicha | null): FichaPayload {
  const { colunas } = COLUNAS_POR_TIPO[tipo];
  const campos: Record<string, ValorCampo> = {};
  for (const [chave, tipoColuna] of Object.entries(colunas)) {
    const valor = estado.campos[chave];
    if (valor === undefined || valor === '') {
      campos[chave] = null;
    } else if (tipoColuna === 'REAL') {
      campos[chave] = paraNumero(valor);
    } else {
      campos[chave] = valor;
    }
  }
  if (tipo === 'corporal') {
    const { imc, rcq } = indicesCorporais(estado);
    campos.imc = imc?.valor ?? null;
    campos.rcq = rcq?.valor ?? null;
  }

  const opcoes = Object.fromEntries(Object.entries(estado.opcoes).filter(([, valores]) => valores.length > 0));

  return {
    id: ref?.id ?? null,
    tipo,
    versao,
    status,
    procedimento: PROCEDIMENTO_ATUAL,
    aluno: { nome: ALUNO_ATUAL.nome, email: ALUNO_ATUAL.email },
    paciente_cpf: PACIENTE_ATUAL.cpf,
    identificacao: estado.identificacao,
    queixa_principal: estado.queixa_principal,
    hda: estado.hda,
    campos,
    opcoes,
    anexos: estado.anexos,
    marcacoes: estado.marcacoes,
    medidas: estado.medidas.map((m) => ({
      tipo: m.tipo,
      regiao: m.regiao,
      inicio: paraNumero(m.inicio),
      durante: paraNumero(m.durante),
      alta: paraNumero(m.alta),
    })),
    evolucoes: estado.evolucoes,
    tcle: estado.tcle,
  };
}

export function calcularPendencias(estado: EstadoFicha): { chave: ChavePendencia; rotulo: string }[] {
  const lista: { chave: ChavePendencia; rotulo: string }[] = [];
  if (!estado.queixa_principal.trim()) lista.push({ chave: 'queixa', rotulo: PENDENCIAS.queixa });
  if (!estado.tcle.aceito) lista.push({ chave: 'aceite', rotulo: PENDENCIAS.aceite });
  if (!estado.tcle.assinatura_png) lista.push({ chave: 'assinatura', rotulo: PENDENCIAS.assinatura });
  return lista;
}

export interface MetaFicha {
  carregando: boolean;
  salvando: boolean;
  versao: number;
  /** Rascunho já gravado da versão atual (null = versão ainda não salva). */
  ref: RefFicha | null;
  origem: Origem | null;
  ultimoSalvamento: Date | null;
  alterado: boolean;
}

export interface ResultadoAcaoSalvar {
  ok: boolean;
  status?: FichaPayload['status'];
  versao?: number;
  origem?: Origem;
  erro?: string;
  detalhes?: string[];
}

export function useFicha(tipo: FichaTipo) {
  const [estado, setEstado] = useState<EstadoFicha>(() => estadoInicial(tipo));
  const [meta, setMeta] = useState<MetaFicha>({
    carregando: true,
    salvando: false,
    versao: 1,
    ref: null,
    origem: null,
    ultimoSalvamento: null,
    alterado: false,
  });
  const [mostrarErros, setMostrarErros] = useState(false);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  const metaRef = useRef(meta);
  metaRef.current = meta;

  // Carrega a versão mais recente gravada para este paciente.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        await sincronizarPendentes();
        const carregada = await carregarUltimaFicha(PACIENTE_ATUAL.cpf, tipo);
        if (!ativo || !carregada) return;
        const { ficha, origem } = carregada;
        setEstado(estadoDaFicha(tipo, ficha));
        const emRascunho = ficha.status === 'rascunho' && ficha.id !== null;
        setMeta((m) => ({
          ...m,
          versao: emRascunho ? ficha.versao : ficha.versao + 1,
          ref: emRascunho ? { id: ficha.id!, origem } : null,
          origem,
          ultimoSalvamento: ficha.atualizado_em ? new Date(ficha.atualizado_em) : null,
        }));
      } catch {
        // Sem ficha anterior: começa com o cadastro da modelo.
      } finally {
        if (ativo) setMeta((m) => ({ ...m, carregando: false }));
      }
    })();
    return () => {
      ativo = false;
    };
  }, [tipo]);

  // Avisa antes de sair com alterações não salvas.
  useEffect(() => {
    if (!meta.alterado) return;
    const aoSair = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
    };
    window.addEventListener('beforeunload', aoSair);
    return () => window.removeEventListener('beforeunload', aoSair);
  }, [meta.alterado]);

  const atualizar = useCallback((fn: (anterior: EstadoFicha) => EstadoFicha) => {
    setEstado(fn);
    setMeta((m) => (m.alterado ? m : { ...m, alterado: true }));
  }, []);

  const acoes = useMemo(
    () => ({
      definirIdentificacao: (chave: keyof Identificacao, valor: string) =>
        atualizar((e) => ({ ...e, identificacao: { ...e.identificacao, [chave]: valor } })),
      definirQueixa: (valor: string) => atualizar((e) => ({ ...e, queixa_principal: valor })),
      definirHda: (valor: string) => atualizar((e) => ({ ...e, hda: valor })),
      definirCampo: (chave: string, valor: ValorCampo) =>
        atualizar((e) => ({ ...e, campos: { ...e.campos, [chave]: valor } })),
      alternarOpcao: (grupo: string, valor: string) =>
        atualizar((e) => {
          const atuais = e.opcoes[grupo] ?? [];
          const proximos = atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor];
          return { ...e, opcoes: { ...e.opcoes, [grupo]: proximos } };
        }),
      definirAnexos: (fn: (anexos: EstadoFicha['anexos']) => EstadoFicha['anexos']) =>
        atualizar((e) => ({ ...e, anexos: fn(e.anexos) })),
      definirMarcacoes: (fn: (marcacoes: EstadoFicha['marcacoes']) => EstadoFicha['marcacoes']) =>
        atualizar((e) => ({ ...e, marcacoes: fn(e.marcacoes) })),
      definirMedida: (tipoMedida: MedidaEstado['tipo'], regiao: string, coluna: 'inicio' | 'durante' | 'alta', valor: string) =>
        atualizar((e) => ({
          ...e,
          medidas: e.medidas.map((m) => (m.tipo === tipoMedida && m.regiao === regiao ? { ...m, [coluna]: valor } : m)),
        })),
      definirEvolucoes: (fn: (evolucoes: EstadoFicha['evolucoes']) => EstadoFicha['evolucoes']) =>
        atualizar((e) => ({ ...e, evolucoes: fn(e.evolucoes) })),
      definirTcle: (parcial: Partial<Tcle>) =>
        atualizar((e) => {
          const tcle = { ...e.tcle, ...parcial };
          if (parcial.aceito !== undefined) tcle.aceito_em = parcial.aceito ? new Date().toISOString() : null;
          return { ...e, tcle };
        }),
    }),
    [atualizar],
  );

  const salvar = useCallback(
    async (status: FichaPayload['status']): Promise<ResultadoAcaoSalvar> => {
      const { versao, ref, salvando } = metaRef.current;
      if (salvando) return { ok: false };
      setMeta((m) => ({ ...m, salvando: true }));
      try {
        const payload = montarPayload(tipo, estadoRef.current, versao, status, ref);
        const resultado = await salvarFicha(payload, ref);
        const concluida = resultado.status === 'concluida';
        setMeta((m) => ({
          ...m,
          salvando: false,
          alterado: false,
          origem: resultado.origem,
          ultimoSalvamento: new Date(),
          // Após concluir, a próxima gravação abre uma nova versão.
          versao: concluida ? resultado.versao + 1 : resultado.versao,
          ref: concluida ? null : { id: resultado.id, origem: resultado.origem },
        }));
        if (concluida) setMostrarErros(false);
        return { ok: true, status: resultado.status, versao: resultado.versao, origem: resultado.origem };
      } catch (erro) {
        setMeta((m) => ({ ...m, salvando: false }));
        const detalhes = (erro as { detalhes?: string[] }).detalhes;
        return { ok: false, erro: erro instanceof Error ? erro.message : 'Erro ao salvar.', detalhes };
      }
    },
    [tipo],
  );

  const pendencias = useMemo(() => calcularPendencias(estado), [estado]);

  return { estado, acoes, meta, salvar, pendencias, mostrarErros, setMostrarErros };
}

export type ControleFicha = ReturnType<typeof useFicha>;
