import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icone } from './Icone.tsx';

type TipoAviso = 'sucesso' | 'alerta' | 'erro';

interface Aviso {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  mensagem?: string;
}

type Avisar = (aviso: Omit<Aviso, 'id'>) => void;

const AvisosContext = createContext<Avisar>(() => {});

const ICONES: Record<TipoAviso, string> = { sucesso: 'check_circle', alerta: 'error', erro: 'cancel' };

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const sequencia = useRef(0);

  const avisar = useCallback<Avisar>((aviso) => {
    sequencia.current += 1;
    const id = sequencia.current;
    setAvisos((lista) => [...lista.slice(-2), { ...aviso, id }]);
    window.setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 6000);
  }, []);

  const valor = useMemo(() => avisar, [avisar]);

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`aviso aviso--${aviso.tipo}`}>
            <Icone nome={ICONES[aviso.tipo]} />
            <div>
              <p className="aviso__titulo">{aviso.titulo}</p>
              {aviso.mensagem && <p>{aviso.mensagem}</p>}
            </div>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export function useAvisos(): Avisar {
  return useContext(AvisosContext);
}
