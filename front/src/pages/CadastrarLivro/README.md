# Página Cadastrar Livro

## O que ela faz?

Permite que bibliotecários e admins cadastrem novos títulos no acervo, incluindo os exemplares físicos com seus **Códigos de Patrimônio** únicos (ADR-002).

## Endpoint chamado

`POST /api/v1/livros` com body:
```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-85-...",
  "categoria": "Literatura Brasileira",
  "editora": "...",
  "anoPublicacao": 1899,
  "sinopse": "...",
  "exemplares": [
    { "codigoPatrimonio": "PAT-2024-001" },
    { "codigoPatrimonio": "PAT-2024-002" }
  ]
}
```

## Validações feitas no front

- Título, Autor, ISBN e Categoria são obrigatórios
- Ao menos um exemplar com código de patrimônio deve ser informado
- Códigos de patrimônio duplicados são bloqueados

## Quem pode acessar?

Apenas usuários com papel `BIBLIOTECARIO` ou `ADMIN` (protegido pela rota no `AppRoutes.tsx`).
