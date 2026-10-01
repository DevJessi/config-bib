
# RN-07 — Remoção de bloqueio após pagamento

## Identificação

* **Código:** RN-07
* **Nome:** Remoção de bloqueio após pagamento
* **Tipo:** Regra de Negócio
* **Ator relacionado:** Leitor / Bibliotecário

## Descrição

O bloqueio causado por uma pendência deve ser removido somente após a quitação integral da pendência que originou o bloqueio.

## Regra de negócio

* O sistema deve identificar quais pendências estão causando o bloqueio.
* Uma pendência parcialmente paga continua pendente.
* Após o pagamento integral de todas as pendências que causam bloqueio, o leitor deve ser desbloqueado.
* Pendências que não causam bloqueio não devem impedir um novo empréstimo por si só.

## Condição

O sistema deve verificar o estado das pendências após cada pagamento.

## Critérios de aceitação

* Pagamento parcial não remove o bloqueio.
* Pagamento integral de uma pendência impeditiva remove o bloqueio causado por ela.
* Caso existam outras pendências impeditivas, o leitor deve permanecer bloqueado.
* O leitor só deve ficar totalmente desbloqueado quando não houver mais pendências que causem bloqueio.

## Exemplo

```text
Leitor possui 2 pendências impeditivas
        ↓
Paga uma delas
        ↓
Ainda existe outra pendência
        ↓
Leitor permanece bloqueado
        ↓
Paga a segunda pendência
        ↓
Nenhuma pendência impeditiva
        ↓
Leitor é desbloqueado
```


