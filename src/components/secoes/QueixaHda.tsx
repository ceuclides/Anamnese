import type { CSSProperties } from 'react';
import { DADOS_CLINICOS_TEXTOS } from '@shared/constants/common.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { Campo } from '../form/Campo.tsx';
import { AreaTexto } from '../form/Entradas.tsx';

export const ID_QUEIXA = 'campo-queixa-principal';

export function QueixaHda() {
  const { estado, acoes, mostrarErros } = useFichaContexto();
  const erroQueixa = mostrarErros && !estado.queixa_principal.trim();

  return (
    <div className="grade" style={{ '--colunas': 1, '--gap-x': '20px', '--gap-y': '20px' } as CSSProperties}>
      <Campo id={ID_QUEIXA} rotulo={DADOS_CLINICOS_TEXTOS.queixa} obrigatorio erro={erroQueixa ? 'Informe a queixa principal.' : null}>
        <AreaTexto
          id={ID_QUEIXA}
          valor={estado.queixa_principal}
          placeholder={DADOS_CLINICOS_TEXTOS.queixaPlaceholder}
          aria-required="true"
          aria-invalid={erroQueixa || undefined}
          aria-describedby={erroQueixa ? `${ID_QUEIXA}-erro` : undefined}
          aoAlterar={acoes.definirQueixa}
        />
      </Campo>
      <Campo id="campo-hda" rotulo={DADOS_CLINICOS_TEXTOS.hda}>
        <AreaTexto id="campo-hda" linhas={4} valor={estado.hda} placeholder={DADOS_CLINICOS_TEXTOS.hdaPlaceholder} aoAlterar={acoes.definirHda} />
      </Campo>
    </div>
  );
}
