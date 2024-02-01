FROM node:lts-slim
WORKDIR /app
COPY . .
# COPY .env .
RUN npm install
CMD ["node", "app.js"]
EXPOSE 7867