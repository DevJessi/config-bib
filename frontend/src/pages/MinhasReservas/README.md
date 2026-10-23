# Página Minhas Reservas

## O que ela faz?

Lista as reservas ativas do leitor logado, mostrando status (PENDENTE, CONFIRMADA) e posição na fila de espera. Permite cancelar reservas.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/reservas/minhas` | Lista as reservas do leitor autenticado |
| DELETE | `/api/v1/reservas/:id` | Cancela uma reserva específica |

## Fila de espera (ADR-004)

Quando `posicaoFila > 1`, o sistema exibe "Fila: Xª posição" para o leitor saber que está aguardando.

## Como adicionar nova informação nos cards

Basta adicionar um `<span>` dentro de `.reserva-meta` no JSX.
