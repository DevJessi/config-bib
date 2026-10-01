# ADR-012: Ambiente de Execução e Framework Back-end (Node.js &amp; Express.js)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** Necessidade de construir uma API RESTful leve, eficiente e de alta performance para expor as rotas de autenticação JWT <a href="../docs-ADR/ADR-007 - Autenticacao Login l Logout.md">(ADR-007)</a>, regras de empréstimo (<a href="../docs-ADR/ADR-001 - Prazo padrao de devolucao.md">ADR-001</a>, <a href="../docs-ADR/ADR-004 - Renovacao de emprestimo.md">ADR-004</a>) e cálculo de multas <a href="../docs-ADR/ADR-008 - Multa por atraso.md">(ADR-008)</a>.
* **Decisão** Utilizar o ambiente de execução **Node.js** combinado com o framework **Express.js** para o desenvolvimento do servidor de aplicação.
* **Alternativas consideradas**
  * *Java (Spring Boot)*: Muito verboso e com alto consumo de memória para o escopo de uma aplicação acadêmica/MVP.
  * *Python (Django/FastAPI)*: Exigiria alternar entre duas linguagens de programação diferentes na equipe (Python no back-end e JavaScript no front-end).
* **Consequências**
  * **Vantagens**: Permite arquitetura *Full-stack JavaScript*, onde toda a equipe desenvolve em uma única linguagem; seu modelo assíncrono não-bloqueante (Event Loop) é ideal para APIs voltadas a operações de I/O.
  * **Desvantagens**: Exige organização rigorosa de middlewares e pastas para evitar acoplamento no código.
* **Referências** 
<a href="../docs-RNF/RNF-01 — Desempenho.md">RNF-01</a>, 
<a href="../docs-RNF/RNF-02 — Segurança.md">RNF-02</a>, 
<a href="../docs-ADR/ADR-007 - Autenticacao Login l Logout.md">ADR-007</a>, 
TAP SGBD.