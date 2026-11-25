import { useMemo, type ReactNode } from 'react';
import type { SecaoInfo } from '@shared/forms.ts';
import type { FichaTipo } from '@shared/types.ts';
import { useAvisos } from '../components/Avisos.tsx';
import { BarraPendencias } from '../components/layout/BarraPendencias.tsx';
import { CabecalhoFicha } from '../components/layout/CabecalhoFicha.tsx';
import { NavegacaoSecoes } from '../components/layout/NavegacaoSecoes.tsx';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { ID_QUEIXA } from '../components/secoes/QueixaHda.tsx';
import { ID_ACEITE, ID_ASSINATURA } from '../components/secoes/Tcle.tsx';
import { FichaContext } from '../hooks/FichaContext.tsx';
import { useFicha, type ResultadoAcaoSalvar } from '../hooks/useFicha.ts';
import { useSecaoAtiva } from '../hooks/useSecaoAtiva.ts';
import type { ChavePendencia } from '../types.ts';

const ALVO_PENDENCIA: Record<ChavePendencia, string> = {
  queixa: ID_QUEIXA,
  aceite: ID_ACEITE,
  assinatura: ID_ASSINATURA,
};

interface PaginaFichaProps {
  tipo: FichaTipo;
  titulo: string;
  secoes: SecaoInfo[];
  children: ReactNode;
}

export function PaginaFicha({ tipo, titulo, secoes, children }: PaginaFichaProps) {
  const controle = useFicha(tipo);
  const { estado, meta, salvar, pendencias, setMostrarErros } = controle;
  const avisar = useAvisos();
  const ids = useMemo(() => secoes.map((s) => s.id), [secoes]);
  const [ativa, irPara] = useSecaoAtiva(ids);

  const rotuloVersao = meta.ref ? `Rascunho v${meta.versao}` : `Nova versão v${meta.versao}`;

  function navegarParaProximaPagina() {
    const proximaRota = tipo === 'facial' ? '#/corporal' : '#/facial';
    window.location.hash = proximaRota;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function informarResultado(resultado: ResultadoAcaoSalvar) {
    if (!resultado.ok) {
      if (resultado.erro) {
        avisar({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: resultado.detalhes?.join(' ') || resultado.erro });
      }
      return;
    }
    const destino = resultado.origem === 'api' ? 'no banco SQL Server' : 'neste navegador';
    const complemento = resultado.origem === 'local' ? ' A API local não respondeu; a ficha será sincronizada quando ela estiver ativa.' : '';
    avisar({
      tipo: resultado.origem === 'api' ? 'sucesso' : 'alerta',
      titulo: resultado.status === 'concluida' ? `Versão v${resultado.versao} salva` : `Rascunho v${resultado.versao} salvo`,
      mensagem: `Gravado ${destino}.${complemento}`,
    });

    // Se salvou com sucesso e não há pendências, avança para a próxima página
    if (pendencias.length === 0) {
      window.setTimeout(() => {
        navegarParaProximaPagina();
      }, 700);
    }
  }

  async function salvarFicha() {
    // Se não há pendências obrigatórias, salva como concluída; caso contrário, salva rascunho
    const statusDesejado = pendencias.length === 0 ? 'concluida' : 'rascunho';
    informarResultado(await salvar(statusDesejado));
  }

  async function concluirVersao() {
    if (pendencias.length > 0) {
      setMostrarErros(true);
      const alvo = document.getElementById(ALVO_PENDENCIA[pendencias[0].chave]);
      alvo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => alvo?.focus({ preventScroll: true }), 350);
      avisar({
        tipo: 'alerta',
        titulo: 'Complete os itens obrigatórios',
        mensagem: `Pendente: ${pendencias.map((p) => p.rotulo).join(', ')}. Use "Salvar ficha" para guardar como rascunho.`,
      });
      return;
    }
    informarResultado(await salvar('concluida'));
  }

  return (
    <FichaContext.Provider value={controle}>
      <div className="app">
        <Sidebar />
        <main className="app__principal">
          <div className="app__conteudo">
            <CabecalhoFicha
              titulo={titulo}
              nomePaciente={estado.identificacao.nome}
              rotuloVersao={rotuloVersao}
              salvando={meta.salvando}
              aoSalvar={salvarFicha}
            />
            <form
              className="ficha"
              aria-busy={meta.carregando}
              noValidate
              onSubmit={(evento) => {
                evento.preventDefault();
                void salvarFicha();
              }}
            >
              <NavegacaoSecoes secoes={secoes} ativa={ativa} aoSelecionar={irPara} />
              <div className="ficha__secoes">
                {children}
                <BarraPendencias
                  pendencias={pendencias.map((p) => p.rotulo)}
                  versao={meta.versao}
                  salvando={meta.salvando}
                  ultimoSalvamento={meta.ultimoSalvamento}
                  origem={meta.origem}
                  alterado={meta.alterado}
                  aoConcluir={concluirVersao}
                />
              </div>
            </form>
          </div>
        </main>
      </div>
    </FichaContext.Provider>
  );
}
