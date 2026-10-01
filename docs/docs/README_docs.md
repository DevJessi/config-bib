# 🏛️ Documentação de Arquitetura de Software — SGBD

**Equipe de Arquitetura:**
- **Robert Douglas** 
- **Aline Souza**

---

## 🎯 Objetivo da Pasta `docs/`
Este diretório centraliza toda a especificação técnica, decisões arquiteturais (ADRs), modelagem de dados, contratos de API e padrões de engenharia que sustentam o **Sistema de Gerenciamento de Biblioteca Digital (SGBD)**.

A função da equipe de arquitetura (**Robert Douglas e Aline Souza**) é servir como o pilar técnico do projeto, garantindo que os times de Front-end, Back-end e Banco de Dados desenvolvam soluções alinhadas com as regras de negócio, requisitos não-funcionais (segurança, acessibilidade, LGPD) e restrições estabelecidas na disciplina.

---

## 📂 Organização das Pastas e Artefatos Técnicos

```text
docs/
├── README.md                                  # Este guia interno da equipe de arquitetura
├── docs-ADR/                                  # Registros de Decisões de Arquitetura (ADR-001 a ADR-017)
├── docs-RF/                                   # Requisitos Funcionais do Sistema
├── docs-RN/                                   # Regras de Negócio
├── docs-RNF/                                  # Requisitos Não-Funcionais (LGPD, WCAG 2.1 AA, Performance)
├── docs-US/                                   # User Stories / Histórias de Usuário
│
├── especificacao_modelo_dados_sgbd.docx       # DER / Especificação do Prisma Schema & PostgreSQL
├── especificacao_arquitetura_c4_sgbd.docx      # Diagrama de Contêineres C4 (React, Node, DB, Docker)
├── contrato_api_rest_sgbd.docx                 # Especificação de rotas HTTP, Payloads e JWT
└── estrutura_pastas_arquitetura_sgbd.docx     # Padrão de Camadas (Controllers, Services, Repositories)
```

---

## 📋 Mapeamento Rápido dos Artefatos de Arquitetura

### 1. Decisões Arquiteturais (`docs-ADR/`)
* **ADR-001 a ADR-010**: Regras e decisões funcionais do SGBD (prazos fixos de 15 dias, cadastro de exemplares, trava de multas > R$ 20,00, bloqueio de renovação por reserva ativa, histórico, autenticação JWT, LGPD em 48h e acessibilidade WCAG 2.1 AA).
* **ADR-011 a ADR-017**: Escolhas e justificativas da stack tecnológica (**React.js, Node.js + Express, Prisma ORM, PostgreSQL, Vercel, GitHub Actions e Docker / Docker Compose**).

### 2. Especificações Técnicas (Formatadas em ABNT)
* **`especificacao_modelo_dados_sgbd.docx`**: Guia do modelo relacional e entidades por trás do `schema.prisma`.
* **`especificacao_arquitetura_c4_sgbd.docx`**: Visão C4 Nível 2 (Contêineres) detalhando a integração entre Front-end, API, Banco, Docker e CI/CD.
* **`contrato_api_rest_sgbd.docx`**: Mapeamento de endpoints HTTP, payloads JSON, tokens JWT e códigos de erro.
* **`estrutura_pastas_arquitetura_sgbd.docx`**: Guia do padrão de arquitetura em camadas (Layered Architecture) para organização do código da API.

---

## 🤝 Responsabilidades da Equipe de Arquitetura (Robert & Aline)

1. **Manutenção das ADRs**: Garantir que qualquer nova decisão tecnológica ou mudança de escopo seja registrada e justificada formalmente.
2. **Guia e Suporte às Equipes**: Orientar os times de Back-end, Front-end e DBA na interpretação do contrato de API, diagramas C4 e do schema do Prisma.
<!-- 3. **Garantia de Qualidade & Conformidade**: Avaliar Pull Requests e garantir o cumprimento do padrão em camadas, segurança (JWT) e acessibilidade (WCAG 2.1 AA).
4. **Alinhamento com a Gestão & Professor**: Defender as decisões de arquitetura e garantir a aderência às entregas do cronograma do projeto. -->
