# Página Acervo

## O que ela faz?

Exibe todos os livros disponíveis na biblioteca. O usuário pode pesquisar por título, autor ou ISBN, filtrar por categoria e reservar livros disponíveis.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/livros?busca=X&categoria=Y` | Lista livros com filtros opcionais |
| POST | `/api/v1/reservas` com `{ livroId }` | Cria uma reserva para o leitor logado |

## Disponibilidade dos livros

Calculada a partir dos exemplares: se há ao menos 1 exemplar com `disponivel: true`, o livro aparece como disponível. Caso contrário, o botão de reserva fica desabilitado.

## Como adicionar um novo filtro

1. Adicione um `<select>` ou `<input>` no bloco `.acervo-search-bar`
2. Adicione o estado com `useState`
3. Passe como parâmetro no `api.get('/livros', { params: { ... } })`
