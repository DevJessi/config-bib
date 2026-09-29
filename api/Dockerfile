FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

# --watch vai servir para reiniciar o processo do node, sempre que houver alterações, será útil lá na frente
CMD ["node", "--watch"]