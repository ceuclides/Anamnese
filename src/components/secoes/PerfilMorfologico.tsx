import { PERFIL_MORFOLOGICO } from '@shared/constants/corporal.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { indicesCorporais } from '../../hooks/useFicha.ts';
import { Campo } from '../form/Campo.tsx';
import { EntradaNumero } from '../form/Entradas.tsx';

export function PerfilMorfologico() {
  const { estado, acoes } = useFichaContexto();
  const { peso, estatura, referencia, imc: textosImc, rcq: textosRcq } = PERFIL_MORFOLOGICO;
  const { imc, rcq } = indicesCorporais(estado);
  const referenciaAtual = String(estado.campos[referencia.chave] ?? referencia.padrao);

  return (
    <div className="morfologico">
      <div className="morfologico__entradas">
        <Campo id={`campo-${peso.chave}`} rotulo={peso.rotulo}>
          <EntradaNumero
            id={`campo-${peso.chave}`}
            sufixo={peso.sufixo}
            valor={String(estado.campos[peso.chave] ?? '')}
            aoAlterar={(valor) => acoes.definirCampo(peso.chave, valor)}
          />
        </Campo>
        <Campo id={`campo-${estatura.chave}`} rotulo={estatura.rotulo}>
          <EntradaNumero
            id={`campo-${estatura.chave}`}
            sufixo={estatura.sufixo}
            placeholder={estatura.placeholder}
            valor={String(estado.campos[estatura.chave] ?? '')}
            aoAlterar={(valor) => acoes.definirCampo(estatura.chave, valor)}
          />
        </Campo>
        <fieldset className="morfologico__referencia">
          <legend className="campo__rotulo">{referencia.rotulo}</legend>
          <div className="morfologico__botoes">
            {referencia.opcoes.map((opcao) => (
              <label key={opcao.valor} className="alternador">
                <input
                  type="radio"
                  name={referencia.chave}
                  value={opcao.valor}
                  checked={referenciaAtual === opcao.valor}
                  onChange={() => acoes.definirCampo(referencia.chave, opcao.valor)}
                />
                {opcao.rotulo}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="morfologico__metricas" aria-live="polite">
        <div className="metrica">
          <p className="metrica__rotulo">{textosImc.rotulo}</p>
          <p className="metrica__valor">{imc?.texto ?? '—'}</p>
          <p className="metrica__ajuda">
            {imc && <span className="metrica__classificacao">{imc.classificacao}</span>}
            {textosImc.ajuda}
          </p>
        </div>
        <div className="metrica">
          <p className="metrica__rotulo">{textosRcq.rotulo}</p>
          <p className="metrica__valor">{rcq?.texto ?? '—'}</p>
          <p className="metrica__ajuda">
            {rcq ? <span className="metrica__classificacao">{rcq.classificacao}</span> : textosRcq.ajuda}
            {rcq && 'Cintura ÷ quadril (início)'}
          </p>
        </div>
      </div>
    </div>
  );
}
