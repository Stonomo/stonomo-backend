FROM node:lts-slim
WORKDIR /app
COPY . .
COPY Docker.env .env
RUN npm install
CMD ["node", "app.js"]
EXPOSE 7867