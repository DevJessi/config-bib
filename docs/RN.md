# Regras de Negocio (RN)

Este documento define as regras que determinam o comportamento do sistema de biblioteca. As regras devem ser aplicadas independentemente da interface utilizada, seja painel técnico, aplicação web ou integração por API.

## RN-001 - Limite de emprestimos ativos

**Nome:** Limite de empréstimos por leitor.

**Descrição detalhada:** Um leitor pode manter no máximo 5 empréstimos ativos ao mesmo tempo. Um empréstimo só deixa de ser contabilizado quando o exemplar é devolvido e a devolução é registrada no sistema. O sistema deve impedir um novo empréstimo quando o limite já tiver sido atingido e informar o motivo de forma objetiva.

**User story:**

> Como leitor, quero saber quantos empréstimos ativos possuo para acompanhar minha situação e solicitar novos livros dentro do limite permitido.

**BDD:**

```gherkin
Funcionalidade: Limitar empréstimos ativos

  Cenário: Leitor possui menos de cinco empréstimos ativos
    Dado que o leitor possui 4 empréstimos ativos
    Quando um técnico registra um novo empréstimo para esse leitor
    Então o sistema deve permitir o empréstimo
    E o leitor deve passar a ter 5 empréstimos ativos

  Cenário: Leitor já atingiu o limite
    Dado que o leitor possui 5 empréstimos ativos
    Quando alguém tenta registrar outro empréstimo para esse leitor
    Então o sistema deve recusar a operação
    E deve informar que o limite de 5 empréstimos ativos foi atingido
```

## RN-002 - Prazo de devolucao

**Nome:** Prazo padrão de empréstimo.

**Descrição detalhada:** Cada empréstimo tem prazo padrão de 5 dias corridos, contado a partir da data e hora de sua confirmação. O sistema deve armazenar a data prevista de devolução e utilizá-la para lembretes e cálculo de atraso.

**User story:**

> Como leitor, quero visualizar a data de devolução de cada empréstimo para me organizar e devolver os exemplares no prazo.

**BDD:**

```gherkin
Funcionalidade: Definir prazo de empréstimo

  Cenário: Registrar um novo empréstimo
    Dado que o empréstimo foi confirmado em 10/09/2026 às 14:00
    Quando o sistema calcular o prazo de devolução
    Então a data prevista deve ser 15/09/2026 às 14:00
    E essa data deve ficar disponível no histórico do leitor
```
