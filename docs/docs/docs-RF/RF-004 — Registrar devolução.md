

-

# RF-004 — Registrar devolução

## Identificação

* **Código:** RF-004
* **Nome:** Registrar devolução
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Bibliotecário

## Descrição

O sistema deve permitir que o bibliotecário registre a devolução de um exemplar emprestado, atualizando sua situação e o histórico do empréstimo.

## User Story relacionada

**Como** bibliotecário, **eu quero** registrar a devolução de um exemplar **para que** o sistema mantenha o controle do acervo e do empréstimo realizado.

## Critérios de aceitação

* O bibliotecário deve conseguir localizar o empréstimo ativo.
* O sistema deve permitir confirmar a devolução do exemplar.
* O sistema deve registrar a data de devolução.
* O sistema deve atualizar o histórico do empréstimo.
* Caso não exista reserva para o exemplar, seu status deve ser atualizado para **disponível**.
* Caso exista uma reserva ativa, o sistema deve direcionar o exemplar para o próximo leitor da fila de reserva.




