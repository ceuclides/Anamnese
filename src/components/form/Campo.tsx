import type { ReactNode } from 'react';

interface CampoProps {
  id: string;
  rotulo: ReactNode;
  obrigatorio?: boolean;
  erro?: string | null;
  children: ReactNode;
  className?: string;
}

/** Rótulo + controle + mensagem de erro (padrão TextF / AreaF do Figma). */
export function Campo({ id, rotulo, obrigatorio, erro, children, className }: CampoProps) {
  return (
    <div className={`campo${className ? ` ${className}` : ''}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio && (
          <>
            {' '}
            <span className="obrigatorio" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      {children}
      {erro && (
        <p className="campo__erro" id={`${id}-erro`}>
          {erro}
        </p>
      )}
    </div>
  );
}
