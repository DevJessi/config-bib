
# US-01 — Buscar livro no acervo

## Identificação

* **Código:** US-01
* **Nome:** Buscar livro no acervo
* **Tipo:** User Story
* **Ator relacionado:** Leitor
* **Prioridade:** Must
* **Pontos:** 3

## User Story

**Como** leitor, **eu quero** buscar livros por título, autor ou edição **para que** eu encontre rapidamente o livro que preciso.

## Critérios de aceitação

* **Given** que estou na página inicial

* **When** digito "harry" no campo de busca

* **Then** o sistema exibe os livros que possuem "harry" no título ou autor.

* **Given** que existem livros correspondentes à pesquisa

* **When** os resultados são exibidos

* **Then** o sistema apresenta a situação dos exemplares, como disponível, emprestado ou reservado.

## Definition of Done

* Testes Jest implementados e aprovados.
* Lint executado sem erros.
* Preview funcionando na Vercel.


