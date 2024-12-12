FROM node:20-alpine

WORKDIR /client

COPY package*.json .

RUN npm i

COPY . .

CMD ["npm", "run", "dev"]