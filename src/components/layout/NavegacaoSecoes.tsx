import type { SecaoInfo } from '@shared/forms.ts';

interface NavegacaoSecoesProps {
  secoes: SecaoInfo[];
  ativa: string;
  aoSelecionar: (id: string) => void;
}

export function NavegacaoSecoes({ secoes, ativa, aoSelecionar }: NavegacaoSecoesProps) {
  return (
    <nav className="secoes-nav" aria-label="Seções da ficha">
      <ol className="secoes-nav__lista">
        {secoes.map((secao) => {
          const atual = secao.id === ativa;
          return (
            <li key={secao.id}>
              <a
                href={`#${secao.id}`}
                className={`secoes-nav__link${atual ? ' secoes-nav__link--ativo' : ''}`}
                aria-current={atual ? 'step' : undefined}
                onClick={(evento) => {
                  evento.preventDefault();
                  aoSelecionar(secao.id);
                }}
              >
                <span className="secoes-nav__numero">{secao.numero}</span>
                <span className="secoes-nav__rotulo">{secao.rotuloNav}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
