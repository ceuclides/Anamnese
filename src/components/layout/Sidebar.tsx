import { useEffect, useState } from 'react';
import { ALUNO_ATUAL, CLINICA } from '@shared/constants/common.ts';
import { Icone } from '../Icone.tsx';

const logoSenac = `${import.meta.env.BASE_URL}assets/25d66.png`;

type Rota = 'facial' | 'corporal';

function rotaAtual(): Rota {
  return window.location.hash.replace(/^#\/?/, '').startsWith('corporal') ? 'corporal' : 'facial';
}

export function Sidebar() {
  const [rota, setRota] = useState<Rota>(rotaAtual);

  useEffect(() => {
    const aoMudar = () => setRota(rotaAtual());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  return (
    <aside className="sidebar" aria-label="Menu da Clínica-Escola">
      <div className="sidebar__marca">
        <img className="sidebar__logo" src={logoSenac} alt="Senac" width={62} height={36} />
        <div className="sidebar__nome">
          <span className="sidebar__nome-superior">{CLINICA.rotuloSuperior}</span>
          <span className="sidebar__nome-inferior">{CLINICA.rotuloInferior}</span>
        </div>
      </div>

      <div className="sidebar__acesso">
        <p className="sidebar__acesso-rotulo">Acesso</p>
        <p className="sidebar__acesso-valor">{ALUNO_ATUAL.perfil}</p>
      </div>

      <p className="sidebar__menu-rotulo">Fichas de Anamnese</p>
      <nav className="sidebar__menu" aria-label="Fichas de Anamnese">
        <a
          href="#/facial"
          className={`sidebar__link${rota === 'facial' ? ' sidebar__link--ativo' : ''}`}
          aria-current={rota === 'facial' ? 'page' : undefined}
        >
          <Icone nome="face" preenchido={rota === 'facial'} />
          <span className="sidebar__link-texto">Anamnese Facial</span>
        </a>

        <a
          href="#/corporal"
          className={`sidebar__link${rota === 'corporal' ? ' sidebar__link--ativo' : ''}`}
          aria-current={rota === 'corporal' ? 'page' : undefined}
        >
          <Icone nome="accessibility_new" preenchido={rota === 'corporal'} />
          <span className="sidebar__link-texto">Anamnese Corporal</span>
        </a>
      </nav>

      <div className="sidebar__rodape">
        <div className="sidebar__usuario">
          <span className="sidebar__monograma" aria-hidden="true">
            {ALUNO_ATUAL.iniciais}
          </span>
          <div className="sidebar__usuario-dados">
            <p className="sidebar__usuario-nome">{ALUNO_ATUAL.nome}</p>
            <p className="sidebar__usuario-email">{ALUNO_ATUAL.email}</p>
          </div>
          <button type="button" className="sidebar__sair" aria-label="Sair" title="Sair">
            <Icone nome="logout" />
          </button>
        </div>
      </div>
    </aside>
  );
}
