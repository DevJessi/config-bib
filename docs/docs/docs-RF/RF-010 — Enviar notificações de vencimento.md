
# RF-010 — Enviar notificações de vencimento

## Identificação

* **Código:** RF-010
* **Nome:** Enviar notificações de vencimento
* **Tipo:** Requisito Funcional
* **Ator relacionado:** Sistema / Leitor

## Descrição

O sistema deve enviar notificações por e-mail aos leitores próximos do vencimento de seus empréstimos.

## User Story relacionada

**Como** leitor, **eu quero** receber um aviso antes do vencimento do empréstimo **para que** eu possa devolver ou renovar o livro dentro do prazo.

## Critérios de aceitação

* O sistema deve executar uma rotina diária para verificar empréstimos próximos do vencimento.
* O sistema deve identificar empréstimos que estejam a 48 horas do vencimento.
* O sistema deve enviar um e-mail ao leitor.
* A mensagem deve informar a data de vencimento.
* A mensagem deve disponibilizar a opção de renovação quando ela for permitida.
* A notificação não deve ser enviada novamente de forma indevida para o mesmo vencimento.


