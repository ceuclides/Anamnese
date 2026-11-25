import type { CSSProperties } from 'react';
import { IDENTIFICACAO_CAMPOS, PACIENTE_ATUAL } from '@shared/constants/common.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { calcularIdade } from '../../lib/formatos.ts';
import { Campo } from '../form/Campo.tsx';
import { Entrada } from '../form/Entradas.tsx';

const TIPO_INPUT = { texto: 'text', data: 'date', email: 'email', telefone: 'tel' } as const;

export function Identificacao() {
  const { estado, acoes } = useFichaContexto();
  const { identificacao } = estado;
  const idade = calcularIdade(identificacao.data_nascimento, identificacao.data_avaliacao || undefined) ?? (identificacao.data_nascimento ? null : PACIENTE_ATUAL.idadeCadastro);

  return (
    <div className="grade identificacao" style={{ '--colunas': 6, '--gap-x': '16px', '--gap-y': '16px' } as CSSProperties}>
      {IDENTIFICACAO_CAMPOS.flatMap((linha) => {
        const celulas = linha.map((campo) => {
          const id = `identificacao-${campo.chave}`;
          return (
            <div key={campo.chave} style={{ gridColumn: `${campo.coluna} / span ${campo.span}` }}>
              <Campo id={id} rotulo={campo.rotulo}>
                <Entrada
                  id={id}
                  type={TIPO_INPUT[campo.tipo ?? 'texto']}
                  valor={identificacao[campo.chave]}
                  autoComplete="off"
                  aoAlterar={(valor) => acoes.definirIdentificacao(campo.chave, valor)}
                />
              </Campo>
            </div>
          );
        });
        // A idade fica na coluna 3, ao lado da data de nascimento.
        if (linha.some((campo) => campo.chave === 'data_nascimento')) {
          celulas.splice(
            1,
            0,
            <div key="idade" style={{ gridColumn: '3 / span 1' }}>
              <Campo id="identificacao-idade" rotulo="Idade">
                <Entrada id="identificacao-idade" valor={idade === null ? '' : `${idade} anos`} readOnly tabIndex={-1} aoAlterar={() => {}} />
              </Campo>
            </div>,
          );
        }
        return celulas;
      })}
    </div>
  );
}
