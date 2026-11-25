import { ALUNO_ATUAL } from '@shared/constants/common.ts';
import { FACIAL_EVOLUCAO } from '@shared/constants/facial.ts';
import type { Evolucao as RegistroEvolucao } from '@shared/types.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { gerarId, hojeIso } from '../../lib/formatos.ts';
import { Icone } from '../Icone.tsx';
import { AreaTexto, Entrada } from '../form/Entradas.tsx';

export function Evolucao() {
  const { estado, acoes } = useFichaContexto();
  const [colData, colEvolucao, colAssinatura] = FACIAL_EVOLUCAO.colunas;

  const alterar = (id: string, parcial: Partial<RegistroEvolucao>) =>
    acoes.definirEvolucoes((lista) => lista.map((e) => (e.id === id ? { ...e, ...parcial } : e)));

  function adicionar() {
    const id = gerarId('evolucao');
    acoes.definirEvolucoes((lista) => [...lista, { id, data: hojeIso(), descricao: '', assinatura_aluno: ALUNO_ATUAL.nome }]);
    requestAnimationFrame(() => document.getElementById(`${id}-descricao`)?.focus());
  }

  return (
    <>
      <div className="tabela">
        <table>
          <colgroup>
            <col style={{ width: '18.5%' }} />
            <col />
            <col style={{ width: '22.2%' }} />
            <col style={{ width: 48 }} />
          </colgroup>
          <thead>
            <tr className="tabela__cabecalho-escuro">
              <th scope="col">{colData}</th>
              <th scope="col">{colEvolucao}</th>
              <th scope="col">{colAssinatura}</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {estado.evolucoes.length === 0 ? (
              <tr>
                <td className="tabela__vazio" colSpan={4}>
                  {FACIAL_EVOLUCAO.vazio}
                </td>
              </tr>
            ) : (
              estado.evolucoes.map((registro, indice) => (
                <tr key={registro.id}>
                  <td>
                    <Entrada type="date" aria-label={`Data do registro ${indice + 1}`} valor={registro.data} aoAlterar={(data) => alterar(registro.id, { data })} />
                  </td>
                  <td>
                    <AreaTexto
                      id={`${registro.id}-descricao`}
                      aria-label={`Evolução e intercorrência do registro ${indice + 1}`}
                      linhas={1}
                      valor={registro.descricao}
                      aoAlterar={(descricao) => alterar(registro.id, { descricao })}
                    />
                  </td>
                  <td>
                    <Entrada
                      aria-label={`Assinatura do aluno no registro ${indice + 1}`}
                      valor={registro.assinatura_aluno}
                      aoAlterar={(assinatura_aluno) => alterar(registro.id, { assinatura_aluno })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="botao-icone"
                      aria-label={`Remover registro ${indice + 1}`}
                      onClick={() => acoes.definirEvolucoes((lista) => lista.filter((e) => e.id !== registro.id))}
                    >
                      <Icone nome="delete" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <button type="button" className="botao botao--secundario nao-imprimir" onClick={adicionar}>
          <Icone nome="add" />
          {FACIAL_EVOLUCAO.botao}
        </button>
      </div>
    </>
  );
}
