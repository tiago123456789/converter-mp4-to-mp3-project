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
- Cloudwatch(register logs the application)

#### NOTIFICATION SERVICE
- Node.js
- Nest.js
- Typescript
- Docker
- Docker compose
- Jest(unit tests)
- Message queue(bull + redis)
- Smtp(to send email)
- Cloudwatch(register logs the application)

#### GATEWAY SERVICE
- Node.js
- Javascript
- Express.js

## ARCHITECTURE
![Architecture the project](./architecture-converter-mp4-to-mp3-file.drawio.png)

#### Explain the architecture flow
1º step - Client application(app mobile, app web or cli) make request to application and Kubernetes receive via ingress.
2º step - Ingress redirect to gateway service where gateway service is only point access and responsable to distribute request to another application.
3º step - Send request to authenticate and check if token is valid.
4º step - Make query in database.
5º step - Check if access token is valid, if valid, forward requesto to converter service when make upload file to mongodb. and after send data to message queue.
6º step - After 5º step send data to message queue.
7º step - Notification service consume message of queue.
8º step - Notify via email mp3 file converted success. 



## INSTRUCTIONS TO RUN LOCALLY

#### AUTH SERVICE
- Clone project
- Access directory **auth**
- Create **.env** file based **.env.example** file
- Execute command **npm i** to install packages
- Execute command **docker-compose up -d** the application is running at http://localhost:3000

#### CONVERTER SERVICE
- Clone project
- Access directory **converter**
- Create **.env** file based **.env.example** file
- Execute command **npm i** to install packages
- Execute command **docker-compose up -d** the application is running at http://localhost:3002

#### NOTIFICATION SERVICE
- Clone project
- Access directory **notification**
- Create **.env** file based **.env.example** file
- Execute command **npm i** to install packages
- Execute command **docker-compose up -d** the application run

#### GATEWAY SERVICE
- Clone project
- Access directory **gateway**
- Create **.env** file based **.env.example** file
- Execute command **npm i** to install packages
- Execute all commands to run servies: **auth**, **converter** and **notification**.
- Execute command **docker-compose up -d** the application run at http://localhost:3001

## INSTRUCTIONS TO RUN PROJECT IN KUBERNTES WITH MINIKUBE

- Install minikube.
- Install nginx ingress in minikube.
- Install kubectl(cli) to interact kubernetes.
- Rename **infra/auth/secret.example.yml** to **infra/auth/secret.yml** and fill envs.
- Rename **infra/converter/app-secret.example.yml** to **infra/converter/app-secret.yml** and fill envs.
- Rename **infra/notification/secret.example.yml** to **infra/notification/secret.yml** and fill envs.
- Execute command **kubectl apply -f infra/auth/ && kubectl apply -f infra/converter/ && kubectl apply -f infra/notification/ && kubectl apply -f infra/gateway/**
- Execute command **minikube ip** to get minikube ip.
- Add this line **ip_before_step_here   mp3converter.com** in file /etc/hosts
- Execute command **minikube tunnel** and now you can access api using domain **mp3converter.com**