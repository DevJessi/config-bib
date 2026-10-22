# Componente Header

## O que ele faz?

O `Header` é a barra de navegação superior que aparece em todas as páginas protegidas do sistema. Ele mostra o nome da biblioteca, os links de navegação e o botão de sair (logout).

## Links que ele exibe

- **Todos os usuários:** Acervo, Minhas Reservas, Meu Perfil
- **Bibliotecário e Admin:** Cadastrar Livro, Gestão de Empréstimos, Quitação de Multas

## Dados que ele usa

- `usuario` e `logout` vindos do `AuthContext` (não faz chamadas à API diretamente)

## Como alterar os links de navegação

Basta adicionar ou remover `<NavLink>` dentro da `<nav>`. Se o link for só para admin, envolva-o em `{usuario?.papel === 'ADMIN' && ...}`.
