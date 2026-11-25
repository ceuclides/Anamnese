import type { CSSProperties } from 'react';

interface IconeProps {
  nome: string;
  preenchido?: boolean;
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}

/** Ícone Material Symbols Rounded (mesma fonte usada no Figma). */
export function Icone({ nome, preenchido, tamanho, className, style }: IconeProps) {
  return (
    <span
      className={`icone${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{
        ...(tamanho ? { fontSize: tamanho } : null),
        ...(preenchido !== undefined ? { fontVariationSettings: `"FILL" ${preenchido ? 1 : 0}, "GRAD" 0` } : null),
        ...style,
      }}
    >
      {nome}
    </span>
  );
}
