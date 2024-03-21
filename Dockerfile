FROM node:lts-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
COPY Docker.env .env
CMD ["node", "app.js"]
EXPOSE 7867