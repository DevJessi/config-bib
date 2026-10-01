# ADR-005: Histórico de empréstimos
- **Status**: Concluído   
- **Data**: 2026-09-15  
- **Contexto**  
<a href="../docs-RF/RF-001 — Cadastro de usuário.md">RF-001</a> menciona histórico, mas não há RF próprio.  
- **Decisão**  
Criar RF para **registro e consulta de histórico de empréstimos** por leitor.  
- **Alternativas consideradas**  
  - Não registrar histórico.  
  - Registrar apenas em logs internos.  
- **Consequências**  
  - Transparência para leitores e bibliotecários.  
  - Facilita auditoria e relatórios.  
- **Referências**  
<a href="../docs-RF/RF-001 — Cadastro de usuário.md">RF-001</a>, 
<a href="../docs-US/US-02 — Registrar empréstimo.md">US-02</a>, 
<a href="../docs-US/US-05 — Registrar devolução.md">US-05</a>.