import { useRef } from 'react';
import { DADOS_CLINICOS_TEXTOS, LIMITE_ANEXO_BYTES, TIPOS_ANEXO_ACEITOS } from '@shared/constants/common.ts';
import type { Anexo } from '@shared/types.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { formatarBytes, gerarId } from '../../lib/formatos.ts';
import { useAvisos } from '../Avisos.tsx';
import { Icone } from '../Icone.tsx';
import { Subtitulo } from '../form/Subtitulo.tsx';

function lerArquivo(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(arquivo);
  });
}

export function Anexos() {
  const { estado, acoes } = useFichaContexto();
  const avisar = useAvisos();
  const entrada = useRef<HTMLInputElement>(null);

  async function adicionar(arquivos: FileList | null) {
    if (!arquivos) return;
    const novos: Anexo[] = [];
    for (const arquivo of Array.from(arquivos)) {
      if (arquivo.size > LIMITE_ANEXO_BYTES) {
        avisar({ tipo: 'alerta', titulo: 'Arquivo muito grande', mensagem: `${arquivo.name} excede ${formatarBytes(LIMITE_ANEXO_BYTES)}.` });
        continue;
      }
      novos.push({
        id: gerarId('anexo'),
        nome_arquivo: arquivo.name,
        tipo_mime: arquivo.type || 'application/octet-stream',
        tamanho_bytes: arquivo.size,
        conteudo_base64: await lerArquivo(arquivo),
      });
    }
    if (novos.length) acoes.definirAnexos((lista) => [...lista, ...novos]);
    if (entrada.current) entrada.current.value = '';
  }

  return (
    <div className="bloco">
      <Subtitulo>{DADOS_CLINICOS_TEXTOS.anexosSubtitulo}</Subtitulo>
      <div className="bloco__conteudo anexos">
        {estado.anexos.map((anexo) => (
          <span key={anexo.id} className="anexo">
            <Icone nome={anexo.tipo_mime.startsWith('image/') ? 'image' : 'description'} />
            <a className="anexo__nome" href={anexo.conteudo_base64} download={anexo.nome_arquivo} title={anexo.nome_arquivo}>
              {anexo.nome_arquivo}
            </a>
            <span className="anexo__tamanho">{formatarBytes(anexo.tamanho_bytes)}</span>
            <button
              type="button"
              className="botao-icone"
              aria-label={`Remover ${anexo.nome_arquivo}`}
              onClick={() => acoes.definirAnexos((lista) => lista.filter((a) => a.id !== anexo.id))}
            >
              <Icone nome="close" />
            </button>
          </span>
        ))}
        <button type="button" className="botao botao--secundario botao--pequeno nao-imprimir" onClick={() => entrada.current?.click()}>
          <Icone nome="upload_file" />
          {DADOS_CLINICOS_TEXTOS.anexosBotao}
        </button>
        <input
          ref={entrada}
          type="file"
          accept={TIPOS_ANEXO_ACEITOS}
          multiple
          hidden
          onChange={(evento) => void adicionar(evento.target.files)}
        />
      </div>
    </div>
  );
}
