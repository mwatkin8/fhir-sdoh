FROM node:11-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

EXPOSE 5050
CMD [ "npm", "run", "start-server" ]
