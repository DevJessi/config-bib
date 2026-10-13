# Biblioteca Paulo Renato de Souza — Front-end

Sistema de Gerenciamento de Biblioteca (SGBD) — Interface Web SPA.

**Desenvolvido por:** Robert Douglas  
**Turma/Curso:** Turma 1 — Desenvolvimento Web e Mobile  
**Turno:** Noturno

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Framework de UI |
| TypeScript | 5.7 | Tipagem estática |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS v4 | 4 | Utilitários de CSS |
| react-router-dom | 7 | Roteamento SPA |
| axios | 1 | Requisições HTTP |
| lucide-react | latest | Ícones acessíveis |
| @radix-ui/react-dialog | latest | Modal acessível (LGPD) |

---

## Estrutura de Arquivos

```
src/
├── assets/
│   └── (imagens e recursos estáticos)
├── contexts/
│   └── AuthContext.tsx          ← Estado global de autenticação (JWT)
├── services/
│   └── api.ts                   ← Instância Axios com interceptores
├── components/
│   ├── Header/                  ← Barra de navegação superior
│   ├── ProtectedRoute/          ← Guarda de rota por papel (role)
│   └── ModalLgpd/               ← Modal de exclusão de dados (LGPD)
├── pages/
│   ├── Login/                   ← Tela de autenticação
│   ├── Acervo/                  ← Catálogo e reserva de livros
│   ├── MeuPerfil/               ← Perfil, histórico, renovação e LGPD
│   ├── MinhasReservas/          ← Reservas ativas do leitor
│   ├── CadastrarLivro/          ← Cadastro de títulos (staff only)
│   ├── GestaoEmprestimos/       ← Controle de empréstimos (staff only)
│   └── QuitacaoMultas/          ← Quitação de pendências (staff only)
├── routes/
│   └── AppRoutes.tsx            ← Definição de rotas e proteções
├── App.tsx                      ← Raiz com BrowserRouter + AuthProvider
├── main.tsx                     ← Entrypoint React
└── index.css                    ← CSS global + fontes + Tailwind
```

---

## Fluxo de Autenticação (ADR-007)

1. Usuário acessa `/login` e submete `{ email, senha }` para `POST /api/v1/auth/login`.
2. A API retorna `{ token, usuario: { id, nome, email, papel } }`.
3. O token JWT é salvo no `localStorage` e injetado automaticamente via interceptor do Axios.
4. O papel (`LEITOR`, `BIBLIOTECARIO` ou `ADMIN`) controla quais rotas e menus são exibidos.
5. Se o token expirar (status 401), o usuário é redirecionado para `/login` automaticamente.

---

## Papéis e Permissões

| Papel | Acesso |
|---|---|
| `LEITOR` | Acervo, Minhas Reservas, Meu Perfil |
| `BIBLIOTECARIO` | Tudo acima + Cadastrar Livro, Gestão de Empréstimos, Quitação de Multas |
| `ADMIN` | Mesmo que BIBLIOTECARIO |

---

## Regras de Negócio Implementadas

| ADR | Regra | Onde está no código |
|---|---|---|
| ADR-001 | Prazo padrão de 15 dias | Mensagem de feedback em `GestaoEmprestimos` |
| ADR-002 | Cadastro de exemplares com Código de Patrimônio | Formulário em `CadastrarLivro` |
| ADR-004 | Renovação bloqueada se há reserva ativa | Lógica em `MeuPerfil` ao tratar erro da API |
| ADR-005 | Histórico de empréstimos legível | Listagem em `MeuPerfil` |
| ADR-006 | Bloqueio por multa > R$ 20 | Banner vermelho em `MeuPerfil` |
| ADR-007 | Autenticação JWT | `AuthContext` + `api.ts` |
| ADR-008 | Multa automática por atraso | Exibida em `GestaoEmprestimos` e `QuitacaoMultas` |
| ADR-009 | Exclusão de dados LGPD em 48h | `ModalLgpd` em `MeuPerfil` |

---

## Acessibilidade (WCAG 2.1 AA)

- Tags semânticas HTML5 (`main`, `nav`, `header`, `section`, `article`)
- Todos os controles interativos têm `aria-label` ou `aria-labelledby`
- Foco visível em todos os elementos interativos (outline azul 3px)
- `role="alert"` e `aria-live` em mensagens de erro e status
- Modais gerenciados pelo Radix UI (foco, `aria-modal`, `role="dialog"`)
- Navegação completa por teclado

---

## Como Rodar

O servidor de desenvolvimento já está rodando automaticamente. Qualquer alteração nos arquivos `src/` é refletida imediatamente via hot reload.

**URL da API:** Configure `VITE_API_URL` no arquivo `.env` (padrão: `http://localhost:3000/api/v1`).

---

## Paleta de Cores do Projeto

| Token | Hex | Uso |
|---|---|---|
| Primary | `#6178FC` | Botões, links, ícones ativos |
| Primary Dark | `#274DEA` | Header, hover de primários |
| Primary Light | `#CCD3FF` | Backgrounds de destaque, bordas |
| Surface | `#F8F7FF` | Background da página |
| Danger | `#DC2626` | Erros, multas, bloqueio |
| Success | `#16A34A` | Sucesso, disponibilidade |
