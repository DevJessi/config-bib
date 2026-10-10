# Componente ProtectedRoute

## O que ele faz?

É um "guarda de rota". Envolve as páginas que só usuários logados podem ver. Se o usuário não estiver autenticado, redireciona para `/login`. Se não tiver o papel (role) necessário, redireciona para `/acervo`.

## Como usar

```tsx
<ProtectedRoute papeis={['ADMIN', 'BIBLIOTECARIO']}>
  <MinhaPageRestrita />
</ProtectedRoute>
```

- Se `papeis` for omitido, qualquer usuário logado pode entrar.
- Enquanto verifica o login (carregando), exibe um spinner animado.

## Não faz chamadas à API — usa apenas o AuthContext.
