export class ErroHttp extends Error {
  status: number;
  detalhes?: string[];

  constructor(status: number, mensagem: string, detalhes?: string[]) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}
