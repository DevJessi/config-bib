
# US-02 — Registrar empréstimo

## Identificação

* **Código:** US-02
* **Nome:** Registrar empréstimo
* **Tipo:** User Story
* **Ator relacionado:** Bibliotecário
* **Prioridade:** Must
* **Pontos:** 5

## User Story

**Como** bibliotecário, **eu quero** registrar o empréstimo de um exemplar **para que** o sistema controle quem está utilizando o livro e seu prazo de devolução.

## Critérios de aceitação

* **Given** que o exemplar está disponível e o leitor não possui pendências impeditivas

* **When** o bibliotecário confirma o empréstimo

* **Then** o sistema registra o empréstimo.

* **Given** que o empréstimo foi registrado

* **When** o sistema finaliza a operação

* **Then** o exemplar passa a ser considerado emprestado e o prazo de devolução é definido para 15 dias.

* **Given** que o leitor possui algum impedimento previsto nas regras de negócio

* **When** o bibliotecário tenta registrar o empréstimo

* **Then** o sistema bloqueia a operação e informa o motivo.

## Definition of Done

* Testes unitários implementados e aprovados.
* Testes de integração implementados e aprovados.
* Regras de negócio de empréstimo validadas.


