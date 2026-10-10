# Página Quitação de Multas

## O que ela faz?

Tela para bibliotecários e admins visualizarem todos os leitores com multas pendentes e registrarem a quitação total. Após quitar, o leitor é desbloqueado automaticamente pelo backend.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/multas/pendentes?busca=X` | Lista leitores com multas abertas |
| POST | `/api/v1/multas/:leitorId/quitar` | Registra quitação total do leitor |

## Regras de negócio (ADR-006 e ADR-008)

- A coluna de multa total exibe o valor calculado automaticamente pelo backend (ADR-008).
- Leitores com `statusLeitor === 'BLOQUEADO_MULTA'` exibem o chip vermelho "BLOQUEADO".
- Após POST de quitação com sucesso, o card do leitor some da lista localmente.
- O desbloqueio efetivo do leitor ocorre no backend ao processar a quitação.

## Como adaptar para pagamento parcial

Substitua o `api.post('/multas/:id/quitar')` por um formulário com campo de valor pago e envie `{ valorPago }` no body.
