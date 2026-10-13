# Página de Cadastro de Leitor

## Objetivo

A rota pública `/cadastro` permite criar uma conta de leitor antes da autenticação.

## Fluxo

1. O formulário valida o preenchimento dos quatro campos.
2. A senha precisa ter pelo menos 8 caracteres e ser igual à confirmação.
3. Os dados `nome`, `email` e `senha` são enviados para `POST /api/v1/leitores` por meio da instância compartilhada de `api`.
4. Após sucesso, a página anuncia a confirmação e redireciona para `/login`.
5. Respostas HTTP `409` são apresentadas como conflito de e-mail já cadastrado.

## Acessibilidade

Os campos possuem rótulos associados, autocomplete apropriado e mensagens com semântica de `alert` ou `status`. Estados de envio desabilitam os controles e são comunicados com `aria-busy`.

## Manutenção

- Componente: `Cadastro.tsx`
- Estilos responsivos: `Cadastro.css`
- Rota: `src/routes/AppRoutes.tsx`
- Autor do projeto: Robert Douglas — Turma 1, Desenvolvimento Web e Mobile, turno noturno.
