
# RF-008 — Reservar livro indisponível

## Identificação

* **Código:** RF-008
* **Nome:** Reservar livro indisponível
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Leitor

## Descrição

O sistema deve permitir que o leitor realize uma reserva quando não houver exemplar disponível para empréstimo.

## User Story relacionada

**Como** leitor, **eu quero** reservar um livro indisponível **para que** eu possa recebê-lo quando um exemplar estiver disponível.

## Critérios de aceitação

* O sistema deve verificar se não existe exemplar disponível para empréstimo.
* O leitor deve conseguir solicitar uma reserva.
* O sistema deve registrar a reserva vinculada ao leitor e ao livro.
* O leitor deve ser incluído na fila de espera.
* O sistema deve confirmar o registro da reserva.
* A ordem de atendimento deve respeitar a ordem das reservas realizadas.


