FROM node:lts-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
COPY .env.docker .env
# Generate JWT signing key
RUN mkdir secrets
RUN tr -dc A-Za-z0-9/+ </dev/urandom | head -c 128 > secrets/token_secret.txt; echo
RUN tr -dc A-Za-z0-9/+ </dev/urandom | head -c 128 > secrets/refresh_token_secret.txt; echo
CMD ["node", "app.js"]
EXPOSE 8080