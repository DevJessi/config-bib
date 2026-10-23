# Componente ModalLgpd

## O que ele faz?

Exibe um modal de confirmação para que o leitor solicite a exclusão dos seus dados pessoais, conforme exigido pela LGPD (Lei Geral de Proteção de Dados).

## Como ele funciona?

1. Abre quando o usuário clica em "Solicitar Exclusão de Dados" na página `MeuPerfil`.
2. Mostra um aviso sobre a irreversibilidade da ação.
3. Exige que o usuário digite a frase exata `DESEJO_EXCLUIR_MEUS_DADOS`.
4. Só habilita o botão de confirmação quando a frase é digitada corretamente.

## Endpoint chamado

`DELETE /api/v1/leitores/me/lgpd` com body `{ confirmacao: "DESEJO_EXCLUIR_MEUS_DADOS" }`

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `aberto` | `boolean` | Controla se o modal está visível |
| `aoFechar` | `() => void` | Chamada quando o usuário cancela |
| `aoConfirmar` | `() => void` | Chamada após sucesso na API |

## Acessibilidade

Usa `@radix-ui/react-dialog` para gerenciar foco, `aria-label`, `aria-invalid` e `role="alert"` nos erros.
