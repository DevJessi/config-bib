# ADR-011: Framework de Interface Front-end (React.js)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** O sistema de biblioteca digital exige uma interface web reativa, dinâmica e responsiva para que leitores e bibliotecários realizem operações de consulta, empréstimo, reserva e quitação de multas sem recarregamentos lentos de página. Além disso, há o requisito não-funcional <a href="../docs-RNF/RNF-06 — Acessibilidade.md">RNF-06</a> (<a href="../docs-ADR/ADR-010 - Acessibilidade.md">ADR-010</a>) que exige conformidade com as diretrizes de acessibilidade WCAG 2.1 nível AA.
* **Decisão** Adotar a biblioteca/framework **React.js** para a construção da interface do cliente em arquitetura SPA (*Single Page Application*).
* **Alternativas consideradas**
  * *HTML5/CSS3/JavaScript puro (Vanilla)*: Requererá manipulação manual excessiva do DOM, aumentando o risco de bugs em interfaces complexas.
  * *Vue.js / Angular*: Embora estruturados, a equipe possui maior curva de aprendizado ou menor domínio prático em comparação ao ecossistema React.
* **Consequências**
  * **Vantagens**: Desenvolvimento modular baseado em componentes reutilizáveis; ecossistema maduro com suporte a bibliotecas de acessibilidade (Radix UI / ARIA); separação clara entre a camada de apresentação e a API do back-end.
  * **Desvantagens**: Necessidade de ferramenta de build (ex.: Vite) e gerenciamento de estado no lado do cliente.
* **Referências** 
<a href="../docs-RNF/RNF-06 — Acessibilidade.md">RNF-06</a>, 
<a href="../docs-ADR/ADR-010 - Acessibilidade.md">ADR-010</a>, 
TAP SGBD.