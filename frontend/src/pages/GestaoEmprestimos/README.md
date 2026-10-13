# Página Gestão de Empréstimos

## O que ela faz?

Tela exclusiva para bibliotecários e admins. Permite visualizar todos os empréstimos do sistema, filtrar por status e leitor/livro, registrar devoluções e criar novos empréstimos.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/emprestimos?busca=X&status=Y` | Lista empréstimos com filtros |
| POST | `/api/v1/emprestimos` | Cria novo empréstimo com `{ leitorId, codigoPatrimonio }` (`leitorId` aceita o e-mail ou o UUID do leitor) |
| POST | `/api/v1/emprestimos/:id/devolver` | Registra devolução, calcula multa automática (ADR-008) e envia o e-mail de confirmação ao leitor |

## Regras de negócio aplicadas

- **ADR-001**: Ao criar empréstimo, o prazo de 15 dias é calculado automaticamente pelo backend. O front exibe a data prevista como feedback ao usuário.
- **ADR-008**: A coluna "Multa" exibe o valor calculado automaticamente pelo backend com base nos dias de atraso.

## Como estender

Para adicionar paginação, adicione `?page=X&limit=Y` na requisição GET e controles de navegação na toolbar.
