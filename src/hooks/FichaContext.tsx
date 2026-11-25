import { createContext, useContext } from 'react';
import type { ControleFicha } from './useFicha.ts';

export const FichaContext = createContext<ControleFicha | null>(null);

export function useFichaContexto(): ControleFicha {
  const contexto = useContext(FichaContext);
  if (!contexto) throw new Error('useFichaContexto deve ser usado dentro de <FichaContext.Provider>.');
  return contexto;
}
