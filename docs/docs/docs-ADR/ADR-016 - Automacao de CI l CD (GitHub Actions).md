# ADR-016: Automação de CI/CD (GitHub Actions)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** Como a equipe é composta por 8 desenvolvedores trabalhando em paralelo, é necessário garantir que nenhum código quebrado, sem testes ou com erros de sintaxe seja integrado à branch principal do projeto (*Definition of Done*).
* **Decisão** Implementar pipelines de Integração Contínua (CI) utilizando **GitHub Actions**.
* **Alternativas consideradas**
  * *Jenkins*: Exige servidor dedicado ligado 24/7 para rodar os testes.
  * *Validação manual*: Alta probabilidade de erros humanos e merges de código com falhas.
* **Consequências**
  * **Vantagens**: Execução automática de linters (ESLint) e suíte de testes (Jest/Vitest) a cada *Pull Request*; bloqueio de merge caso os testes falhem; totalmente integrado ao repositório GitHub sem custo.
  * **Desvantagens**: Exige escrita prévia de arquivos de configuração no formato YAML (`.github/workflows`).
* **Referências** 
<a href="../docs-RNF/RNF-02 — Segurança.md">RNF-02</a>, 
TAP SGBD.