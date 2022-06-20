FROM node:14.18.0-slim

WORKDIR /usr/src/app

COPY package.json tsconfig.json src .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
