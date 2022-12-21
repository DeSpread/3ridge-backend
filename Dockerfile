FROM node:18.12.1-alpine

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY . .

#RUN yarn build