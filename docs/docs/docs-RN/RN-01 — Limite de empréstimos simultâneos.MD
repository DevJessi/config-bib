
# RN-01 — Limite de empréstimos simultâneos

## Identificação

* **Código:** RN-01
* **Nome:** Limite de empréstimos simultâneos
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor

## Descrição

Um leitor pode possuir no máximo **5 empréstimos ativos simultaneamente**.

## Regra de negócio

* O leitor pode realizar empréstimos enquanto possuir menos de 5 empréstimos ativos.
* O quinto empréstimo é permitido.
* O sexto empréstimo deve ser bloqueado.
* Somente empréstimos ativos devem ser contabilizados.

## Condição

Se o leitor possuir 5 empréstimos ativos, o sistema não deve permitir um novo empréstimo.

## Critérios de aceitação

* Com 4 empréstimos ativos, um novo empréstimo deve ser permitido, desde que não exista outro impedimento.
* Com 5 empréstimos ativos, um novo empréstimo deve ser recusado.
* Empréstimos já devolvidos não devem ser contabilizados.

## Exemplo

```text
Leitor possui 4 empréstimos ativos
        ↓
Solicita novo empréstimo
        ↓
Sistema verifica quantidade
        ↓
4 < 5
        ↓
Empréstimo permitido
```


