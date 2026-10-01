# ADR-014: Sistema de Gerenciamento de Banco de Dados (PostgreSQL)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** O sistema gerencia dados críticos de negócios e transações financeiras (como o bloqueio por multa pendente na <a href="../docs-ADR/ADR-006 - Bloqueio por multa.md">ADR-006</a> e cálculo de diárias na <a href="../docs-ADR/ADR-008 - Multa por atraso.md">ADR-008</a>). É indispensável garantir integridade referencial rigorosa, conformidade ACID e mecanismos para exclusão de dados pessoais em até 48h <a href="../docs-ADR/ADR-009 - Conformidade LGPD.md">(LGPD - ADR-009)</a>.
* **Decisão** Adotar o **PostgreSQL** como Banco de Dados Relacional principal.
* **Alternativas consideradas**
  * *MongoDB (NoSQL)*: Não garante relacionalidade rígida por padrão, dificultando controles consistentes de disponibilidade de exemplares e concorrência de reservas.
  * *SQLite*: Excelente para desenvolvimento local, mas limitado em concorrência em produção e sem facilidades para instâncias em nuvem gerenciadas no plano gratuito.
* **Consequências**
  * **Vantagens**: SGBD relacional open-source extremamente robusto; suporte total a transações ACID e *foreign keys*; compatível com serviços gratuitos gerenciados em nuvem (Supabase, Render, PostgreSQL no Railway).
  * **Desvantagens**: Requer planejamento prévio rigoroso do esquema de tabelas e tipos de dados.
* **Referências** 
<a href="../docs-ADR/ADR-002 - Cadastro de exemplares.md">ADR-002</a>, 
<a href="../docs-ADR/ADR-006 - Bloqueio por multa.md">ADR-006</a>, 
<a href="../docs-ADR/ADR-009 - Conformidade LGPD.md">ADR-009</a>, 
TAP SGBD.