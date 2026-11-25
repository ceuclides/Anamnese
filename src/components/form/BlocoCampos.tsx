import type { CSSProperties } from 'react';
import type { Bloco, Campo as DefinicaoCampo } from '@shared/forms.ts';
import { useFichaContexto } from '../../hooks/FichaContext.tsx';
import { Campo } from './Campo.tsx';
import { AreaTexto, Entrada, EntradaNumero } from './Entradas.tsx';
import { GrupoOpcoes } from './GrupoOpcoes.tsx';
import { SimNao } from './SimNao.tsx';
import { Subtitulo } from './Subtitulo.tsx';

function CampoDeclarado({ campo }: { campo: DefinicaoCampo }) {
  const { estado, acoes } = useFichaContexto();

  switch (campo.tipo) {
    case 'texto':
    case 'email': {
      const id = `campo-${campo.chave}`;
      return (
        <Campo id={id} rotulo={campo.rotulo}>
          <Entrada
            id={id}
            type={campo.tipo === 'email' ? 'email' : 'text'}
            valor={String(estado.campos[campo.chave] ?? '')}
            placeholder={campo.placeholder}
            aoAlterar={(valor) => acoes.definirCampo(campo.chave, valor)}
          />
        </Campo>
      );
    }
    case 'numero': {
      const id = `campo-${campo.chave}`;
      return (
        <Campo id={id} rotulo={campo.rotulo}>
          <EntradaNumero
            id={id}
            valor={String(estado.campos[campo.chave] ?? '')}
            placeholder={campo.placeholder}
            sufixo={campo.sufixo}
            aoAlterar={(valor) => acoes.definirCampo(campo.chave, valor)}
          />
        </Campo>
      );
    }
    case 'area': {
      const id = `campo-${campo.chave}`;
      return (
        <Campo id={id} rotulo={campo.rotulo}>
          <AreaTexto
            id={id}
            linhas={campo.linhas}
            valor={String(estado.campos[campo.chave] ?? '')}
            placeholder={campo.placeholder}
            aoAlterar={(valor) => acoes.definirCampo(campo.chave, valor)}
          />
        </Campo>
      );
    }
    case 'simnao': {
      const valor = estado.campos[campo.chave];
      return (
        <SimNao
          nome={`campo-${campo.chave}`}
          pergunta={campo.rotulo}
          largo={campo.largo}
          valor={typeof valor === 'boolean' ? valor : null}
          aoAlterar={(novo) => acoes.definirCampo(campo.chave, novo)}
        />
      );
    }
    case 'radio': {
      const valor = estado.campos[campo.chave];
      return (
        <GrupoOpcoes
          nome={`campo-${campo.chave}`}
          rotulo={campo.rotulo}
          opcoes={campo.opcoes}
          disposicao={campo.disposicao}
          multiplo={false}
          selecionados={typeof valor === 'string' ? [valor] : []}
          aoAlternar={(opcao) => acoes.definirCampo(campo.chave, valor === opcao ? null : opcao)}
        />
      );
    }
    case 'checks':
      return (
        <GrupoOpcoes
          nome={`grupo-${campo.grupo}`}
          rotulo={campo.rotulo}
          opcoes={campo.opcoes}
          disposicao={campo.disposicao}
          multiplo
          selecionados={estado.opcoes[campo.grupo] ?? []}
          aoAlternar={(opcao) => acoes.alternarOpcao(campo.grupo, opcao)}
        />
      );
  }
}

/** Renderiza um bloco declarado em shared/constants (subtítulo opcional + grid de campos). */
export function BlocoCampos({ bloco }: { bloco: Bloco }) {
  const estiloGrade = {
    '--colunas': bloco.colunas,
    '--gap-x': `${bloco.gapX}px`,
    '--gap-y': `${bloco.gapY}px`,
    maxWidth: bloco.larguraMaxima,
  } as CSSProperties;

  const grade = (
    <div className={`grade${bloco.painel ? ' grade--painel' : ''}`} style={estiloGrade}>
      {bloco.campos.map((campo) => (
        <div
          key={campo.tipo === 'checks' ? campo.grupo : campo.chave}
          style={{ '--span': campo.span ?? 1 } as CSSProperties}
        >
          <CampoDeclarado campo={campo} />
        </div>
      ))}
    </div>
  );

  if (!bloco.subtitulo) return grade;
  return (
    <div className="bloco">
      <Subtitulo>{bloco.subtitulo}</Subtitulo>
      <div className="bloco__conteudo">{grade}</div>
    </div>
  );
}
