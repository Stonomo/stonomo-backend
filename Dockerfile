FROM node:lts-slim
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "app.js"]
EXPOSE 7867