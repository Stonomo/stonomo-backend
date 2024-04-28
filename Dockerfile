FROM node:lts-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
COPY .env.docker .env
CMD ["node", "app.js"]
EXPOSE 7867