import { PACIENTE_ATUAL, PROCEDIMENTO_ATUAL } from '@shared/constants/common.ts';
import { Icone } from '../Icone.tsx';

interface CabecalhoFichaProps {
  titulo: string;
  nomePaciente: string;
  rotuloVersao: string;
  salvando: boolean;
  aoSalvar: () => void;
}

export function CabecalhoFicha({ titulo, nomePaciente, rotuloVersao, salvando, aoSalvar }: CabecalhoFichaProps) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__topo">
        <a className="cabecalho__voltar" href="#" onClick={(evento) => evento.preventDefault()}>
          <Icone nome="arrow_back" />
          Painel de atendimentos
        </a>
      </div>
      <div className="cabecalho__linha">
        <div>
          <p className="cabecalho__procedimento">{PROCEDIMENTO_ATUAL}</p>
          <h1 className="cabecalho__titulo">{titulo}</h1>
          <div className="cabecalho__meta">
            <span className="paciente-chip">
              <span className="paciente-chip__avatar">
                <Icone nome="person" />
              </span>
              <span className="paciente-chip__nome">{nomePaciente || PACIENTE_ATUAL.identificacao.nome}</span>
              <span className="paciente-chip__cpf">· {PACIENTE_ATUAL.cpf}</span>
            </span>
            <span className="versao-badge">
              <Icone nome="edit_note" />
              {rotuloVersao}
            </span>
          </div>
        </div>
        <div className="cabecalho__acoes">
          <button type="button" className="botao botao--secundario" onClick={() => window.print()}>
            <Icone nome="print" />
            Imprimir
          </button>
          <button type="button" className="botao botao--primario" onClick={aoSalvar} disabled={salvando}>
            <Icone nome={salvando ? 'progress_activity' : 'save'} />
            Salvar ficha
          </button>
        </div>
      </div>
    </header>
  );
}
