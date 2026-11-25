import { FACIAL_EXAME, FACIAL_HABITOS, FACIAL_MAPA, FACIAL_MEDICAMENTOS, FACIAL_SECOES, FACIAL_TITULO } from '@shared/constants/facial.ts';
import { BlocoCampos } from '../components/form/BlocoCampos.tsx';
import { CardSecao } from '../components/layout/CardSecao.tsx';
import { Anexos } from '../components/secoes/Anexos.tsx';
import { Evolucao } from '../components/secoes/Evolucao.tsx';
import { Identificacao } from '../components/secoes/Identificacao.tsx';
import { MapaMarcacoes } from '../components/secoes/MapaMarcacoes.tsx';
import { QueixaHda } from '../components/secoes/QueixaHda.tsx';
import { Tcle } from '../components/secoes/Tcle.tsx';
import { PaginaFicha } from './PaginaFicha.tsx';

const [identificacao, dadosClinicos, habitos, exame, tcle, evolucao] = FACIAL_SECOES;

export function FichaFacial() {
  return (
    <PaginaFicha tipo="facial" titulo={FACIAL_TITULO} secoes={FACIAL_SECOES}>
      <CardSecao secao={identificacao}>
        <Identificacao />
      </CardSecao>

      <CardSecao secao={dadosClinicos}>
        <QueixaHda />
        {FACIAL_MEDICAMENTOS.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
        <Anexos />
      </CardSecao>

      <CardSecao secao={habitos}>
        {FACIAL_HABITOS.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
      </CardSecao>

      <CardSecao secao={exame}>
        <MapaMarcacoes config={FACIAL_MAPA} layout="empilhado" />
        {FACIAL_EXAME.map((bloco) => (
          <BlocoCampos key={bloco.id} bloco={bloco} />
        ))}
      </CardSecao>

      <CardSecao secao={tcle}>
        <Tcle />
      </CardSecao>

      <CardSecao secao={evolucao} compacto>
        <Evolucao />
      </CardSecao>
    </PaginaFicha>
  );
}
