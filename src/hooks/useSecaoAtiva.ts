import { useEffect, useState } from 'react';

/** Observa a rolagem e devolve o id da seção visível mais próxima do topo. */
export function useSecaoAtiva(ids: string[]): [string, (id: string) => void] {
  const [ativa, setAtiva] = useState(ids[0] ?? '');

  useEffect(() => {
    const elementos = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elementos.length === 0) return;

    const visiveis = new Map<string, number>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) visiveis.set(entrada.target.id, entrada.boundingClientRect.top);
          else visiveis.delete(entrada.target.id);
        }
        const primeira = ids.find((id) => visiveis.has(id));
        if (primeira) setAtiva(primeira);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 },
    );
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [ids]);

  const irPara = (id: string) => {
    setAtiva(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return [ativa, irPara];
}
