FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

# Instala só as dependências de produção (node-pg-migrate também está nelas: o serviço "migrate" usa)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["node", "main.js"]
