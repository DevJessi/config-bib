
# US-06 — Calcular multa por atraso

## Identificação

* **Código:** US-06
* **Nome:** Calcular multa por atraso
* **Tipo:** User Story
* **Ator relacionado:** Sistema
* **Prioridade:** Must
* **Pontos:** 5

## User Story

**Como** sistema, **eu quero** calcular automaticamente a multa de um empréstimo devolvido após o prazo **para que** o valor devido pelo atraso seja registrado corretamente.

## Critérios de aceitação

* **Given** que o prazo do empréstimo é de 15 dias

* **When** o exemplar é devolvido após a data de vencimento

* **Then** o sistema calcula a quantidade de dias em atraso.

* **Given** que existem dias de atraso

* **When** o sistema realiza o cálculo

* **Then** a multa é calculada utilizando o número de dias de atraso e o valor diário definido para a multa.

* **Given** que a multa foi calculada

* **When** o processo de devolução for finalizado

* **Then** o valor deve ser registrado como pendência financeira do leitor.

## Definition of Done

* Cálculo de dias de atraso implementado.
* Valor da multa diária definido pelo projeto antes da implementação.
* Testes unitários aprovados.
* Integração com o registro de pendências validada.


