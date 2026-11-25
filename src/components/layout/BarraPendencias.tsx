import { Icone } from '../Icone.tsx';
import { horaCurta } from '../../lib/formatos.ts';

interface BarraPendenciasProps {
  pendencias: string[];
  versao: number;
  salvando: boolean;
  ultimoSalvamento: Date | null;
  origem: 'api' | 'local' | null;
  alterado: boolean;
  aoConcluir: () => void;
}

export function BarraPendencias({ pendencias, versao, salvando, ultimoSalvamento, origem, alterado, aoConcluir }: BarraPendenciasProps) {
  const completa = pendencias.length === 0;
  const destino = origem === 'local' ? 'no navegador' : 'no banco';

  return (
    <div className="barra-pendencias" role="region" aria-label="Situação da ficha">
      <div className={`barra-pendencias__status${completa ? ' barra-pendencias__status--ok' : ''}`}>
        <Icone nome={completa ? 'check_circle' : 'pending'} />
        <span className="barra-pendencias__texto">
          {completa ? `Tudo pronto para salvar a versão v${versao}.` : `Pendente: ${pendencias.join(' · ')}`}
          {ultimoSalvamento && (
            <span className="barra-pendencias__salvo">
              {' '}
              · {alterado ? 'Alterações não salvas' : `Salvo ${destino} às ${horaCurta(ultimoSalvamento)}`}
            </span>
          )}
        </span>
      </div>
      <button type="button" className="botao botao--primario" onClick={aoConcluir} disabled={salvando}>
        <Icone nome={salvando ? 'progress_activity' : 'save'} />
        Salvar como v{versao}
      </button>
    </div>
  );
}
