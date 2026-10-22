# Página Meu Perfil

## O que ela faz?

Exibe os dados do leitor logado, seu histórico de empréstimos, status de bloqueio por multa, e permite solicitar a exclusão de dados (LGPD). Também permite renovar empréstimos ativos.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/leitores/me/perfil` | Retorna multa total, status e lista de empréstimos |
| POST | `/api/v1/emprestimos/:id/renovar` | Renova um empréstimo por mais 15 dias |
| DELETE | `/api/v1/leitores/me/lgpd` | Solicita exclusão de dados (LGPD) |

## Bloqueio por multa (ADR-006 e ADR-008)

Se `multaTotal > 20` ou `statusLeitor === 'BLOQUEADO_MULTA'`, um banner vermelho de alerta aparece no topo da seção de empréstimos e o botão de renovação fica desabilitado.

## Renovação (ADR-004)

Se o backend retornar erro mencionando "reserva" ou "fila", o sistema exibe a mensagem específica: "Renovação negada: outro leitor reservou este livro".

## LGPD (ADR-009)

O `ModalLgpd` é aberto ao clicar em "Solicitar Exclusão (LGPD)". Após confirmação, exibe mensagem de sucesso e oculta o botão.
