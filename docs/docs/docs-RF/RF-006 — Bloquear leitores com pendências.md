

-

# RF-006 — Bloquear leitores com pendências

## Identificação

* **Código:** RF-006
* **Nome:** Bloquear leitores com pendências
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Bibliotecário

## Descrição

O sistema deve bloquear novos empréstimos para leitores que possuam pendências que, de acordo com as regras de negócio, impeçam a realização de um novo empréstimo.

## User Story relacionada

**Como** bibliotecário, **eu quero** que leitores com pendências impeditivas sejam bloqueados **para que** novos empréstimos não sejam realizados em desacordo com as regras da biblioteca.

## Critérios de aceitação

* O sistema deve verificar as pendências do leitor antes de registrar um empréstimo.
* O sistema deve identificar se existe alguma pendência que cause bloqueio.
* Caso exista uma pendência impeditiva, o novo empréstimo deve ser recusado.
* O sistema deve informar o motivo do bloqueio ao usuário.
* O bloqueio deve respeitar as regras de negócio estabelecidas.


