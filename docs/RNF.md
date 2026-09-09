# Requisitos Nao Funcionais (RNF)

Este documento define atributos de qualidade, restrições técnicas e critérios operacionais do backend. Esses requisitos complementam os fluxos descritos em `RF.md` e as regras de `RN.md` .

## RNF-001 - Segurança de credenciais

**Nome:** Armazenamento seguro de senhas.

**Descrição detalhada:** O sistema deve armazenar senhas somente como hashes produzidos com `bcrypt` , usando fator de custo configurável e adequado ao ambiente de execução. Senhas, hashes e credenciais de integração não podem aparecer em respostas da API, logs ou registros de auditoria.

**User story:**

> Como usuário, quero que minha senha seja protegida para reduzir o risco de acesso indevido à minha conta.

**BDD:**

```gherkin
Funcionalidade: Proteger credenciais

  Cenário: Persistir uma nova senha
    Dado que o usuário informou uma senha válida
    Quando o sistema criar ou atualizar o cadastro
    Então deve persistir somente o hash produzido pelo bcrypt
    E não deve persistir a senha em texto puro

  Cenário: Responder a uma consulta de usuário
    Dado que existe um usuário cadastrado
    Quando a API retornar seus dados
    Então a resposta não deve conter a senha nem seu hash
```

## RNF-002 - Autenticacao e autorizacao

**Nome:** Controle de acesso por perfil.

**Descrição detalhada:** Endpoints protegidos devem exigir autenticação. Cada operação deve verificar autorização no servidor, independentemente de controles da interface. Leitores só podem acessar seus próprios dados e operações permitidas; técnicos só podem executar ações administrativas com sessão válida.

**User story:**

> Como responsável pelo sistema, quero controlar o acesso por perfil para preservar dados e evitar operações não autorizadas.

**BDD:**

```gherkin
Funcionalidade: Controlar acesso

  Cenário: Requisição sem autenticação
    Dado que um endpoint exige autenticação
    Quando uma requisição sem sessão válida for recebida
    Então a API deve responder com acesso não autorizado
    E não deve executar a operação

  Cenário: Usuário autenticado sem permissão
    Dado que um leitor está autenticado
    Quando solicitar uma operação exclusiva de técnico
    Então a API deve responder com acesso proibido
    E não deve alterar os dados
```
