# Página Cadastrar Livro

## O que ela faz?

Permite que bibliotecários cadastrem novos títulos no acervo, incluindo os exemplares físicos. O **código de patrimônio** de cada exemplar é gerado pelo backend (`PAT-` + 8 primeiros caracteres do id do exemplar) e mostrado após o cadastro.

## Endpoint chamado

`POST /api/v1/livros` com body:
```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "editora": "3ª edição",
  "anoPublicacao": 1899,
  "exemplares": [
    { "volume": "" },
    { "volume": "Vol. 2" }
  ]
}
```
Cada item de `exemplares` cria um exemplar. `volume`, `editora` (gravada em `books.edition`) e `anoPublicacao` (gravado em `exemplars.print_year`) são opcionais.

## Validações feitas no front

- Título e Autor são obrigatórios
- Ao menos um exemplar (sempre há uma linha na tela)

## Quem pode acessar?

Apenas usuários com papel `BIBLIOTECARIO` ou `ADMIN` (protegido pela rota no `AppRoutes.tsx` e também no backend).
