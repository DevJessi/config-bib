
# RF-009 — Renovar empréstimo

## Identificação

* **Código:** RF-009
* **Nome:** Renovar empréstimo
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Leitor

## Descrição

O sistema deve permitir a renovação de empréstimos ativos quando o leitor e o exemplar atenderem às regras de negócio para renovação.

## User Story relacionada

**Como** leitor, **eu quero** renovar meu empréstimo **para que** eu possa permanecer com o livro por mais tempo quando não houver impedimentos.

## Critérios de aceitação

* O leitor deve possuir um empréstimo ativo.
* O sistema deve verificar as regras de renovação antes de permitir a operação.
* O sistema não deve permitir renovação caso exista uma reserva ativa para o exemplar.
* Caso não exista impedimento, o sistema deve registrar a renovação.
* O novo prazo deve respeitar o prazo padrão definido nas regras de negócio.


