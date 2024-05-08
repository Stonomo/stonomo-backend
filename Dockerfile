FROM node:lts-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
COPY .env.docker .env
# Generate JWT signing key
RUN mkdir secrets
RUN tr -dc A-Za-z0-9 </dev/urandom | head -c 13 > secrets/token_secret; echo
CMD ["node", "app.js"]
EXPOSE 8080