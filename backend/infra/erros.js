// Erro "esperado" que vira resposta HTTP. Ex.: 409, "Email já cadastrado"
export class ErroHttp extends Error {
  constructor(status, message, extras = {}) {
    super(message);
    this.status = status;
    this.extras = extras; // campos extras no JSON de resposta (ex.: { enviarEm })
  }
}
