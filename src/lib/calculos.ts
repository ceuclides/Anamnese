import { CLASSIFICACAO_IMC, LIMITE_RCQ } from '@shared/constants/corporal.ts';
import { formatarNumero, paraNumero } from './formatos.ts';

export interface ResultadoIndice {
  valor: number;
  texto: string;
  classificacao: string;
}

/** IMC = peso (kg) ÷ estatura² (m). Estatura acima de 3 é tratada como centímetros. */
export function calcularImc(peso: unknown, estatura: unknown): ResultadoIndice | null {
  const kg = paraNumero(peso);
  let metros = paraNumero(estatura);
  if (kg === null || metros === null || kg <= 0 || metros <= 0) return null;
  if (metros > 3) metros /= 100;
  const valor = kg / (metros * metros);
  if (!Number.isFinite(valor)) return null;
  const faixa = CLASSIFICACAO_IMC.find((f) => valor < f.ate) ?? CLASSIFICACAO_IMC[CLASSIFICACAO_IMC.length - 1];
  return { valor: Math.round(valor * 100) / 100, texto: formatarNumero(valor, 1), classificacao: faixa.rotulo };
}

/** RCQ = circunferência da cintura ÷ circunferência do quadril (medidas de início). */
export function calcularRcq(cintura: unknown, quadril: unknown, referencia: string): ResultadoIndice | null {
  const c = paraNumero(cintura);
  const q = paraNumero(quadril);
  if (c === null || q === null || c <= 0 || q <= 0) return null;
  const valor = c / q;
  const limite = referencia === 'masculino' ? LIMITE_RCQ.masculino : LIMITE_RCQ.feminino;
  return {
    valor: Math.round(valor * 1000) / 1000,
    texto: formatarNumero(valor, 2),
    classificacao: valor > limite ? 'Risco aumentado' : 'Dentro da referência',
  };
}

/** Δ = última medida registrada (alta, senão durante) − medida de início. */
export function calcularDelta(inicio: unknown, durante: unknown, alta: unknown): number | null {
  const i = paraNumero(inicio);
  const final = paraNumero(alta) ?? paraNumero(durante);
  if (i === null || final === null) return null;
  return Math.round((final - i) * 100) / 100;
}
