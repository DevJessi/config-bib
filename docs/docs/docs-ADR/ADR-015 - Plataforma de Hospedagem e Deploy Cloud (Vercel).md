# ADR-015: Plataforma de Hospedagem e Deploy Cloud (Vercel)

* **Status**: Concluído 
* **Data**: 2026-09-17
* **Contexto** A aplicação precisa estar disponível publicamente em ambiente de produção com suporte a HTTPS/SSL nativo (essencial para tráfego seguro de senhas e tokens JWT - <a href="../docs-ADR/ADR-007 - Autenticacao Login l Logout.md">ADR-007</a>) e custo de infraestrutura igual a R$ 0,00.
* **Decisão** Utilizar a plataforma **Vercel** para hospedagem e deploy automatizado do front-end e das Serverless Functions / API Node.js.
* **Alternativas consideradas**
  * *AWS (EC2/S3)*: Alta complexidade de configuração de redes, DNS e risco de cobrança acidental em dólar.
  * *Heroku*: Descontinuou o plano totalmente gratuito para bancos e servidores.
* **Consequências**
  * **Vantagens**: Deploy automático e instantâneo integrado aos commits do GitHub; domínio seguro com certificado HTTPS automático sem custo; excelente velocidade de entrega via CDN global.
  * **Desvantagens**: Limite de tempo de execução de requisições serverless no plano gratuito (suficiente para este sistema).
* **Referências** 
<a href="../docs-ADR/ADR-002 - Cadastro de exemplares.md">RNF-02</a>, 
<a href="../docs-ADR/ADR-007 - Autenticacao Login l Logout.md">ADR-007</a>, 
TAP SGBD.