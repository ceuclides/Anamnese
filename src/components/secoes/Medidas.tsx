import { MEDIDAS_TEXTOS } from '@shared/constants/corporal.ts';
import type { TipoMedida } from '@shared/types.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { calcularDelta } from '../../lib/calculos.ts';
import { formatarNumero } from '../../lib/formatos.ts';
import { Campo } from '../form/Campo.tsx';
import { Entrada, EntradaNumero } from '../form/Entradas.tsx';

const COLUNAS = ['inicio', 'durante', 'alta'] as const;

function TabelaMedidas({ tipo, larguraRegiao }: { tipo: TipoMedida; larguraRegiao: string }) {
  const { estado, acoes } = useFichaContexto();
  const textos = MEDIDAS_TEXTOS[tipo];
  const linhas = estado.medidas.filter((m) => m.tipo === tipo);

  return (
    <div className="tabela">
      <table>
        <colgroup>
          <col style={{ width: larguraRegiao }} />
          <col />
          <col />
          <col />
          <col style={{ width: 64 }} />
        </colgroup>
        <thead>
          <tr className="tabela__titulo">
            <th colSpan={5} scope="colgroup">
              {textos.titulo} <span className="tabela__unidade">{textos.unidade}</span>
            </th>
          </tr>
          <tr className="tabela__cabecalho-claro">
            <th scope="col">{MEDIDAS_TEXTOS.colunas.regiao}</th>
            {COLUNAS.map((coluna) => {
              const chave = `${tipo}_data_${coluna}`;
              return (
                <th key={coluna} scope="col">
                  {MEDIDAS_TEXTOS.colunas[coluna]}
                  <Entrada
                    type="date"
                    aria-label={`Data da medição — ${MEDIDAS_TEXTOS.colunas[coluna]} (${textos.titulo})`}
                    valor={String(estado.campos[chave] ?? '')}
                    aoAlterar={(valor) => acoes.definirCampo(chave, valor)}
                  />
                </th>
              );
            })}
            <th scope="col">{MEDIDAS_TEXTOS.colunas.delta}</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => {
            const delta = calcularDelta(linha.inicio, linha.durante, linha.alta);
            const classeDelta = delta === null || delta === 0 ? '' : delta < 0 ? ' tabela__delta--reducao' : ' tabela__delta--aumento';
            return (
              <tr key={linha.regiao}>
                <th scope="row" className="tabela__regiao">
                  {linha.regiao}
                </th>
                {COLUNAS.map((coluna) => (
                  <td key={coluna}>
                    <EntradaNumero
                      aria-label={`${linha.regiao} — ${MEDIDAS_TEXTOS.colunas[coluna]}`}
                      valor={linha[coluna]}
                      aoAlterar={(valor) => acoes.definirMedida(tipo, linha.regiao, coluna, valor)}
                    />
                  </td>
                ))}
                <td className={`tabela__delta${classeDelta}`}>
                  {delta === null ? '—' : `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${formatarNumero(Math.abs(delta), 1)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Medidas() {
  const { estado, acoes } = useFichaContexto();
  const bio = MEDIDAS_TEXTOS.bioimpedancia;

  return (
    <div className="medidas">
      <TabelaMedidas tipo="perimetria" larguraRegiao="20.3%" />
      <div className="medidas__inferior">
        <TabelaMedidas tipo="plicometria" larguraRegiao="21.4%" />
        <div className="bioimpedancia">
          <p className="bioimpedancia__titulo">{bio.titulo}</p>
          <Campo id={`campo-${bio.chave}`} rotulo={bio.rotulo}>
            <EntradaNumero
              id={`campo-${bio.chave}`}
              sufixo={bio.sufixo}
              valor={String(estado.campos[bio.chave] ?? '')}
              aoAlterar={(valor) => acoes.definirCampo(bio.chave, valor)}
            />
          </Campo>
        </div>
      </div>
    </div>
  );
}
