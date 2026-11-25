import type { ReactNode } from 'react';
import type { SecaoInfo } from '@shared/forms.ts';
import { Icone } from '../Icone.tsx';

interface CardSecaoProps {
  secao: SecaoInfo;
  children: ReactNode;
  compacto?: boolean;
}

export function CardSecao({ secao, children, compacto }: CardSecaoProps) {
  const idTitulo = `${secao.id}-titulo`;
  return (
    <section id={secao.id} className="card" aria-labelledby={idTitulo}>
      <div className="card__cabecalho">
        <span className="card__icone">
          <Icone nome={secao.icone} />
        </span>
        <div className="card__titulos">
          <p className="card__secao">Seção {String(secao.numero).padStart(2, '0')}</p>
          <h2 id={idTitulo} className="card__titulo">
            {secao.titulo}
          </h2>
        </div>
        {secao.descricao && <p className="card__descricao">{secao.descricao}</p>}
      </div>
      <div className={`card__corpo${compacto ? ' card__corpo--compacto' : ''}`}>{children}</div>
    </section>
  );
}
