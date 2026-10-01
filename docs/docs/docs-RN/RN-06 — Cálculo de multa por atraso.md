
# RN-06 — Cálculo de multa por atraso

## Identificação

* **Código:** RN-06
* **Nome:** Cálculo de multa por atraso
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Sistema / Leitor

## Descrição

Quando um exemplar for devolvido após o prazo de 15 dias, o sistema deve calcular a multa correspondente ao período de atraso.

## Regra de negócio

A multa deve ser calculada com base na quantidade de dias de atraso e no valor da multa definido para cada dia.

**Fórmula:**

```text
Multa = quantidade de dias em atraso × valor da multa por dia
```

## Condição

A multa deve ser gerada somente quando a devolução ocorrer após a data de vencimento.

## Critérios de aceitação

* O sistema deve comparar a data de devolução com a data de vencimento.
* Se a devolução ocorrer dentro do prazo, nenhuma multa por atraso deve ser gerada.
* Se a devolução ocorrer após o prazo, o sistema deve calcular a quantidade de dias em atraso.
* O sistema deve calcular o valor total da multa.
* A multa deve ser registrada como pendência financeira do leitor.

## Observação

O **valor da multa por dia ainda precisa ser definido pelo responsável pelo projeto** antes da implementação do back-end. O requisito não deve inventar esse valor.

## Exemplo

```text
Vencimento: 16/09
Devolução: 19/09
        ↓
3 dias de atraso
        ↓
Multa = 3 × valor diário definido
        ↓
Pendência financeira registrada
```


