require("dotenv").config()
const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const app = express();

const ensureAuthenticated = require("./middlewares/ensure-authenticated.middleware")
const authServiceProxy = createProxyMiddleware({
    "target": process.env.AUTH_SERVICE,
    "secure": false
})
const converterServiceProxy = createProxyMiddleware({
    "target": process.env.CONVERTER_SERVICE,
    "secure": false
})

app.use("/auth", authServiceProxy);
app.use("/files/:id", converterServiceProxy)
app.use("/files", ensureAuthenticated, converterServiceProxy)


app.listen(3001, () => console.log("Server is running at http://localhost:3001"))