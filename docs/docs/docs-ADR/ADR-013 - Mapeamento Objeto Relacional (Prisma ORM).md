# ADR-013: Mapeamento Objeto-Relacional (Prisma ORM)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** A camada de persistência do sistema envolve relacionamentos complexos entre Livros, Exemplares (<a href="../docs-ADR/ADR-002 - Cadastro de exemplares.md">ADR-002</a>), Leitores, Empréstimos, Reservas (<a href="../docs-ADR/ADR-004 - Renovacao de emprestimo.md">ADR-004</a>) e Histórico (<a href="../docs-ADR/ADR-005 - Historico de emprestimos.md">ADR-005</a>). Escrever queries SQL manuais aumenta a vulnerabilidade a erros de sintaxe, SQL Injection e dificulta refatorações de esquema.
* **Decisão** Adotar o **Prisma ORM** como ferramenta de mapeamento objeto-relacional no Node.js.
* **Alternativas consideradas**
  * *Driver SQL puro (* *pg* */node-postgres)*: Exige consultas SQL manuais montadas em strings, sem autocompletado forte de tipos.
  * *Sequelize / TypeORM*: ORMs legados ou mais verbosos com controle de migrações mais complexo.
* **Consequências**
  * **Vantagens**: Oferece *Type-Safety* automático (auto-completado das tabelas no editor); criação de migrações de banco declarativas e automatizadas (`prisma migrate`); sintaxe limpa e declarativa para operações com tabelas relacionadas.
  * **Desvantagens**: Adiciona uma leve abstração sobre o SQL nativo e exige a instalação do CLI do Prisma no projeto.
* **Referências** 
<a href="../docs-ADR/ADR-002 - Cadastro de exemplares.md">ADR-002</a>, 
<a href="../docs-ADR/ADR-005 - Historico de emprestimos.md">ADR-005</a>, 
<a href="../docs-ADR/ADR-008 - Multa por atraso.md">ADR-008</a>, 
<a href="../docs-ADR/ADR-009 - Conformidade LGPD.md">ADR-009</a>.