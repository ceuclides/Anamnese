interface SimNaoProps {
  nome: string;
  pergunta: string;
  valor: boolean | null;
  aoAlterar: (valor: boolean | null) => void;
  largo?: boolean;
}

/** Pergunta com alternância Sim / Não (componente YesNo do Figma). Clicar de novo limpa a resposta. */
export function SimNao({ nome, pergunta, valor, aoAlterar, largo }: SimNaoProps) {
  const opcoes: { rotulo: string; valor: boolean }[] = [
    { rotulo: 'Sim', valor: true },
    { rotulo: 'Não', valor: false },
  ];
  return (
    <fieldset className={`simnao${largo ? ' simnao--largo' : ''}`}>
      <legend className="sr-only">{pergunta}</legend>
      <span className="simnao__pergunta" aria-hidden="true">
        {pergunta}
      </span>
      <div className="simnao__opcoes">
        {opcoes.map((opcao) => (
          <label key={opcao.rotulo} className="simnao__opcao">
            <input
              type="radio"
              name={nome}
              checked={valor === opcao.valor}
              onChange={() => aoAlterar(opcao.valor)}
              onClick={() => {
                if (valor === opcao.valor) aoAlterar(null);
              }}
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
