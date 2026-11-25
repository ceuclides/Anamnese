import { useState, type MouseEvent } from 'react';
import type { Opcao } from '@shared/forms.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { gerarId } from '../../lib/formatos.ts';
import { Icone } from '../Icone.tsx';

interface MapaConfig {
  imagem: string;
  larguraNatural: number;
  alturaNatural: number;
  alt: string;
  dica: string;
  vistas: readonly { valor: string; rotulo: string }[];
  alteracoes?: readonly Opcao[];
  graus?: readonly Opcao[];
}

interface MapaMarcacoesProps {
  config: MapaConfig;
  /** "lado-a-lado" = imagem e lista em duas colunas (ficha corporal). */
  layout: 'empilhado' | 'lado-a-lado';
}

const limitar = (valor: number) => Math.min(100, Math.max(0, Math.round(valor * 10) / 10));

export function MapaMarcacoes({ config, layout }: MapaMarcacoesProps) {
  const { estado, acoes } = useFichaContexto();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const { marcacoes } = estado;
  const rotuloVista = (valor: string) => config.vistas.find((v) => v.valor === valor)?.rotulo ?? valor;

  function marcar(evento: MouseEvent<HTMLDivElement>) {
    if ((evento.target as HTMLElement).closest('.mapa__ponto')) return;
    const area = evento.currentTarget.getBoundingClientRect();
    const x = limitar(((evento.clientX - area.left) / area.width) * 100);
    const y = limitar(((evento.clientY - area.top) / area.height) * 100);
    // Cada terço da imagem corresponde a uma vista (ex.: perfil, frontal, posterior).
    const indiceVista = Math.min(config.vistas.length - 1, Math.floor((x / 100) * config.vistas.length));
    const id = gerarId('marcacao');
    acoes.definirMarcacoes((lista) => [
      ...lista,
      { id, vista: config.vistas[indiceVista].valor, pos_x: x, pos_y: y, alteracao: null, grau: null, descricao: '' },
    ]);
    setSelecionada(id);
    requestAnimationFrame(() => document.getElementById(`${id}-descricao`)?.focus());
  }

  function alterar(id: string, parcial: Partial<(typeof marcacoes)[number]>) {
    acoes.definirMarcacoes((lista) => lista.map((m) => (m.id === id ? { ...m, ...parcial } : m)));
  }

  function remover(id: string) {
    acoes.definirMarcacoes((lista) => lista.filter((m) => m.id !== id));
    if (selecionada === id) setSelecionada(null);
  }

  const comAlteracoes = Boolean(config.alteracoes && config.graus);

  return (
    <div className={`mapa${layout === 'lado-a-lado' ? ' mapa--lado-a-lado' : ''}`}>
      <div className="mapa__figura">
        <div className="mapa__moldura" onClick={marcar} role="presentation">
          <img
            className="mapa__imagem"
            src={`${import.meta.env.BASE_URL}${config.imagem}`}
            alt={config.alt}
            width={config.larguraNatural}
            height={config.alturaNatural}
            draggable={false}
          />
          {marcacoes.map((m, indice) => (
            <button
              key={m.id}
              type="button"
              className={`mapa__ponto${selecionada === m.id ? ' mapa__ponto--ativo' : ''}`}
              style={{ left: `${m.pos_x}%`, top: `${m.pos_y}%` }}
              aria-label={`Marcação ${indice + 1} (${rotuloVista(m.vista)})`}
              onClick={() => {
                setSelecionada(m.id);
                document.getElementById(`${m.id}-descricao`)?.focus();
              }}
            >
              {indice + 1}
            </button>
          ))}
        </div>
        <div className="mapa__vistas" aria-hidden="true">
          {config.vistas.map((vista) => (
            <span key={vista.valor} className="mapa__vista">
              {vista.rotulo}
            </span>
          ))}
        </div>
      </div>

      <div className="mapa__painel">
        <p className="mapa__dica">
          <Icone nome="touch_app" />
          {config.dica}
        </p>
        {marcacoes.length === 0 ? (
          <div className="mapa__vazio">Nenhuma região marcada</div>
        ) : (
          <ol className="marcacoes">
            {marcacoes.map((m, indice) => (
              <li
                key={m.id}
                className={`marcacao${selecionada === m.id ? ' marcacao--ativa' : ''}`}
                onFocus={() => setSelecionada(m.id)}
              >
                <span className="marcacao__numero">{indice + 1}</span>
                <span className="marcacao__vista">{rotuloVista(m.vista)}</span>
                <button type="button" className="botao-icone" aria-label={`Remover marcação ${indice + 1}`} onClick={() => remover(m.id)}>
                  <Icone nome="delete" />
                </button>
                <div className="marcacao__campos">
                  {comAlteracoes && (
                    <>
                      <select
                        className="entrada"
                        aria-label={`Alteração da marcação ${indice + 1}`}
                        value={m.alteracao ?? ''}
                        onChange={(e) => alterar(m.id, { alteracao: e.target.value || null })}
                      >
                        <option value="">Alteração</option>
                        {config.alteracoes!.map((o) => (
                          <option key={o.valor} value={o.valor}>
                            {o.rotulo}
                          </option>
                        ))}
                      </select>
                      <select
                        className="entrada"
                        aria-label={`Grau da marcação ${indice + 1}`}
                        value={m.grau ?? ''}
                        onChange={(e) => alterar(m.id, { grau: e.target.value || null })}
                      >
                        <option value="">Grau</option>
                        {config.graus!.map((o) => (
                          <option key={o.valor} value={o.valor}>
                            {o.rotulo}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  <input
                    id={`${m.id}-descricao`}
                    className="entrada marcacao__descricao"
                    placeholder="Descreva o ponto marcado"
                    aria-label={`Descrição da marcação ${indice + 1}`}
                    value={m.descricao}
                    onChange={(e) => alterar(m.id, { descricao: e.target.value })}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
