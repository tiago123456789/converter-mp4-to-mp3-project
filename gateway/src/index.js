require("dotenv").config()
const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const app = express();

const routes = require("../routes.json")
const command = require("./commands")
const ensureAuthenticated = require("./middlewares/ensure-authenticated.middleware")

for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index]
    let handler;

    if (route.proxyOptions) {
        handler = createProxyMiddleware(route.proxyOptions)
    } else if (route.customFunction) {
        handler = command[route.customFunction]
    }

    if (route.enableAuthorization) {
        app.use(route.path, ensureAuthenticated, handler)
        continue;
    }

    app.use(route.path, handler)
}

app.listen(3001, () => console.log("Server is runnint at http://localhost:3001"))