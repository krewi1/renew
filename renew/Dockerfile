FROM node:10

WORKDIR /app

COPY package.json .
RUN npm install
COPY ./dist .
ENTRYPOINT ["node", "index.js"]