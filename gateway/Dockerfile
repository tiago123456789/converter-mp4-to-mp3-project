FROM node:16.14.0-alpine3.15

WORKDIR app/

COPY package.json package-lock.json ./

COPY . ./

RUN npm install 

CMD ["npm", "run", "start:dev"]


