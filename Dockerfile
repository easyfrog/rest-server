FROM node:lts-alpine
WORKDIR /usr/src/app

# install pm2
RUN npm install pm2 -g

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# run npm start to start the server
CMD npm start

