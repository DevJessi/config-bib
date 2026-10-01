# 📄 Guia dos Documentos de Arquitetura (`prisma/`)

Se você abriu esta pasta e encontrou arquivos `.docx` ao lado do `schema.prisma`, este guia rápido explica **o que é cada documento** e **qual a sua utilidade**:

---

### 1. `especificacao_modelo_dados_sgbd.docx`
* **O que é:** Especificação técnica do Banco de Dados e DER.
* **Para que serve:** Explica a justificativa de cada tabela, campo e relacionamento do `schema.prisma`, conectando o modelo relacional às regras de negócio das ADRs (exemplares, multas, LGPD, etc.).

### 2. `especificacao_arquitetura_c4_sgbd.docx`
* **O que é:** Visão Geral da Arquitetura (Modelo C4 - Contêineres).
* **Para que serve:** Detalha a integração visual e de infraestrutura entre o React, a API Node.js, o PostgreSQL, o Docker Compose e as pipelines de CI/CD.

### 3. `contrato_api_rest_sgbd.docx`
* **O que é:** Contrato de API REST (Mapeamento de Rotas).
* **Para que serve:** Especifica todos os endpoints HTTP (`GET`, `POST`, `DELETE`), cabeçalhos de autenticação JWT e os JSONs de entrada/saída esperados pelo sistema.

### 4. `estrutura_pastas_arquitetura_sgbd.docx`
* **O que é:** Padrão de Arquitetura em Camadas (Layered Architecture).
* **Para que serve:** Guia de organização do código (`controllers/` → `services/` → `repositories/` → `middlewares/`) para garantir que o desenvolvimento da API siga um padrão limpo e desacoplado.

---
📌 **Resumo prático:** O `schema.prisma` é o código de migração do banco; os arquivos `.docx` são os manuais e contratos técnicos que explicam o porquê de cada regra e endpoint.
