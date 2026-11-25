import { CLINICA, TCLE_CLAUSULAS, TCLE_TEXTOS } from '@shared/constants/common.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { dataPorExtenso } from '../../lib/formatos.ts';
import { Assinatura } from './Assinatura.tsx';

export const ID_ACEITE = 'tcle-aceite';
export const ID_ASSINATURA = 'tcle-assinatura';

export function Tcle() {
  const { estado, acoes, mostrarErros } = useFichaContexto();
  const { tcle, identificacao } = estado;
  const erroAceite = mostrarErros && !tcle.aceito;
  const erroAssinatura = mostrarErros && !tcle.assinatura_png;

  return (
    <>
      <div className="tcle__termo">
        <p className="tcle__abertura">
          {TCLE_TEXTOS.aberturaAntes}
          <span className="tcle__nome">{identificacao.nome || '____________'}</span>
          {TCLE_TEXTOS.aberturaDepois}
        </p>
        <ol className="tcle__clausulas">
          {TCLE_CLAUSULAS.map((clausula, indice) => (
            <li key={indice} className="tcle__clausula">
              <span className="tcle__numero" aria-hidden="true">
                {indice + 1}
              </span>
              <span>{clausula}</span>
            </li>
          ))}
        </ol>
        <p className="tcle__data">
          {CLINICA.cidade}, {dataPorExtenso(identificacao.data_avaliacao)}.
        </p>
      </div>

      <label className={`tcle__aceite${tcle.aceito ? ' tcle__aceite--marcado' : ''}${erroAceite ? ' tcle__aceite--erro' : ''}`}>
        <input
          id={ID_ACEITE}
          type="checkbox"
          checked={tcle.aceito}
          aria-required="true"
          aria-invalid={erroAceite || undefined}
          onChange={(evento) => acoes.definirTcle({ aceito: evento.target.checked })}
        />
        <span>
          {TCLE_TEXTOS.aceite}{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </span>
      </label>

      <div className="campo">
        <label className="campo__rotulo" htmlFor={ID_ASSINATURA}>
          {TCLE_TEXTOS.assinatura}{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <Assinatura
          id={ID_ASSINATURA}
          valor={tcle.assinatura_png}
          erro={erroAssinatura}
          dica={TCLE_TEXTOS.assinaturaDica}
          descricao={tcle.assinatura_png ? 'Assinatura do paciente registrada' : TCLE_TEXTOS.assinaturaDica}
          aoAlterar={(assinatura_png) => acoes.definirTcle({ assinatura_png })}
        />
        {erroAssinatura && <p className="campo__erro">Colete a assinatura do paciente.</p>}
      </div>
    </>
  );
}
