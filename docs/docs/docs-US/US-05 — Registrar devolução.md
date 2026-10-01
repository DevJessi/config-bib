
# US-05 — Registrar devolução

## Identificação

* **Código:** US-05
* **Nome:** Registrar devolução
* **Tipo:** User Story
* **Ator relacionado:** Bibliotecário
* **Prioridade:** Must
* **Pontos:** 5

## User Story

**Como** bibliotecário, **eu quero** registrar a devolução de um exemplar **para que** o acervo seja atualizado e o sistema possa verificar possíveis atrasos.

## Critérios de aceitação

* **Given** que existe um empréstimo ativo

* **When** o bibliotecário registra a devolução

* **Then** o sistema registra a data de devolução.

* **Given** que a devolução ocorreu dentro do prazo de 15 dias

* **When** o sistema finaliza a devolução

* **Then** nenhuma multa por atraso deve ser gerada.

* **Given** que a devolução ocorreu após o prazo de 15 dias

* **When** o sistema finaliza a devolução

* **Then** o sistema calcula a multa correspondente aos dias de atraso.

* **Given** que existe uma reserva ativa para o exemplar

* **When** o exemplar é devolvido

* **Then** o sistema deve direcioná-lo para o próximo leitor da fila de reserva.

## Definition of Done

* Testes unitários aprovados.
* Testes de integração aprovados.
* Histórico atualizado corretamente.
* Cálculo de atraso validado.


