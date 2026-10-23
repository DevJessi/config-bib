# ADR-001: Prazo padrão de devolução
- **Status**: Em análise  
- **Data**: 2026-09-15  
- **Contexto**  
Há inconsistência entre 14 dias (<a href="../docs-US/US-02 — Registrar empréstimo.md">US-02</a>) e 15 dias (<a href="../docs-US/US-05 — Registrar devolução.md">US-05</a>/<a href="../docs-US/US-06 — Calcular multa por atraso.md">US-06</a>). Isso gera risco de cálculo incorreto de multas e notificações.  
- **Decisão**  
Definir **prazo único de 15 dias** para todos os empréstimos.  
- **Alternativas consideradas**  
  - Usar 15 dias como prazo fixo.  
  - Permitir prazos diferentes por categoria de livro.  
- **Consequências**  
  - Simplificação do cálculo de multas e notificações.  
  - Evita inconsistências.  
  - Reduz flexibilidade.  
- **Referências**  
<a href="../docs-RF/RF-004 — Registrar devolução.md">RF-004</a>, 
<a href="../docs-RF/RF-005 — Registrar avarias e danos.md">RF-005</a>, 
<a href="../docs-RN/RN-03 — Pendência financeira acima de R$20,00 bloqueia empréstimo.md">RN-03</a>, 
<a href="../docs-US/US-02 — Registrar empréstimo.md">US-02</a>, 
<a href="../docs-US/US-05 — Registrar devolução.md">US-05</a>, 
<a href="../docs-US/US-06 — Calcular multa por atraso.md">US-06</a>.