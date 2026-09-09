# ADR-001: Adotar Node.js 24 e Fastify
* **Status:** Aceita
* **Data:** 2026-09-07

## Contexto

O backend precisa de uma plataforma HTTP consistente, com bom desempenho para consultas do catálogo e estrutura adequada para evoluir endpoints e integrações.

## Decisão

Adotar Node.js 24 como runtime e Fastify como framework HTTP. A configuração deve ficar separada do código, e padrões GoF só devem ser usados quando melhorarem clareza, isolamento ou manutenção.

## Alternativas consideradas

* Usar outro runtime JavaScript ou framework HTTP.
* Implementar abstrações próprias sem um framework definido.

## Consequências

* A equipe precisa manter compatibilidade com Node.js 24 e as APIs do Fastify.
* O backend terá uma base única para rotas, validação, plugins e tratamento de erros.
* A escolha reduz a liberdade de trocar de runtime sem migração.

## Referências

* [RNF.md](../../RNF.md): RNF-010, RNF-016 e RNF-017.
* [RF.md](../../RF.md): requisitos expostos pela API.
