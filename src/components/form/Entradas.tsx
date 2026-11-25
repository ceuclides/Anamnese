import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type EntradaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  valor: string;
  aoAlterar: (valor: string) => void;
  sufixo?: string;
};

export function Entrada({ valor, aoAlterar, sufixo, className, type = 'text', ...resto }: EntradaProps) {
  const campo = (
    <input
      {...resto}
      type={type}
      className={`entrada${className ? ` ${className}` : ''}`}
      value={valor}
      data-vazio={type === 'date' ? String(valor === '') : undefined}
      onChange={(evento) => aoAlterar(evento.target.value)}
    />
  );
  if (!sufixo) return campo;
  return (
    <div className="entrada-sufixo">
      {campo}
      <span className="entrada-sufixo__unidade" aria-hidden="true">
        {sufixo}
      </span>
    </div>
  );
}

type NumeroProps = Omit<EntradaProps, 'type' | 'inputMode'>;

/** Campo numérico em pt-BR: aceita vírgula ou ponto como separador decimal. */
export function EntradaNumero({ aoAlterar, ...resto }: NumeroProps) {
  return (
    <Entrada
      {...resto}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aoAlterar={(valor) => aoAlterar(valor.replace(/[^\d.,-]/g, ''))}
    />
  );
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  valor: string;
  aoAlterar: (valor: string) => void;
  linhas?: number;
};

/** Altura do design: 2 linhas = 70,35px; 3 = 94,7px; 4 = 119,1px. */
export function AreaTexto({ valor, aoAlterar, linhas = 2, className, style, ...resto }: AreaProps) {
  return (
    <textarea
      {...resto}
      className={`entrada entrada--area${className ? ` ${className}` : ''}`}
      value={valor}
      rows={linhas}
      style={{ minHeight: 21.6 + linhas * 24.375, ...style }}
      onChange={(evento) => aoAlterar(evento.target.value)}
    />
  );
}
