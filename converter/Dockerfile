FROM node:16.14.0-alpine3.15

WORKDIR app/

COPY package.json package-lock.json ./

COPY . ./

RUN apk update

RUN apk upgrade

RUN apk add --no-cache ffmpeg

RUN npm install 

RUN npm run build

RUN mkdir -p files-processing

CMD ["node", "./dist/main.js"]


