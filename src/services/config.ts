/**
 * Endereço da API local.
 * • Em desenvolvimento usa o proxy do Vite (/api → http://127.0.0.1:3333).
 * • No build (GitHub Pages) defina VITE_API_URL, ex.: VITE_API_URL=http://localhost:3333/api
 *   Sem essa variável, as fichas são gravadas no armazenamento local do navegador.
 */
const definida = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL: string | null = definida?.trim()
  ? definida.trim().replace(/\/$/, '')
  : import.meta.env.DEV
    ? '/api'
    : null;

export const TEMPO_LIMITE_API_MS = 6000;
export const CHAVE_ARMAZENAMENTO_LOCAL = 'clinica-escola:anamnese:v1';
