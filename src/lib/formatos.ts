const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** Data de hoje no formato ISO local (AAAA-MM-DD). */
export function hojeIso(): string {
  const agora = new Date();
  const deslocamento = agora.getTimezoneOffset() * 60_000;
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10);
}

function partesIso(iso: string): [number, number, number] | null {
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!correspondencia) return null;
  return [Number(correspondencia[1]), Number(correspondencia[2]), Number(correspondencia[3])];
}

/** "12 de novembro de 2026" */
export function dataPorExtenso(iso: string): string {
  const partes = partesIso(iso) ?? partesIso(hojeIso())!;
  const [ano, mes, dia] = partes;
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

/** Idade completa em anos entre a data de nascimento e a data de referência. */
export function calcularIdade(nascimento: string, referencia: string = hojeIso()): number | null {
  const n = partesIso(nascimento);
  const r = partesIso(referencia) ?? partesIso(hojeIso());
  if (!n || !r) return null;
  let idade = r[0] - n[0];
  if (r[1] < n[1] || (r[1] === n[1] && r[2] < n[2])) idade -= 1;
  return idade >= 0 && idade < 150 ? idade : null;
}

/** Converte texto digitado (aceita vírgula) em número ou null. */
export function paraNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== 'string') return null;
  const limpo = valor.trim().replace(/\s/g, '').replace(',', '.');
  if (limpo === '') return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

/** Número em pt-BR (vírgula decimal). */
export function formatarNumero(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });
}

/** Valor numérico vindo do banco → texto editável no campo. */
export function numeroParaTexto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '';
  if (typeof valor === 'number') return String(valor).replace('.', ',');
  return String(valor);
}

export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatarNumero(bytes / 1024, 0)} KB`;
  return `${formatarNumero(bytes / (1024 * 1024), 1)} MB`;
}

export function horaCurta(data: Date): string {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function gerarId(prefixo: string): string {
  const aleatorio = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefixo}-${aleatorio}`;
}
