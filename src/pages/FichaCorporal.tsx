import {
  CORPORAL_ANTECEDENTES,
  CORPORAL_EXAME,
  CORPORAL_HABITOS,
  CORPORAL_MAPA,
  CORPORAL_OBSERVACOES,
  CORPORAL_SECOES,
  CORPORAL_TITULO,
} from '@shared/constants/corporal.ts';
import { BlocoCampos } from '../components/form/BlocoCampos.tsx';
import { Subtitulo } from '../components/form/Subtitulo.tsx';
import { CardSecao } from '../components/layout/CardSecao.tsx';
import { Anexos } from '../components/secoes/Anexos.tsx';
import { Identificacao } from '../components/secoes/Identificacao.tsx';
import { MapaMarcacoes } from '../components/secoes/MapaMarcacoes.tsx';
import { Medidas } from '../components/secoes/Medidas.tsx';
import { PerfilMorfologico } from '../components/secoes/PerfilMorfologico.tsx';
import { QueixaHda } from '../components/secoes/QueixaHda.tsx';
import { Tcle } from '../components/secoes/Tcle.tsx';
import { PaginaFicha } from './PaginaFicha.tsx';

const [identificacao, dadosClinicos, habitos, antecedentes, exame, morfologico, medidas, tcle] = CORPORAL_SECOES;

export function FichaCorporal() {
  return (
    <PaginaFicha tipo="corporal" titulo={CORPORAL_TITULO} secoes={CORPORAL_SECOES}>
      <CardSecao secao={identificacao}>
        <Identificacao />
      </CardSecao>

      <CardSecao secao={dadosClinicos}>
        <QueixaHda />
        <Anexos />
      </CardSecao>

      <CardSecao secao={habitos}>
        {CORPORAL_HABITOS.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
      </CardSecao>

      <CardSecao secao={antecedentes}>
        {CORPORAL_ANTECEDENTES.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
      </CardSecao>

      <CardSecao secao={exame}>
        {CORPORAL_EXAME.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
        <div className="bloco">
          <Subtitulo>{CORPORAL_MAPA.subtitulo}</Subtitulo>
          <div className="bloco__conteudo medidas">
            <MapaMarcacoes config={CORPORAL_MAPA} layout="lado-a-lado" />
            <BlocoCampos bloco={CORPORAL_OBSERVACOES} />
          </div>
        </div>
      </CardSecao>

      <CardSecao secao={morfologico}>
        <PerfilMorfologico />
      </CardSecao>

      <CardSecao secao={medidas}>
        <Medidas />
      </CardSecao>

      <CardSecao secao={tcle}>
        <Tcle />
      </CardSecao>
    </PaginaFicha>
  );
}
