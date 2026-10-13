# Página Login

## O que ela faz?

É a porta de entrada do sistema. O usuário informa seu e-mail e senha para se autenticar. Após o login com sucesso, é redirecionado para `/acervo`.

## Endpoint chamado

`POST /api/v1/auth/login` com body `{ email, senha }`

Resposta esperada: `{ token: string, usuario: { id, nome, email, papel } }`

## Papéis de usuário

O campo `papel` pode ser: `LEITOR`, `BIBLIOTECARIO`, `ADMIN`. Isso define o que o usuário verá no sistema.

## Estados tratados

- Campo vazio → exibe mensagem de validação
- Erro 401 → "E-mail ou senha incorretos"
- Erro de conexão → mensagem genérica de servidor

## Como alterar

Para mudar o texto do botão, edite a linha `{carregando ? 'Entrando...' : 'Entrar'}`.  
Para redirecionar para outra página após login, altere o `navigate('/acervo')`.
