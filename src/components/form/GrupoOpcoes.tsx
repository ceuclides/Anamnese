import type { Opcao } from '@shared/forms.ts';
import { Icone } from '../Icone.tsx';

interface GrupoOpcoesProps {
  nome: string;
  rotulo?: string;
  opcoes: Opcao[];
  disposicao?: 'fluxo' | 'grade';
  multiplo: boolean;
  selecionados: string[];
  aoAlternar: (valor: string) => void;
}

/** Grupo de chips de checkbox (múltipla escolha) ou radio (escolha única). */
export function GrupoOpcoes({ nome, rotulo, opcoes, disposicao = 'fluxo', multiplo, selecionados, aoAlternar }: GrupoOpcoesProps) {
  const iconeMarcado = multiplo ? 'check_box' : 'radio_button_checked';
  const iconeVazio = multiplo ? 'check_box_outline_blank' : 'radio_button_unchecked';

  return (
    <fieldset className="grupo-opcoes">
      <legend className={rotulo ? 'grupo-opcoes__rotulo' : 'sr-only'}>{rotulo ?? nome}</legend>
      <div className={`grupo-opcoes__lista${disposicao === 'grade' ? ' grupo-opcoes__lista--grade' : ''}`}>
        {opcoes.map((opcao) => {
          const marcado = selecionados.includes(opcao.valor);
          return (
            <label key={opcao.valor} className={`chip${marcado ? ' chip--marcado' : ''}`}>
              <input
                type={multiplo ? 'checkbox' : 'radio'}
                name={nome}
                value={opcao.valor}
                checked={marcado}
                onChange={() => aoAlternar(opcao.valor)}
                onClick={() => {
                  // Permite desmarcar uma opção única clicando novamente.
                  if (!multiplo && marcado) aoAlternar(opcao.valor);
                }}
              />
              <Icone nome={marcado ? iconeMarcado : iconeVazio} />
              {opcao.rotulo}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
