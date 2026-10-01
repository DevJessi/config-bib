
# US-04 — Reservar livro indisponível

## Identificação

* **Código:** US-04
* **Nome:** Reservar livro indisponível
* **Tipo:** User Story
* **Ator relacionado:** Leitor
* **Prioridade:** Must
* **Pontos:** 5

## User Story

**Como** leitor, **eu quero** reservar um livro que está indisponível **para que** eu possa recebê-lo quando um exemplar estiver disponível.

## Critérios de aceitação

* **Given** que não existe exemplar disponível

* **When** o leitor solicita uma reserva

* **Then** o sistema registra a reserva.

* **Given** que existem outros leitores aguardando o mesmo livro

* **When** uma nova reserva é realizada

* **Then** o leitor é colocado no final da fila de espera.

* **Given** que a reserva foi registrada

* **When** a operação for concluída

* **Then** o sistema apresenta uma confirmação ao leitor.

## Definition of Done

* Reserva armazenada no banco de dados.
* Ordem da fila de espera mantida.
* Testes da funcionalidade aprovados.


