import { useEffect, useRef, type PointerEvent } from 'react';
import { Icone } from '../Icone.tsx';

interface AssinaturaProps {
  id: string;
  valor: string | null;
  aoAlterar: (dataUrl: string | null) => void;
  erro?: boolean;
  dica: string;
  descricao: string;
}

const fundo = `${import.meta.env.BASE_URL}assets/7b003.png`;

/** Área de assinatura com mouse, caneta ou toque. Exporta PNG (data URL). */
export function Assinatura({ id, valor, aoAlterar, erro, dica, descricao }: AssinaturaProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const ultimoExportado = useRef<string | null>(null);
  const valorAtual = useRef(valor);
  valorAtual.current = valor;

  /** Ajusta a resolução ao tamanho real e redesenha a assinatura salva. */
  function redesenhar() {
    const el = canvas.current;
    if (!el) return;
    const escala = window.devicePixelRatio || 1;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    el.width = Math.round(width * escala);
    el.height = Math.round(height * escala);
    const ctx = el.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const salvo = valorAtual.current;
    if (salvo) {
      const imagem = new Image();
      imagem.onload = () => ctx.drawImage(imagem, 0, 0, width, height);
      imagem.src = salvo;
    }
  }

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let largura = 0;
    const observador = new ResizeObserver(([entrada]) => {
      if (Math.abs(entrada.contentRect.width - largura) < 0.5) return;
      largura = entrada.contentRect.width;
      redesenhar();
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // Redesenha quando o valor muda por fora (carregado do banco ou limpo).
  useEffect(() => {
    if (valor !== ultimoExportado.current) redesenhar();
  }, [valor]);

  function ponto(evento: PointerEvent<HTMLCanvasElement>) {
    const area = evento.currentTarget.getBoundingClientRect();
    return { x: evento.clientX - area.left, y: evento.clientY - area.top };
  }

  function iniciar(evento: PointerEvent<HTMLCanvasElement>) {
    const ctx = evento.currentTarget.getContext('2d');
    if (!ctx) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    desenhando.current = true;
    const { x, y } = ponto(evento);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172b';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  }

  function mover(evento: PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = evento.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = ponto(evento);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function finalizar(evento: PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    desenhando.current = false;
    const dataUrl = evento.currentTarget.toDataURL('image/png');
    ultimoExportado.current = dataUrl;
    aoAlterar(dataUrl);
  }

  return (
    <div
      className={`assinatura${erro ? ' assinatura--erro' : ''}${valor ? ' assinatura--preenchida' : ''}`}
      style={{ backgroundImage: `url("${fundo}")` }}
    >
      {!valor && <span className="assinatura__dica">{dica}</span>}
      <span className="assinatura__linha" />
      <canvas
        id={id}
        ref={canvas}
        className="assinatura__canvas"
        role="img"
        aria-label={descricao}
        tabIndex={0}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={finalizar}
        onPointerCancel={finalizar}
      />
      {valor && (
        <button type="button" className="botao-icone assinatura__limpar nao-imprimir" aria-label="Limpar assinatura" title="Limpar assinatura" onClick={() => aoAlterar(null)}>
          <Icone nome="ink_eraser" />
        </button>
      )}
    </div>
  );
}
