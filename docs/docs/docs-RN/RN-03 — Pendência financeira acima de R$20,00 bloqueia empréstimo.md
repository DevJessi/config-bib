
# RN-03 — Pendência financeira acima de R$20,00 bloqueia empréstimo

## Identificação

* **Código:** RN-03
* **Nome:** Limite de pendência financeira
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor

## Descrição

Um leitor com pendência financeira superior a **R$20,00** não pode realizar novos empréstimos.

## Regra de negócio

* Pendência superior a R$20,00: empréstimo bloqueado.
* Pendência igual ou inferior a R$20,00: esta regra, isoladamente, não impede o empréstimo.

## Condição

O sistema deve verificar o valor das pendências financeiras do leitor antes de registrar um novo empréstimo.

## Critérios de aceitação

* R$20,01 ou mais: empréstimo bloqueado.
* R$20,00 ou menos: não bloqueia por esta regra.
* O sistema deve informar o motivo do bloqueio quando aplicável.

## Exemplo

```text
Leitor solicita empréstimo
        ↓
Sistema verifica pendência financeira
        ↓
Valor > R$20,00?
     ↙           ↘
   SIM           NÃO
    ↓             ↓
Bloqueia       Continua
empréstimo     validação
```


