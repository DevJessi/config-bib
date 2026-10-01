
# RN-05 — Prazo padrão para devolução

## Identificação

* **Código:** RN-05
* **Nome:** Prazo padrão para devolução
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor / Bibliotecário / Sistema

## Descrição

O prazo padrão para devolução de um empréstimo é de **15 dias** a partir da data de realização do empréstimo.

## Regra de negócio

Todo novo empréstimo deve possuir uma data de vencimento correspondente a 15 dias após a data do empréstimo.

## Condição

A data de devolução deve ser calculada automaticamente pelo sistema.

## Critérios de aceitação

* O sistema deve registrar a data do empréstimo.
* O sistema deve calcular a data de vencimento.
* O vencimento deve ocorrer 15 dias após a realização do empréstimo.
* O mesmo prazo deve ser utilizado nas funcionalidades relacionadas a empréstimo, devolução, multa e notificações.

## Exemplo

```text
Data do empréstimo: 01/09
        ↓
+ 15 dias
        ↓
Data de vencimento: 16/09
```


