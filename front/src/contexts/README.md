# ⚠️ LEIA ANTES DE MEXER: `AuthContext.tsx` (Contexto de Autenticação)

> **🚨 AVISO EXTREMAMENTE IMPORTANTE PARA A EQUIPE:**
> **NÃO APAGUE ESTE ARQUIVO E NEM ESTA PASTA (`src/contexts/`)!**
> O `AuthContext.tsx` é o **coração da autenticação e permissões** do front-end da *Biblioteca Paulo Renato de Souza*. Se este arquivo for removido ou renomeado, **nenhuma tela logada vai funcionar**, o sistema não saberá quem é o usuário e a proteção de rotas (Leitor vs Bibliotecário) vai quebrar completamente!

---

## 📌 O que faz o `AuthContext.tsx`?

O `AuthContext` utiliza a **React Context API** para disponibilizar de forma global (em qualquer tela do sistema) as informações da sessão do usuário:
1. **Dados do Usuário Logado (`usuario`):** `id`, `nome`, `email` e `papel` (`LEITOR`, `BIBLIOTECARIO` ou `ADMIN`).
2. **Token de Autenticação (`token`):** Chave JWT de acesso enviada nas requisições.
3. **Estado de Carregamento (`carregando`):** Evita "pulos" de tela enquanto o sistema verifica se o usuário já estava logado ao abrir o navegador.
4. **Métodos Centrais:** Funções `login()` para autenticar e `logout()` para encerrar a sessão.

---

## ⚙️ Como usar nas telas e componentes (`useAuth`)

Para acessar os dados de login em qualquer arquivo do React, basta importar o custom hook `useAuth`:

```tsx
import { useAuth } from '../../contexts/AuthContext';

export function MinhaPagina() {
  const { usuario, token, login, logout, carregando } = useAuth();

  return (
    <div>
      <p>Bem-vindo, {usuario?.nome}!</p>
      <p>Seu perfil é: {usuario?.papel}</p>
      <button onClick={logout}>Sair do Sistema</button>
    </div>
  );
}
```

---

## 🛠️ COMO CONECTAR COM O BACK-END (INSTRUÇÕES DE TRANSIÇÃO)

Atualmente, o arquivo contém **duas funções de `login`**:

### 1. 🟡 Login Falso / Mock (Ativo no Momento)
* **Objetivo:** Permitir que a equipe visualize todas as telas do React e navegue pelo sistema no navegador sem precisar rodar o servidor Node.js ou o banco de dados PostgreSQL.
* **Como funciona:**
  * Digitando um e-mail comum (ex: `aluno@email.com`), o sistema loga como **`LEITOR`** e libera o `/acervo`, `/meu-perfil` e `/reservas`.
  * Digitando um e-mail com a palavra *admin* ou *biblio* (ex: `admin@email.com`), o sistema loga como **`BIBLIOTECARIO`** e libera as telas de gestão (`/admin/cadastrar-livro`, `/admin/emprestimos`, `/admin/multas`).
* **Ação futura:** Deve ser substituído pela função real assim que o back-end e o banco estiverem rodando no Docker.

### 2. 🟢 Login Real / Oficial (Comentado no Código)
* **Objetivo:** Realizar a autenticação legítima via requisição HTTP `POST /auth/login` utilizando Axios.
* **Como funciona:** Recebe o Token JWT verdadeiro retornado pela API e armazena os dados reais do banco PostgreSQL no `localStorage`.

---

### 🔄 Passo a passo para ativar o Back-end Real:

Quando a API e o banco de dados PostgreSQL estiverem rodando no Docker:

1. **Abra o arquivo `src/contexts/AuthContext.tsx`.**
2. **Apague ou comente** a função de login falsa que usa `usuarioFake` e `tokenFake`.
3. **Descomente** a função de login real que faz o `api.post`:

```tsx
// ✅ FUNÇÃO REAL (Ativar quando o back-end e o banco estiverem prontos):
async function login(email: string, senha: string) {
  const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha });
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  setToken(data.token);
  setUsuario(data.usuario);
}
```

4. **⚠️ Dica de Consistência no `localStorage`:**
   Garanta que as chaves de armazenamento sejam idênticas (`'token'` e `'usuario'`) tanto no `useEffect`, quanto no `login` e no `logout`, garantindo que a sessão permaneça salva ao atualizar a página (F5).

---

## 🔒 Perfis de Acesso (`Papel`)

- **`LEITOR`**: Alunos e leitores cadastrados (Acessam `/acervo`, `/meu-perfil`, `/reservas`).
- **`BIBLIOTECARIO` / `ADMIN`**: Equipe da biblioteca (Acessam `/admin/cadastrar-livro`, `/admin/emprestimos`, `/admin/multas`).
