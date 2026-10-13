# Página Acervo

## O que ela faz?

Exibe os livros da biblioteca. O usuário pesquisa por título ou autor, **pega emprestado** os livros disponíveis e **reserva** os que estão sem exemplar disponível.

## Endpoints usados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/livros?busca=X` | Lista livros (com exemplares e disponibilidade para o usuário logado) |
| POST | `/api/v1/emprestimos/solicitar` com `{ livroId }` | O leitor logado pega um exemplar disponível |
| POST | `/api/v1/reservas` com `{ livroId }` | Cria uma reserva para o leitor logado |

## Disponibilidade dos livros

Calculada pelo backend a partir dos exemplares: se há ao menos 1 exemplar com `disponivel: true`, o livro aparece como disponível e o botão é "Pegar Emprestado". Caso contrário, o botão é "Solicitar Reserva".

## Campos do livro

Só existem os campos que as migrations têm: título, autor, edição (`books.edition`) e ano de impressão (`exemplars.print_year`). ISBN e categoria não existem no banco.
