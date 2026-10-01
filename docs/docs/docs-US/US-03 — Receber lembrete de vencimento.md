
# US-03 — Receber lembrete de vencimento

## Identificação

* **Código:** US-03
* **Nome:** Receber lembrete de vencimento
* **Tipo:** User Story
* **Ator relacionado:** Leitor
* **Prioridade:** Should
* **Pontos:** 8

## User Story

**Como** leitor, **eu quero** receber um aviso antes do vencimento do empréstimo **para que** eu possa devolver ou renovar o livro dentro do prazo.

## Critérios de aceitação

* **Given** que o leitor possui um empréstimo com vencimento próximo

* **When** faltarem 48 horas para o vencimento

* **Then** o sistema envia uma notificação por e-mail.

* **Given** que a renovação é permitida

* **When** o leitor recebe o aviso

* **Then** o e-mail deve apresentar uma opção para realizar a renovação.

* O e-mail deve apresentar a data de vencimento do empréstimo.

## Definition of Done

* Rotina automática implementada.
* Testes da rotina executados.
* Teste de envio de e-mail realizado.
* Fluxo de notificação validado.


