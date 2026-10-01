# ADR-002: Cadastro de exemplares
- **Status**: Concluído   
- **Data**: 2026-09-15  
- **Contexto**  
<a href="../docs-RF/RF-002 — Cadastro de livros e exemplares.md">RF-002</a> prevê cadastro de livros, mas não contempla exemplares. Isso dificulta reservas e controle de disponibilidade.  
- **Decisão**  
Adicionar cadastro de exemplares vinculados ao livro.  
- **Alternativas consideradas**  
  - Manter apenas cadastro de livros.  
  - Controle manual fora do sistema.  
- **Consequências**  
  - Controle preciso de disponibilidade.  
  - Facilita reservas e histórico.  
  - Aumenta complexidade do banco.  
- **Referências**  
<a href="../docs-RF/RF-002 — Cadastro de livros e exemplares.md">RF-002</a>, 
<a href="../docs-RF/RF-003 — Buscar livros no acervo.md">RF-003</a>, 
<a href="../docs-US/US-01 — Buscar livro no acervo.md">US-01</a>, 
<a href="../docs-US/US-04 — Reservar livro indisponível.md">US-04</a>.

<!-- Por que isso é um problema? (Comentei aqui para dar mais contexto ainda e para não zoar o documento acima.)
    Simples, se o sistema não sabe quantos exemplares físicos existem na vida real, acontecem os seguintes erros:
        * Controle de disponibilidade: Se o sistema só sabe que o livro "Dragões de Éter" por exemplo, existe, ele não sabe dizer se existem 5 ou 0 cópias disponíveis na prateleira hoje.
        
        * Dificuldade em reservas: Se um usuário quiser reservar o livro, o sistema não consegue gerenciar qual cópia física vai ficar separada para ele ou quem está com qual cópia emprestada.
        
    Em resumo: O sistema sabe que o livro existe no catálogo, mas não sabe gerenciar as cópias físicas dele. O problema principal aqui é a diferença entre o conceito de um livro e o objeto físico (o exemplar). 
-->