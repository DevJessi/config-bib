
# RN-04 — Cobrança por avaria

## Identificação

* **Código:** RN-04
* **Nome:** Cobrança por avaria
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Bibliotecário / Leitor

## Descrição

Quando um exemplar devolvido apresentar avaria, deve ser registrada uma cobrança de **R$15,00** para o leitor responsável.

## Regra de negócio

* Toda avaria registrada deve gerar uma cobrança de R$15,00.
* A cobrança deve ser registrada como pendência financeira.
* A pendência causada pela avaria possui regra própria de bloqueio, independentemente do limite de R$20,00 definido na RN-03.

## Condição

A cobrança é gerada quando o bibliotecário registra uma avaria no exemplar devolvido.

## Critérios de aceitação

* Ao registrar uma avaria, o sistema deve criar uma pendência de R$15,00.
* A pendência deve ficar vinculada ao leitor.
* A pendência deve ficar vinculada ao exemplar e à ocorrência registrada.
* O leitor deve permanecer bloqueado para novos empréstimos enquanto essa pendência não for quitada.

## Exemplo

```text
Exemplar devolvido
        ↓
Bibliotecário identifica avaria
        ↓
Registra ocorrência
        ↓
Sistema gera cobrança de R$15,00
        ↓
Pendência fica registrada
        ↓
Novos empréstimos são bloqueados
```


