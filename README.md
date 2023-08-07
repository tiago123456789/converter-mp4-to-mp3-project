## ABOUT

The study project to learn more about microservices where the project has focus convert mp4 to mp3 file.

This project is a result the lecture https://www.youtube.com/watch?v=hmkF77F9TLw

## FEATURES 
- Convert mp4 to mp3 file.
- Notify via email mp3 file converted.
- Delete mp3 file converted after 30 days.

## TECHNOLOGIES

#### AUTH SERVICE
- Node.js
- Nest.js
- Typescript
- Postgresql
- Docker
- Docker compose
- Jest(unit tests)

#### CONVERTER SERVICE
- Node.js
- Nest.js
- Typescript
- Mongodb
- Docker
- Docker compose
- Jest(unit tests)
- Message queue(bull + redis)

#### NOTIFICATION SERVICE
- Node.js
- Nest.js
- Typescript
- Docker
- Docker compose
- Jest(unit tests)
- Message queue(bull + redis)
- Smtp(to send email)

#### GATEWAY SERVICE
- Node.js
- Javascript
- Express.js

## ARCHITECTURE
![Architecture the project](./architecture-converter-mp4-to-mp3-file.drawio.png)

## INSTRUCTIONS TO RUN LOCALLY