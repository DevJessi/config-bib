
# RF-007 — Registrar pagamentos

## Identificação

* **Código:** RF-007
* **Nome:** Registrar pagamentos
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Bibliotecário

## Descrição

O sistema deve permitir o registro de pagamentos de taxas e pendências financeiras dos leitores.

## User Story relacionada

**Como** bibliotecário, **eu quero** registrar o pagamento de uma pendência **para que** o sistema mantenha atualizado o estado financeiro do leitor e permita a remoção dos bloqueios correspondentes.

## Critérios de aceitação

* O sistema deve permitir localizar a pendência do leitor.
* O sistema deve registrar o valor pago.
* O sistema deve registrar a forma de pagamento.
* As formas de pagamento devem incluir:

  * dinheiro;
  * cartão;
  * Pix.
* Após o pagamento integral de uma pendência que causava bloqueio, o sistema deve removê-la das pendências impeditivas.
* O histórico do pagamento deve ser armazenado.




