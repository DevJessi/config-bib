
# RN-08 — Bloqueio por cobrança de avaria

## Identificação

* **Código:** RN-08
* **Nome:** Bloqueio por cobrança de avaria
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor

## Descrição

A cobrança gerada por uma avaria deve impedir novos empréstimos enquanto não for quitada.

## Regra de negócio

A cobrança de R$15,00 decorrente de uma avaria possui uma regra específica de bloqueio e não depende do limite financeiro estabelecido na RN-03.

## Condição

O bloqueio deve ocorrer quando existir uma cobrança de avaria não quitada.

## Critérios de aceitação

* Avaria registrada e não paga: novos empréstimos bloqueados.
* Avaria paga integralmente: bloqueio causado pela avaria removido.
* A RN-03 não deve ser utilizada para determinar o bloqueio específico causado pela avaria.


