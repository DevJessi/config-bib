# ADR-007: Autenticação (Login/Logout)
- **Status**: Em análise   
- **Data**: 2026-09-15  
- **Contexto**  
O levantamento não detalha login/logout, mas são essenciais para segurança e rastreabilidade.  
- **Decisão**  
Implementar **login e logout com autenticação JWT** e cenários BDD.  
- **Alternativas consideradas**  
  - Sessões em memória.  
  - Autenticação básica sem tokens.  
- **Consequências**  
  - Maior segurança e escalabilidade.  
  - Exige gestão de tokens e expiração.  
- **Referências**  
<a href="../docs-RNF/RNF-02 — Segurança.md">RNF-02</a>, 
<a href="../docs-RF/RF-001 — Cadastro de usuário.md">RF-001</a>.