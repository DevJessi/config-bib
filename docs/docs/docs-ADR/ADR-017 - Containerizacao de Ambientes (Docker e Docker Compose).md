# ADR-017: Containerização de Ambientes (Docker &amp; Docker Compose)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** Com uma equipe de 8 desenvolvedores utilizando diferentes sistemas operacionais (Windows, Linux e macOS), existe alto risco de divergências de ambiente (versões do Node.js, configurações do PostgreSQL e variáveis de sistema). Além disso, para fins de avaliação e homologação, é necessário que o professor/avaliador consiga executar toda a aplicação (API, banco de dados e front-end) de forma isolada, rápida e sem necessidade de instalações manuais na máquina hospedeira.
* **Decisão** Adotar o **Docker** para a conteinerização das aplicações e o **Docker Compose** para a orquestração unificada dos serviços do sistema (container da API Node.js/Express, container do banco PostgreSQL e container da aplicação React).
* **Alternativas consideradas**
  * *Instalação nativa direta no SO*: Exige que cada aluno e o professor instalem e configurem manualmente o PostgreSQL e o Node.js, gerando incompatibilidades de versão e falhas de execução.
  * *Máquinas Virtuais (VMs tradicionais)*: Consumo excessivo de memória RAM e processamento, além de tempo de inicialização elevado.
* **Consequências**
  * **Vantagens**: Ambientes de desenvolvimento e avaliação 100% idênticos e reprodutíveis; subida de todo o ecossistema com um único comando (`docker compose up`); isolamento total das dependências sem poluir o sistema operacional local.
  * **Desvantagens**: Exige a instalação do Docker Desktop/Engine nas máquinas e um consumo mínimo de recursos de memória para execução dos containers.
* **Referências** 
<a href="../docs-RNF/RNF-02 — Segurança.md">RNF-02</a>, 
<a href="../docs-ADR/ADR-012 - Ambiente de Execucao e Framework Backend (Node.js l Express.js).md">ADR-012</a>, 
<a href="../docs-ADR/ADR-014 - Sistema de Gerenciamento de Banco de Dados (PostgreSQL).md">ADR-014</a>, 
TAP SGBD.