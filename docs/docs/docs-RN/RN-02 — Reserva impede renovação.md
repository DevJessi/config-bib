
# RN-02 — Reserva impede renovação

## Identificação

* **Código:** RN-02
* **Nome:** Reserva impede renovação
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor

## Descrição

Um empréstimo não pode ser renovado quando existir uma reserva ativa para o exemplar.

## Regra de negócio

* Se houver reserva ativa para o exemplar, a renovação deve ser bloqueada.
* Se não houver reserva ativa, a renovação pode ser realizada, desde que as demais regras sejam atendidas.

## Condição

A existência de uma reserva ativa impede a renovação.

## Critérios de aceitação

* Exemplar sem reserva ativa: renovação permitida, se não houver outro impedimento.
* Exemplar com reserva ativa: renovação bloqueada.

## Exemplo

```text
Leitor solicita renovação
        ↓
Sistema verifica reservas
        ↓
Existe reserva ativa?
     ↙           ↘
   SIM           NÃO
    ↓             ↓
Bloqueia       Verifica
renovação      demais regras
```


