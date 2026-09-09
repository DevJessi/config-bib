# Requisitos Funcionais (RF)

Este documento descreve o que o sistema deve fazer. Cada requisito possui um identificador único, uma descrição detalhada, uma user story e critérios de aceitação em BDD.

## RF-001 - Cadastrar leitor

**Nome:** Cadastro de usuário leitor.

**Descrição detalhada:** O sistema deve permitir o cadastro de leitores com nome, e-mail, senha e curso opcional. Deve validar os campos obrigatórios, verificar a unicidade do e-mail e criar o usuário com o perfil de leitor.

**User story:**

> Como novo leitor, quero criar minha conta com meus dados básicos para utilizar os serviços da biblioteca.

**BDD:**

```gherkin
Funcionalidade: Cadastrar leitor

  Cenário: Criar cadastro válido
    Dado que a pessoa informou nome, e-mail e senha válidos
    Quando enviar o formulário de cadastro
    Então o sistema deve criar o usuário com perfil leitor
    E deve confirmar o cadastro sem expor a senha

  Cenário: E-mail já utilizado
    Dado que existe um usuário com o e-mail informado
    Quando uma pessoa tentar se cadastrar com esse e-mail
    Então o sistema deve recusar o cadastro
    E deve informar que o e-mail já está em uso
```

## RF-002 - Autenticar usuário

**Nome:** Login de leitores e técnicos.

**Descrição detalhada:** O sistema deve permitir que usuários cadastrados se autentiquem por e-mail e senha. Após validar as credenciais, deve iniciar uma sessão segura e carregar as permissões do perfil correspondente.

**User story:**

> Como usuário, quero acessar minha conta com segurança para utilizar somente as funcionalidades permitidas ao meu perfil.

**BDD:**

```gherkin
Funcionalidade: Autenticar usuário

  Cenário: Credenciais válidas
    Dado que o usuário possui cadastro ativo
    E informou e-mail e senha corretos
    Quando solicitar autenticação
    Então o sistema deve iniciar uma sessão
    E deve disponibilizar as permissões do perfil do usuário

  Cenário: Credenciais inválidas
    Dado que a senha informada não corresponde ao cadastro
    Quando solicitar autenticação
    Então o sistema deve recusar o acesso
    E não deve revelar qual credencial está incorreta
```
