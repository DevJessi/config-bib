FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Instala só as dependências de produção (node-pg-migrate também está nelas: o serviço "migrate" usa)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

USER node
EXPOSE 3000
CMD ["node", "main.js"]
